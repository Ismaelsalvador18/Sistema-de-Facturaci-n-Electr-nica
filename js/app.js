// --- Login ---
document.getElementById("loginForm").addEventListener("submit", function (e) {
    e.preventDefault();
    const usuario = document.getElementById("usuario").value;
    const contrasena = document.getElementById("contrasena").value;
    const errorText = document.getElementById("errorLogin");

    if (usuario === "admin" && contrasena === "admin123") {
        document.getElementById("loginContainer").style.display = "none";
        document.getElementById("app").style.display = "flex";
    } else {
        errorText.textContent = "Usuario o contraseña incorrectos.";
    }
});

document.getElementById("btnCerrarSesion").addEventListener("click", function () {
    location.reload(); // Reinicia sesión
});

// --- App Principal ---
const btnBoleta = document.getElementById("btnBoleta");
const btnFactura = document.getElementById("btnFactura");
const labelDocumento = document.getElementById("labelDocumento");
const inputDocumento = document.getElementById("documento");
const cuerpo = document.getElementById("cuerpoProductos");
const totalGeneral = document.getElementById("totalGeneral");
const formComprobante = document.getElementById("formComprobante");

let tipoDoc = "03";
let cliente_Tipo_Doc = "1";

btnBoleta.addEventListener("click", () => {
    tipoDoc = "03";
    cliente_Tipo_Doc = "1";
    btnBoleta.classList.add("activo");
    btnFactura.classList.remove("activo");
    labelDocumento.textContent = "Número de DNI:";
    inputDocumento.placeholder = "Ingrese DNI";
    inputDocumento.maxLength = 8;
});

btnFactura.addEventListener("click", () => {
    tipoDoc = "01";
    cliente_Tipo_Doc = "6";
    btnFactura.classList.add("activo");
    btnBoleta.classList.remove("activo");
    labelDocumento.textContent = "Número de RUC:";
    inputDocumento.placeholder = "Ingrese RUC";
    inputDocumento.maxLength = 11;
});

btnBoleta.click();

function crearFila() {
    const fila = document.createElement("tr");
    for (let i = 0; i < 5; i++) {
        const celda = document.createElement("td");
        if (i < 4) {
            const input = document.createElement("input");
            input.type = (i === 0 || i === 3) ? "number" : "text";
            input.min = 0;
            input.step = "any";
            input.addEventListener("input", actualizarTotales);
            celda.appendChild(input);
        } else {
            celda.textContent = "S/ 0.00";
        }
        fila.appendChild(celda);
    }
    cuerpo.appendChild(fila);
}

function actualizarTotales() {
    const filas = cuerpo.querySelectorAll("tr");
    let total = 0;
    filas.forEach(fila => {
        const [cantCell, codCell, descCell, precioCell, totalCell] = fila.children;
        const cantidad = parseFloat(cantCell.firstChild.value) || 0;
        const precio = parseFloat(precioCell.firstChild.value) || 0;
        const subtotal = cantidad * precio;

        if (cantidad > 0 || precio > 0 || codCell.firstChild.value || descCell.firstChild.value) {
            totalCell.textContent = `S/ ${subtotal.toFixed(2)}`;
            total += subtotal;
        } else {
            totalCell.textContent = "S/ 0.00";
        }
    });
    totalGeneral.textContent = `S/ ${total.toFixed(2)}`;

    const ultimaFila = cuerpo.lastElementChild;
    if (ultimaFila) {
        const inputs = ultimaFila.querySelectorAll("input");
        const vacia = Array.from(inputs).every(input => !input.value);
        if (!vacia) crearFila();
    }
}

crearFila();

formComprobante.addEventListener("submit", function (e) {
    e.preventDefault();

    const data = {
        tipo_Doc: tipoDoc,
        cliente_Num_Doc: inputDocumento.value,
        cliente_Tipo_Doc: cliente_Tipo_Doc,
        cliente_Razon_Social: document.getElementById("razonSocial").value,
        cliente_Direccion: document.getElementById("direccion").value,
        detalle: [],
    };

    const filas = cuerpo.querySelectorAll("tr");
    filas.forEach(fila => {
        const [cantCell, codCell, descCell, precioCell, totalCell] = fila.children;
        const cantidad = parseFloat(cantCell.firstChild.value) || 0;
        const precio = parseFloat(precioCell.firstChild.value) || 0;

        if (cantidad > 0 && precio > 0) {
            data.detalle.push({
                cantidad,
                cod_Producto: codCell.firstChild.value || "SIN-CÓDIGO",
                descripcion: descCell.firstChild.value || "SIN-DESCRIPCIÓN",
                precio
            });
        }
    });

    console.log("Listo para procesar:", data);
    alert("📥 Comprobante listo para procesar.");
});

// Navegación
function activarMenu(idActivo) {
    document.querySelectorAll(".menu .enlace").forEach(el => el.classList.remove("activo"));
    document.getElementById(idActivo).classList.add("activo");
}

document.getElementById("btnVentas").addEventListener("click", () => {
    document.getElementById("mainComprobante").style.display = "none";
    document.getElementById("mainVentas").style.display = "block";
    activarMenu("btnVentas");
});

document.getElementById("btnInicio").addEventListener("click", () => {
    document.getElementById("mainVentas").style.display = "none";
    document.getElementById("mainComprobante").style.display = "block";
    activarMenu("btnInicio");
});

function cargarVentas() {
    // Aquí se simula respuesta del backend
    const ventas = [
        { fecha: "2025-06-18", cliente: "Juan Pérez", documento: "12345678", monto: 150, estado: "Emitido" },
        { fecha: "2025-06-17", cliente: "María López", documento: "20451234567", monto: 300, estado: "Anulado" }
    ];

    const cuerpoVentas = document.getElementById("cuerpoVentas");
    cuerpoVentas.innerHTML = "";
    ventas.forEach(venta => {
        const fila = `
      <tr>
        <td>${venta.fecha}</td>
        <td>${venta.cliente}</td>
        <td>${venta.documento}</td>
        <td>S/ ${venta.monto.toFixed(2)}</td>
        <td>${venta.estado}</td>
      </tr>
    `;
        cuerpoVentas.innerHTML += fila;
    });
}

document.addEventListener("DOMContentLoaded", cargarVentas);

