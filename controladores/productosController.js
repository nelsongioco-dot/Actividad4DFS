
"use strict";

const mongoose = require("mongoose");
const Producto = require("../modelos/Producto");

// Crear un producto
exports.crearProducto = async (req, res) => {
  try {
    const { nombre, descripcion = "", precio, stock = 0 } = req.body || {};

    if (
      typeof nombre !== "string" ||
      !nombre.trim() ||
      typeof descripcion !== "string" ||
      typeof precio !== "number" ||
      !Number.isFinite(precio) ||
      precio < 0 ||
      !Number.isInteger(stock) ||
      stock < 0
    ) {
      return res.status(400).json({
        mensaje: "Revisa el nombre, precio y existencias del producto"
      });
    }

    const producto = await Producto.create({
      nombre: nombre.trim(),
      descripcion,
      precio,
      stock,
      usuario: req.usuario.id
    });

    return res.status(201).json(producto);
  } catch (error) {
    console.error("Error al crear producto:", error.message);
    return res.status(500).json({
      mensaje: "No se pudo crear el producto"
    });
  }
};

// Consultar los productos del usuario
exports.obtenerProductos = async (req, res) => {
  try {
    const productos = await Producto.find({
      usuario: req.usuario.id
    }).sort({ createdAt: -1 });

    return res.json(productos);
  } catch (error) {
    console.error("Error al consultar productos:", error.message);
    return res.status(500).json({
      mensaje: "No se pudieron consultar los productos"
    });
  }
};

// Modificar un producto
exports.actualizarProducto = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({ mensaje: "ID inválido" });
    }

    const datos = req.body || {};
    const cambios = {};

    if (Object.hasOwn(datos, "nombre")) {
      if (typeof datos.nombre !== "string" || !datos.nombre.trim()) {
        return res.status(400).json({ mensaje: "Nombre inválido" });
      }
      cambios.nombre = datos.nombre.trim();
    }

    if (Object.hasOwn(datos, "descripcion")) {
      if (typeof datos.descripcion !== "string") {
        return res.status(400).json({ mensaje: "Descripción inválida" });
      }
      cambios.descripcion = datos.descripcion;
    }

    if (Object.hasOwn(datos, "precio")) {
      if (typeof datos.precio !== "number" || !Number.isFinite(datos.precio) || datos.precio < 0) {
        return res.status(400).json({ mensaje: "Precio inválido" });
      }
      cambios.precio = datos.precio;
    }

    if (Object.hasOwn(datos, "stock")) {
      if (!Number.isInteger(datos.stock) || datos.stock < 0) {
        return res.status(400).json({ mensaje: "Existencias inválidas" });
      }
      cambios.stock = datos.stock;
    }

    if (Object.keys(cambios).length === 0) {
      return res.status(400).json({ mensaje: "No hay datos válidos para modificar" });
    }

    const producto = await Producto.findOneAndUpdate(
      { _id: id, usuario: req.usuario.id },
      { $set: cambios },
      { new: true, runValidators: true }
    );

    if (!producto) {
      return res.status(404).json({ mensaje: "Producto no encontrado" });
    }

    return res.json(producto);
  } catch (error) {
    console.error("Error al actualizar producto:", error.message);
    return res.status(500).json({
      mensaje: "No se pudo actualizar el producto"
    });
  }
};

// Eliminar un producto
exports.eliminarProducto = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({ mensaje: "ID inválido" });
    }

    const producto = await Producto.findOneAndDelete({
      _id: id,
      usuario: req.usuario.id
    });

    if (!producto) {
      return res.status(404).json({ mensaje: "Producto no encontrado" });
    }

    return res.json({
      mensaje: "Producto eliminado correctamente"
    });
  } catch (error) {
    console.error("Error al eliminar producto:", error.message);
    return res.status(500).json({
      mensaje: "No se pudo eliminar el producto"
    });
  }
};
