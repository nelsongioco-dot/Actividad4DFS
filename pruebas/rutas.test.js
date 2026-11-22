
"use strict";

const request = require("supertest");
const app = require("../server");

describe("Pruebas automáticas - Actividad 4", () => {

  test("El servidor responde correctamente", async () => {
    const respuesta = await request(app)
      .get("/api/estado");

    expect(respuesta.status).toBe(200);
    expect(respuesta.body.baseDatos).toBe("MongoDB Atlas");
  });

  test("No permite consultar productos sin JWT", async () => {
    const respuesta = await request(app)
      .get("/api/productos");

    expect(respuesta.status).toBe(401);
  });

  test("No permite crear productos sin JWT", async () => {
    const respuesta = await request(app)
      .post("/api/productos")
      .send({ nombre: "Prueba", precio: 100 });

    expect(respuesta.status).toBe(401);
  });

  test("No permite modificar productos sin JWT", async () => {
    const respuesta = await request(app)
      .put("/api/productos/123")
      .send({ precio: 200 });

    expect(respuesta.status).toBe(401);
  });

  test("No permite eliminar productos sin JWT", async () => {
    const respuesta = await request(app)
      .delete("/api/productos/123");

    expect(respuesta.status).toBe(401);
  });

  test("Rechaza un token inválido", async () => {
    const respuesta = await request(app)
      .get("/api/productos")
      .set("Authorization", "Bearer token_invalido");

    expect(respuesta.status).toBe(401);
  });

  test("Rechaza un registro con datos incompletos", async () => {
    const respuesta = await request(app)
      .post("/api/auth/registro")
      .send({ nombre: "Usuario" });

    expect(respuesta.status).toBe(400);
  });

  test("Rechaza un login sin credenciales", async () => {
    const respuesta = await request(app)
      .post("/api/auth/login")
      .send({});

    expect(respuesta.status).toBe(400);
  });

});