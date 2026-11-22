
"use strict";

const jwt = require("jsonwebtoken");

function verificarToken(req, res, next) {
  const autorizacion = req.headers.authorization;

  if (!autorizacion || !autorizacion.startsWith("Bearer ")) {
    return res.status(401).json({
      mensaje: "Acceso denegado. Debes iniciar sesión"
    });
  }

  const token = autorizacion.split(" ")[1];

  if (!token) {
    return res.status(401).json({
      mensaje: "Token no proporcionado"
    });
  }

  try {
    const datos = jwt.verify(token, process.env.JWT_SECRET);

    if (!datos.id) {
      return res.status(401).json({
        mensaje: "Token inválido"
      });
    }

    req.usuario = {
      id: datos.id,
      correo: datos.correo
    };

    next();

  } catch (error) {
    return res.status(401).json({
      mensaje: "Token inválido o expirado"
    });
  }
}

module.exports = verificarToken;
