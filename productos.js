
"use strict";

const express = require("express");
const verificarToken = require("./verificarToken");

const {
  crearProducto,
  obtenerProductos,
  actualizarProducto,
  eliminarProducto
} = require("./controladores/productosController");

const router = express.Router();

router.use(verificarToken);

router.get("/", obtenerProductos);
router.post("/", crearProducto);
router.put("/:id", actualizarProducto);
router.delete("/:id", eliminarProducto);

module.exports = router;
