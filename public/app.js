
"use strict";

// ELEMENTOS DE LA PÁGINA
const $ = (id) => document.getElementById(id);

const vistas = {
  login: $("seccion-login"),
  registro: $("seccion-registro"),
  productos: $("seccion-productos")
};

// Sesión del usuario
let token = sessionStorage.getItem("actividad4_token") || "";
let usuario = null;

try {
  usuario = JSON.parse(
    sessionStorage.getItem("actividad4_usuario") || "null"
  );
} catch {
  sessionStorage.clear();
  token = "";
}

// MOSTRAR PANTALLAS
function mostrarVista(nombre) {
  Object.entries(vistas).forEach(([clave, elemento]) => {
    elemento.hidden = clave !== nombre;
  });
}

function mensaje(id, texto) {
  $(id).textContent = texto;
}

// PETICIONES AL SERVIDOR
async function solicitar(ruta, metodo = "GET", datos = null, protegido = false) {
  const opciones = {
    method: metodo,
    headers: {}
  };

  if (datos !== null) {
    opciones.headers["Content-Type"] = "application/json";
    opciones.body = JSON.stringify(datos);
  }

  if (protegido) {
    opciones.headers.Authorization = `Bearer ${token}`;
  }

  const respuesta = await fetch(ruta, opciones);
  const resultado = await respuesta.json();

  if (!respuesta.ok) {
    if (respuesta.status === 401 && protegido) {
      cerrarSesion();
    }

    throw new Error(resultado.mensaje || "Ocurrió un error");
  }

  return resultado;
}

// CAMBIAR ENTRE LOGIN Y REGISTRO
$("ir-registro").addEventListener("click", () => {
  mensaje("mensaje-registro", "");
  mostrarVista("registro");
});

$("ir-login").addEventListener("click", () => {
  mensaje("mensaje-login", "");
  mostrarVista("login");
});

// REGISTRAR USUARIO
$("formulario-registro").addEventListener("submit", async (evento) => {
  evento.preventDefault();

  const boton = evento.currentTarget.querySelector(
    'button[type="submit"]'
  );

  const datos = {
    nombre: $("nombre-registro").value.trim(),
    correo: $("correo-registro").value.trim(),
    contrasena: $("contrasena-registro").value
  };

  boton.disabled = true;

  try {
    await solicitar("/api/auth/registro", "POST", datos);

    $("formulario-registro").reset();
    $("correo-login").value = datos.correo;

    mostrarVista("login");
    mensaje(
      "mensaje-login",
      "Cuenta creada correctamente. Ya puedes iniciar sesión."
    );

  } catch (error) {
    mensaje("mensaje-registro", error.message);
  } finally {
    boton.disabled = false;
  }
});

// INICIAR SESIÓN
$("formulario-login").addEventListener("submit", async (evento) => {
  evento.preventDefault();

  const boton = $("boton-login");
  boton.disabled = true;

  try {
    const resultado = await solicitar("/api/auth/login", "POST", {
      correo: $("correo-login").value.trim(),
      contrasena: $("contrasena-login").value
    });

    if (!resultado.token) {
      throw new Error("No se recibió el token de acceso");
    }

    token = resultado.token;
    usuario = resultado.usuario;

    sessionStorage.setItem("actividad4_token", token);
    sessionStorage.setItem(
      "actividad4_usuario",
      JSON.stringify(usuario)
    );

    $("formulario-login").reset();
    $("nombre-usuario").textContent =
      `Bienvenido, ${usuario.nombre}`;

    mensaje("mensaje-login", "");
    mostrarVista("productos");

    await cargarProductos();

  } catch (error) {
    mensaje("mensaje-login", error.message);
  } finally {
    boton.disabled = false;
  }
});

// CERRAR SESIÓN
function cerrarSesion() {
  token = "";
  usuario = null;

  sessionStorage.removeItem("actividad4_token");
  sessionStorage.removeItem("actividad4_usuario");

  $("formulario-productos").reset();
  $("producto-id").value = "";
  $("lista-productos").replaceChildren();

  mostrarVista("login");
}

$("cerrar-sesion").addEventListener("click", cerrarSesion);

// CONSULTAR PRODUCTOS
async function cargarProductos() {
  try {
    const productos = await solicitar(
      "/api/productos",
      "GET",
      null,
      true
    );

    mostrarProductos(productos);
  } catch (error) {
    mensaje("mensaje-producto", error.message);
  }
}

// MOSTRAR LISTA DE PRODUCTOS
function mostrarProductos(productos) {
  const lista = $("lista-productos");
  lista.replaceChildren();

  $("contador-productos").textContent =
    `${productos.length} productos`;

  $("mensaje-vacio").hidden = productos.length > 0;

  const formatoPrecio = new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency: "MXN"
  });

  productos.forEach((producto) => {
    const elemento = document.createElement("li");
    elemento.className = "producto-item";

    const informacion = document.createElement("div");

    const nombre = document.createElement("strong");
    nombre.textContent = producto.nombre;

    const detalles = document.createElement("p");
    detalles.textContent =
      `${producto.descripcion || "Sin descripción"} | ` +
      `Precio: ${formatoPrecio.format(producto.precio)} | ` +
      `Existencias: ${producto.stock}`;

    informacion.append(nombre, detalles);

    const botonEditar = document.createElement("button");
    botonEditar.type = "button";
    botonEditar.textContent = "Editar";

    botonEditar.addEventListener("click", () => {
      editarProducto(producto);
    });

    const botonEliminar = document.createElement("button");
    botonEliminar.type = "button";
    botonEliminar.textContent = "Eliminar";

    botonEliminar.addEventListener("click", () => {
      eliminarProducto(producto._id);
    });

    elemento.append(informacion, botonEditar, botonEliminar);
    lista.appendChild(elemento);
  });
}

// CREAR O ACTUALIZAR PRODUCTO
$("formulario-productos").addEventListener("submit", async (evento) => {
  evento.preventDefault();

  const id = $("producto-id").value;
  const boton = $("guardar-producto");

  const producto = {
    nombre: $("producto-nombre").value.trim(),
    descripcion: $("producto-descripcion").value.trim(),
    precio: Number($("producto-precio").value),
    stock: Number($("producto-stock").value)
  };

  if (
    !producto.nombre ||
    $("producto-precio").value === "" ||
    $("producto-stock").value === "" ||
    !Number.isFinite(producto.precio) ||
    producto.precio < 0 ||
    !Number.isInteger(producto.stock) ||
    producto.stock < 0
  ) {
    mensaje("mensaje-producto", "Revisa los datos del producto");
    return;
  }

  boton.disabled = true;

  try {
    if (id) {
      await solicitar(
        `/api/productos/${id}`,
        "PUT",
        producto,
        true
      );
    } else {
      await solicitar(
        "/api/productos",
        "POST",
        producto,
        true
      );
    }

    cancelarEdicion();
    await cargarProductos();

    mensaje(
      "mensaje-producto",
      id ? "Producto actualizado correctamente" :
           "Producto agregado correctamente"
    );

  } catch (error) {
    mensaje("mensaje-producto", error.message);
  } finally {
    boton.disabled = false;
  }
});

// PREPARAR EDICIÓN
function editarProducto(producto) {
  $("producto-id").value = producto._id;
  $("producto-nombre").value = producto.nombre;
  $("producto-descripcion").value = producto.descripcion || "";
  $("producto-precio").value = producto.precio;
  $("producto-stock").value = producto.stock;

  $("titulo-formulario").textContent = "Editar producto";
  $("guardar-producto").textContent = "Guardar cambios";
  $("cancelar-edicion").hidden = false;

  mensaje("mensaje-producto", "");
  $("producto-nombre").focus();
}

// CANCELAR EDICIÓN
function cancelarEdicion() {
  $("formulario-productos").reset();
  $("producto-id").value = "";

  $("titulo-formulario").textContent = "Agregar producto";
  $("guardar-producto").textContent = "Guardar producto";
  $("cancelar-edicion").hidden = true;
}

$("cancelar-edicion").addEventListener("click", cancelarEdicion);

// ELIMINAR PRODUCTO
async function eliminarProducto(id) {
  const confirmado = window.confirm(
    "¿Seguro que deseas eliminar este producto?"
  );

  if (!confirmado) return;

  try {
    await solicitar(
      `/api/productos/${id}`,
      "DELETE",
      null,
      true
    );

    if ($("producto-id").value === id) {
      cancelarEdicion();
    }

    await cargarProductos();
    mensaje("mensaje-producto", "Producto eliminado correctamente");

  } catch (error) {
    mensaje("mensaje-producto", error.message);
  }
}

// COMPROBAR SI HAY SESIÓN GUARDADA
if (token && usuario) {
  $("nombre-usuario").textContent =
    `Bienvenido, ${usuario.nombre}`;

  mostrarVista("productos");
  cargarProductos();
} else {
  mostrarVista("login");
}
