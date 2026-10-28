/* =========================================
   PIN-PON — FUNCIONAMIENTO DEL PEDIDO
========================================= */

const WHATSAPP_NUMBER = "5491132185743";

const form = document.getElementById("pedido-form");
const tipo = document.getElementById("tipo");
const cantidad = document.getElementById("cantidad");
const total = document.getElementById("total");

const imagenInput = document.getElementById("imagen");
const imagenCampo = document.getElementById("imagen-campo");
const vistaPrevia = document.getElementById("vista-previa");
const imagenPreview = document.getElementById("imagen-preview");
const nombreImagen = document.getElementById("nombre-imagen");

const disenoCampo = document.getElementById("diseno-campo");
const disenoInput = document.getElementById("diseno");

const PRECIO_PERSONALIZADO = 2500;
const PRECIO_DISPONIBLE = 2000;

let imagenSeleccionada = null;
let imagenObjectURL = null;

function obtenerPrecio() {
  return tipo.value === "Personalizado"
    ? PRECIO_PERSONALIZADO
    : PRECIO_DISPONIBLE;
}

function actualizarTotal() {
  const unidades = Math.max(
    1,
    Math.min(100, Number.parseInt(cantidad.value, 10) || 1)
  );

  total.textContent = (obtenerPrecio() * unidades).toLocaleString("es-AR", {
    style: "currency",
    currency: "ARS",
    maximumFractionDigits: 0
  });
}

function limpiarImagen() {
  imagenSeleccionada = null;
  imagenInput.value = "";
  vistaPrevia.hidden = true;
  imagenPreview.removeAttribute("src");
  nombreImagen.textContent = "";

  if (imagenObjectURL) {
    URL.revokeObjectURL(imagenObjectURL);
    imagenObjectURL = null;
  }
}

function actualizarFormulario() {
  const esPersonalizado = tipo.value === "Personalizado";

  imagenCampo.hidden = !esPersonalizado;
  disenoCampo.hidden = esPersonalizado;

  imagenInput.required = esPersonalizado;
  disenoInput.required = !esPersonalizado;

  if (!esPersonalizado) {
    limpiarImagen();
  }

  actualizarTotal();
}

tipo.addEventListener("change", actualizarFormulario);
cantidad.addEventListener("input", actualizarTotal);

/* Vista previa de la imagen personalizada */

imagenInput.addEventListener("change", function () {
  const archivo = imagenInput.files[0];

  limpiarImagen();

  if (!archivo) return;

  if (!archivo.type.startsWith("image/")) {
    alert("Elegí un archivo de imagen válido.");
    return;
  }

  if (archivo.size > 10 * 1024 * 1024) {
    alert("La imagen pesa más de 10 MB. Elegí una imagen más liviana.");
    return;
  }

  imagenSeleccionada = archivo;
  imagenObjectURL = URL.createObjectURL(archivo);

  imagenPreview.src = imagenObjectURL;
  nombreImagen.textContent = archivo.name;
  vistaPrevia.hidden = false;
});

/* Botones del catálogo: elegir diseño */

document.querySelectorAll(".btn-producto").forEach(function (boton) {
  boton.addEventListener("click", function () {
    const disenoElegido = boton.dataset.diseno;

    // Seleccionar pines con diseños disponibles.
    tipo.value = "Diseño disponible";
    actualizarFormulario();

    // Completar el nombre del diseño.
    disenoInput.value = disenoElegido;

    // Actualizar el precio.
    actualizarTotal();

    // Desplazarse hasta el formulario.
    document.getElementById("formulario").scrollIntoView({
      behavior: "smooth",
      block: "start"
    });
  });
});

/* Envío del pedido por WhatsApp */

form.addEventListener("submit", function (evento) {
  evento.preventDefault();

  const nombre = document.getElementById("nombre").value.trim();
  const unidades = Number.parseInt(cantidad.value, 10);
  const precio = obtenerPrecio();

  if (!nombre) {
    alert("Escribí tu nombre para continuar.");
    return;
  }

  if (!Number.isInteger(unidades) || unidades < 1 || unidades > 100) {
    alert("La cantidad debe estar entre 1 y 100.");
    return;
  }

  if (tipo.value === "Personalizado" &&
      (!imagenSeleccionada || !imagenInput.files.length)) {
    alert("Seleccioná la imagen que querés convertir en pin.");
    return;
  }

  if (tipo.value !== "Personalizado" && !disenoInput.value.trim()) {
    alert("Elegí o escribí el diseño que querés comprar.");
    disenoInput.focus();
    return;
  }

  const importe = precio * unidades;

  const formatoPrecio = function (valor) {
    return valor.toLocaleString("es-AR", {
      style: "currency",
      currency: "ARS",
      maximumFractionDigits: 0
    });
  };

  const mensaje = [
    "¡Hola, Pin-Pon! Quiero hacer un pedido.",
    "",
    "Nombre: " + nombre,
    "Tipo de pin: " + tipo.value,
    "Precio unitario: " + formatoPrecio(precio),
    "Cantidad: " + unidades,
    "Total estimado: " + formatoPrecio(importe)
  ];

  if (tipo.value === "Personalizado") {
    mensaje.push(
      "",
      "Imagen elegida: " + imagenSeleccionada.name,
      "Adjuntaré la imagen al chat para confirmar el diseño."
    );
  } else {
    mensaje.push("", "Diseño elegido: " + disenoInput.value.trim());
  }

  mensaje.push("", "¡Espero la confirmación del pedido!");

  const numeroLimpio = WHATSAPP_NUMBER.replace(/\D/g, "");

  if (numeroLimpio.length < 10) {
    alert("Revisá el número de WhatsApp configurado en script.js.");
    return;
  }

  const url = "https://wa.me/" + numeroLimpio +
    "?text=" + encodeURIComponent(mensaje.join("\n"));

  window.open(url, "_blank", "noopener,noreferrer");

  if (tipo.value === "Personalizado") {
    alert(
      "Se abrirá WhatsApp con los datos del pedido. " +
      "Acordate de adjuntar la imagen antes de enviar el mensaje."
    );
  }
});

/* Estado inicial */

actualizarFormulario();