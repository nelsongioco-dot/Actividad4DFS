
"use strict";

require("dotenv").config();

const express = require("express");
const cors = require("cors");
const path = require("path");

const conectarMongo = require("./conexionMongo");
const authRoutes = require("./auth");
const productosRoutes = require("./productos");

const app = express();

// Configuración del servidor
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

// Comprobar que el servidor funciona
app.get("/api/estado", (req, res) => {
  res.json({
    mensaje: "Servidor de productos funcionando",
    baseDatos: "MongoDB Atlas"
  });
});

// Rutas de autenticación
app.use("/api/auth", authRoutes);

// Rutas de productos protegidas con JWT
app.use("/api/productos", productosRoutes);

// Manejo de rutas inexistentes
app.use((req, res) => {
  res.status(404).json({
    mensaje: "Ruta no encontrada"
  });
});

// Manejo general de errores
app.use((error, req, res, next) => {
  console.error("Error del servidor:", error.message);

  res.status(500).json({
    mensaje: "Error interno del servidor"
  });
});

const PORT = process.env.PORT || 3000;

// Conectar MongoDB antes de iniciar el servidor
async function iniciarServidor() {
  try {
    await conectarMongo();

    app.listen(PORT, () => {
      console.log(`Servidor funcionando en http://localhost:${PORT}`);
    });

  } catch (error) {
    console.error("No se pudo iniciar el servidor:", error.message);
    process.exit(1);
  }
}

if (require.main === module) {
  iniciarServidor();
}

module.exports = app;
