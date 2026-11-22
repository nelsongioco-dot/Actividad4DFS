
"use strict";

// Actividad 4 - Desarrollo Full Stack
// Pruebas unitarias con Jest.
// Generadas con apoyo de ChatGPT y revisadas con GitHub Copilot.
// Se agregó una prueba para rechazar existencias decimales.

// Simulamos MongoDB para no modificar datos reales.
jest.mock("../modelos/Producto", () => ({
  create: jest.fn(),
  find: jest.fn(),
  findOneAndUpdate: jest.fn(),
  findOneAndDelete: jest.fn()
}));

const Producto = require("../modelos/Producto");

const {
  crearProducto,
  obtenerProductos,
  actualizarProducto,
  eliminarProducto
} = require("../controladores/productosController");

// ID válido para las pruebas.
const ID = "507f1f77bcf86cd799439011";

let req;
let res;

beforeEach(() => {
  jest.clearAllMocks();

  req = {
    usuario: { id: "usuario123" },
    params: { id: ID },
    body: {}
  };

  res = {
    status: jest.fn().mockReturnThis(),
    json: jest.fn().mockReturnThis()
  };

  // Evita mostrar errores simulados durante las pruebas.
  jest.spyOn(console, "error").mockImplementation(() => {});
});

afterEach(() => {
  jest.restoreAllMocks();
});

// ===================================
// PRUEBAS PARA CREAR PRODUCTOS
// ===================================

describe("Crear productos", () => {

  test("Crea correctamente un producto", async () => {
    req.body = {
      nombre: "  Laptop HP  ",
      precio: 15000,
      stock: 5
    };

    const producto = {
      _id: ID,
      nombre: "Laptop HP",
      precio: 15000,
      stock: 5
    };

    Producto.create.mockResolvedValue(producto);

    await crearProducto(req, res);

    expect(Producto.create).toHaveBeenCalledWith({
      nombre: "Laptop HP",
      descripcion: "",
      precio: 15000,
      stock: 5,
      usuario: "usuario123"
    });

    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith(producto);
  });

  test("Rechaza productos con datos inválidos", async () => {
    req.body = {
      nombre: "",
      precio: -100,
      stock: -2
    };

    await crearProducto(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(Producto.create).not.toHaveBeenCalled();
  });

  test("Controla errores al guardar productos", async () => {
    req.body = {
      nombre: "Laptop",
      precio: 5000
    };

    Producto.create.mockRejectedValue(
      new Error("Error de base de datos")
    );

    await crearProducto(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
  });

});

// ===================================
// PRUEBAS PARA CONSULTAR PRODUCTOS
// ===================================

describe("Consultar productos", () => {

  test("Obtiene los productos del usuario", async () => {
    const productos = [
      { nombre: "Laptop", precio: 15000 },
      { nombre: "Mouse", precio: 350 }
    ];

    const ordenar = jest.fn().mockResolvedValue(productos);

    Producto.find.mockReturnValue({
      sort: ordenar
    });

    await obtenerProductos(req, res);

    expect(Producto.find).toHaveBeenCalledWith({
      usuario: "usuario123"
    });

    expect(ordenar).toHaveBeenCalledWith({
      createdAt: -1
    });

    expect(res.json).toHaveBeenCalledWith(productos);
  });

  test("Controla errores al consultar productos", async () => {
    Producto.find.mockReturnValue({
      sort: jest.fn().mockRejectedValue(
        new Error("Error de consulta")
      )
    });

    await obtenerProductos(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
  });

});

// ===================================
// PRUEBAS PARA ACTUALIZAR PRODUCTOS
// ===================================

describe("Actualizar productos", () => {

  test("Actualiza correctamente un producto", async () => {
    req.body = {
      nombre: "  Laptop HP Pro  ",
      precio: 18000,
      stock: 8
    };

    const actualizado = {
      _id: ID,
      nombre: "Laptop HP Pro",
      precio: 18000,
      stock: 8
    };

    Producto.findOneAndUpdate.mockResolvedValue(actualizado);

    await actualizarProducto(req, res);

    expect(Producto.findOneAndUpdate).toHaveBeenCalledWith(
      { _id: ID, usuario: "usuario123" },
      {
        $set: {
          nombre: "Laptop HP Pro",
          precio: 18000,
          stock: 8
        }
      },
      { new: true, runValidators: true }
    );

    expect(res.json).toHaveBeenCalledWith(actualizado);
  });

  test("Rechaza un ID inválido", async () => {
    req.params.id = "incorrecto";
    req.body = { precio: 200 };

    await actualizarProducto(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(Producto.findOneAndUpdate).not.toHaveBeenCalled();
  });

  test("Rechaza un precio negativo", async () => {
    req.body = { precio: -100 };

    await actualizarProducto(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(Producto.findOneAndUpdate).not.toHaveBeenCalled();
  });

  // ===================================
  // MEJORA RECOMENDADA POR GITHUB COPILOT
  // ===================================

  test("Rechaza existencias con decimales", async () => {
    req.body = { stock: 1.5 };

    await actualizarProducto(req, res);

    expect(res.status).toHaveBeenCalledWith(400);

    expect(res.json).toHaveBeenCalledWith({
      mensaje: "Existencias inválidas"
    });

    expect(Producto.findOneAndUpdate).not.toHaveBeenCalled();
  });

  // ===================================

  test("Rechaza modificaciones vacías", async () => {
    req.body = {};

    await actualizarProducto(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(Producto.findOneAndUpdate).not.toHaveBeenCalled();
  });

  test("Detecta productos inexistentes", async () => {
    req.body = { precio: 200 };

    Producto.findOneAndUpdate.mockResolvedValue(null);

    await actualizarProducto(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
  });

  test("Controla errores al actualizar", async () => {
    req.body = { precio: 200 };

    Producto.findOneAndUpdate.mockRejectedValue(
      new Error("Error de actualización")
    );

    await actualizarProducto(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
  });

});

// ===================================
// PRUEBAS PARA ELIMINAR PRODUCTOS
// ===================================

describe("Eliminar productos", () => {

  test("Elimina correctamente un producto", async () => {
    Producto.findOneAndDelete.mockResolvedValue({
      _id: ID,
      nombre: "Laptop HP"
    });

    await eliminarProducto(req, res);

    expect(Producto.findOneAndDelete).toHaveBeenCalledWith({
      _id: ID,
      usuario: "usuario123"
    });

    expect(res.json).toHaveBeenCalledWith({
      mensaje: "Producto eliminado correctamente"
    });
  });

  test("Rechaza eliminar con ID inválido", async () => {
    req.params.id = "incorrecto";

    await eliminarProducto(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(Producto.findOneAndDelete).not.toHaveBeenCalled();
  });

  test("Detecta productos inexistentes al eliminar", async () => {
    Producto.findOneAndDelete.mockResolvedValue(null);

    await eliminarProducto(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
  });

  test("Controla errores al eliminar", async () => {
    Producto.findOneAndDelete.mockRejectedValue(
      new Error("Error de eliminación")
    );

    await eliminarProducto(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
  });

});
