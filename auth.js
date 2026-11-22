
"use strict";

const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const Usuario = require("./modelos/Usuario");

const router = express.Router();

// Registrar un usuario.
router.post("/registro", async (req, res) => {
  const { nombre, correo, contrasena } = req.body || {};

  if (
    typeof nombre !== "string" ||
    typeof correo !== "string" ||
    typeof contrasena !== "string" ||
    !nombre.trim() ||
    !correo.trim() ||
    contrasena.length < 8
  ) {
    return res.status(400).json({
      mensaje: "Ingresa nombre, correo y contraseña de al menos 8 caracteres"
    });
  }

  try {
    const correoLimpio = correo.trim().toLowerCase();

    const existente = await Usuario.findOne({
      correo: correoLimpio
    });

    if (existente) {
      return res.status(409).json({
        mensaje: "Este correo ya está registrado"
      });
    }

    const contrasenaSegura = await bcrypt.hash(contrasena, 10);

    await Usuario.create({
      nombre: nombre.trim(),
      correo: correoLimpio,
      contrasena: contrasenaSegura
    });

    return res.status(201).json({
      mensaje: "Usuario registrado correctamente"
    });

  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({
        mensaje: "Este correo ya está registrado"
      });
    }

    console.error("Error de registro:", error.message);

    return res.status(500).json({
      mensaje: "No se pudo registrar el usuario"
    });
  }
});

// Iniciar sesión.
router.post("/login", async (req, res) => {
  const { correo, contrasena } = req.body || {};

  if (
    typeof correo !== "string" ||
    typeof contrasena !== "string" ||
    !correo.trim() ||
    !contrasena
  ) {
    return res.status(400).json({
      mensaje: "Ingresa tu correo y contraseña"
    });
  }

  try {
    const usuario = await Usuario.findOne({
      correo: correo.trim().toLowerCase()
    }).select("+contrasena");

    if (!usuario) {
      return res.status(401).json({
        mensaje: "Correo o contraseña incorrectos"
      });
    }

    const contrasenaCorrecta = await bcrypt.compare(
      contrasena,
      usuario.contrasena
    );

    if (!contrasenaCorrecta) {
      return res.status(401).json({
        mensaje: "Correo o contraseña incorrectos"
      });
    }

    const token = jwt.sign(
      {
        id: usuario._id.toString(),
        correo: usuario.correo
      },
      process.env.JWT_SECRET,
      { expiresIn: "2h" }
    );

    return res.json({
      mensaje: "Inicio de sesión correcto",
      token,
      usuario: {
        id: usuario._id.toString(),
        nombre: usuario.nombre,
        correo: usuario.correo
      }
    });

  } catch (error) {
    console.error("Error de login:", error.message);

    return res.status(500).json({
      mensaje: "No se pudo iniciar sesión"
    });
  }
});

module.exports = router;
