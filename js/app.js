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
    location.reload();
});

// --- Variables clave ---
const btnBoleta = document.getElementById("btnBoleta");
const btnFactura = document.getElementById("btnFactura");
const labelDocumento = document.getElementById("labelDocumento");
const inputDocumento = document.getElementById("documento");
const cuerpo = document.getElementById("cuerpoProductos");
const totalGeneral = document.getElementById("totalGeneral");
const formComprobante = document.getElementById("formComprobante");

let tipoDoc = "03";
let cliente_Tipo_Doc = "1";

// --- Tipo de documento ---
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

// --- Buscar datos desde API ---
document.getElementById("btnBuscarDocumento").addEventListener("click", () => {
    const num = inputDocumento.value.trim();
    const tipo = tipoDoc === "01" ? "ruc" : "dni";

    if (!num) return alert("⚠️ Ingresa un número.");
    if ((tipo === "dni" && num.length !== 8) || (tipo === "ruc" && num.length !== 11)) {
        return alert(`${tipo.toUpperCase()} debe tener ${tipo === "dni" ? 8 : 11} dígitos.`);
    }

    const url = `https://api.factiliza.com/v1/${tipo}/info/${num}`;
    fetch(url, {
        method: "GET",
        headers: {
            Authorization: "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIzODg0MiIsImh0dHA6Ly9zY2hlbWFzLm1pY3Jvc29mdC5jb20vd3MvMjAwOC8wNi9pZGVudGl0eS9jbGFpbXMvcm9sZSI6ImNvbnN1bHRvciJ9.4m1S0AkEpql3vBmLHjoZZWVNZ3zqMgVgQ1JtrRjcTk8"
        }
    })
        .then(res => res.json())
        .then(j => {
            if (j.status !== 200 || !j.success) throw new Error(j.message || "No se encontró información");
            const d = j.data;
            document.getElementById("razonSocial").value = d.nombre_completo || d.nombre_o_razon_social || "";
            document.getElementById("direccion").value = d.direccion_completa || d.direccion || "";
        })
        .catch(err => {
            console.error(err);
            alert("❌ No se obtuvieron datos. Verifica el número y el token.");
        });
});

// --- Agregar productos ---
const unidades = [
    { codigo: "NIU", descripcion: "UNIDAD (BIENES)" },
    { codigo: "LTR", descripcion: "LITRO" },
    { codigo: "KGM", descripcion: "KILOGRAMO" },
    { codigo: "DZN", descripcion: "DOCENA" },
    { codigo: "ZZ", descripcion: "UNIDAD (SERVICIOS)" }
];
function crearFila() {
    const fila = document.createElement("tr");

    const celdaUnidad = document.createElement("td");
    const selectUnidad = document.createElement("select");
    selectUnidad.innerHTML = unidades.map(u => `<option value="${u.codigo}">${u.descripcion}</option>`).join("");
    celdaUnidad.appendChild(selectUnidad);
    fila.appendChild(celdaUnidad);

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
        const [unidadCell, cantCell, codCell, descCell, precioCell, totalCell] = fila.children;
        const cantidad = parseFloat(cantCell.firstChild?.value || 0);
        const precio = parseFloat(precioCell.firstChild?.value || 0);
        const subtotal = cantidad * precio;

        if (cantidad > 0 || precio > 0 || codCell.firstChild?.value || descCell.firstChild?.value) {
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

// --- Envío a API del facturador ---
function obtenerFechaPeru() {
    const hoy = new Date();
    return hoy.toISOString().split("T")[0] + "T00:00:00-05:00";
}

function convertirNumeroALetras(monto) {
    return `SON ${monto.toFixed(2)} CON 00/100 SOLES`;
}

function enviarComprobante(data) {
    fetch("https://backend-facturador.rj.r.appspot.com/facturador/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
    })
        .then(r => r.json())
        .then(res => {
            alert("✅ Comprobante enviado correctamente.");
        })
        .catch(err => {
            alert("❌ Error al enviar comprobante.");
            console.error(err);
        });
}
formComprobante.addEventListener("submit", function (e) {
    e.preventDefault();

    const fecha = obtenerFechaPeru();
    const data = {
        tipo_Operacion: "0101",
        tipo_Doc: tipoDoc,
        serie: tipoDoc === "01" ? "" : "",
        correlativo: "",
        tipo_Moneda: "PEN",
        fecha_Emision: fecha,
        empresa_Ruc: "20607086215",
        cliente_Tipo_Doc: cliente_Tipo_Doc,
        cliente_Num_Doc: inputDocumento.value,
        cliente_Razon_Social: document.getElementById("razonSocial").value,
        cliente_Direccion: document.getElementById("direccion").value,
        detalle: [],
        forma_pago: [{ tipo: "Contado", monto: 0, cuota: 0, fecha_Pago: fecha }],
        legend: [],
        monto_Oper_Gravadas: 0,
        monto_Igv: 0,
        total_Impuestos: 0,
        valor_Venta: 0,
        sub_Total: 0,
        monto_Imp_Venta: 0,
        estado_Documento: "0",
        manual: false,
        id_Base_Dato: "15265"
    };

    const filas = cuerpo.querySelectorAll("tr");
    let totalBase = 0;
    let totalIGV = 0;

    filas.forEach(fila => {
        const [unidadCell, cantCell, codCell, descCell, precioCell] = fila.children;
        const unidad = unidadCell.querySelector("select").value;
        const cantidad = parseFloat(cantCell.querySelector("input")?.value || 0);
        const codigo = codCell.querySelector("input")?.value || "SIN-CÓDIGO";
        const descripcion = descCell.querySelector("input")?.value || "SIN-DESCRIPCIÓN";
        const precio = parseFloat(precioCell.querySelector("input")?.value || 0);

        if (cantidad > 0 && precio > 0) {
            const base = +(cantidad * precio).toFixed(2);
            const igv = +(base * 0.18).toFixed(2);
            const totalUnitario = +(precio * 1.18).toFixed(2);

            totalBase += base;
            totalIGV += igv;

            data.detalle.push({
                unidad,
                cantidad,
                cod_Producto: codigo,
                descripcion,
                monto_Valor_Unitario: precio,
                monto_Base_Igv: base,
                porcentaje_Igv: 18,
                igv,
                tip_Afe_Igv: "10",
                total_Impuestos: igv,
                monto_Precio_Unitario: totalUnitario,
                monto_Valor_Venta: base,
                factor_Icbper: 0
            });
        }
    });

    const totalVenta = +(totalBase + totalIGV).toFixed(2);
    Object.assign(data, {
        monto_Oper_Gravadas: totalBase,
        valor_Venta: totalBase,
        monto_Igv: totalIGV,
        total_Impuestos: totalIGV,
        sub_Total: totalVenta,
        monto_Imp_Venta: totalVenta,
        forma_pago: [{ tipo: "Contado", monto: totalVenta, cuota: 0, fecha_Pago: fecha }],
        legend: [{ legend_Code: "1000", legend_Value: convertirNumeroALetras(totalVenta) }]
    });

    document.getElementById("vistaJSON").style.display = "block";
    document.getElementById("jsonPreview").textContent = JSON.stringify(data, null, 2);
    enviarComprobante(data);
});

// --- Navegación entre secciones ---
function activarMenu(id) {
    document.querySelectorAll(".menu .enlace").forEach(el => el.classList.remove("activo"));
    document.getElementById(id).classList.add("activo");
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

// --- Asistente IA estilo mensajería ---
const btnToggleIA = document.getElementById("toggleIA");
const chatIA = document.getElementById("chatIA");
const cerrarIA = document.getElementById("cerrarIA");
const inputIA = document.getElementById("inputIA");
const mensajesIA = document.getElementById("mensajesIA");
const btnEnviarIA = document.getElementById("enviarIA");

btnToggleIA.addEventListener("click", () => chatIA.classList.remove("oculto"));
cerrarIA.addEventListener("click", () => chatIA.classList.add("oculto"));

function agregarMensaje(texto, clase) {
    const burbuja = document.createElement("div");
    burbuja.className = `mensaje ${clase}`;
    burbuja.textContent = texto;
    mensajesIA.appendChild(burbuja);
    mensajesIA.scrollTop = mensajesIA.scrollHeight;
}

function enviarMensajeIA() {
    const pregunta = inputIA.value.trim();
    if (!pregunta) return;

    agregarMensaje(pregunta, "usuario");
    inputIA.value = "";

    //YA NO HAY IA PORQUE PROVOCAVA ERRORES EN EL BACKEND SE IMPLEMENTARA LUEGO
    fetch("https://backend-facturador.rj.r.appspot.com/ia/pregunta", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pregunta })
    })
        .then(res => res.json())
        .then(data => {
            agregarMensaje(data.respuesta || "🤖 No entendí tu pregunta.", "ia");
        })
        .catch(() => agregarMensaje("❌ Error al conectar con la IA.", "ia"));
}

let URLpdf = "";

document.getElementById("btnGenerarBoleta").addEventListener("click", async () => {
    try {
        const response = await fetch("https://backend-facturador.rj.r.appspot.com/facturador/devolver", {
            method: "GET"
        });

        if (!response.ok) {
            throw new Error("No se pudo obtener el PDF");
        }

        const blob = await response.blob();
        const pdfURL = URL.createObjectURL(blob);
        URLpdf = pdfURL;
        // Mostrar en el contenedor
        const pdfContainer = document.getElementById("pdfContainer");
        pdfContainer.innerHTML = `
            <iframe src="${pdfURL}" width="100%" height="600px" style="border:1px solid #ccc;"></iframe>
        `;

        // Guardar la URL temporal para descarga posterior
        const descargarBtn = document.getElementById("btnDescargarPdf");
        descargarBtn.style.display = "inline-block";
        descargarBtn.onclick = () => {
            const link = document.createElement("a");
            link.href = pdfURL;
            link.download = "comprobante.pdf";
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        };

    } catch (error) {
        console.error("Error al generar o mostrar el PDF:", error);
        alert("Hubo un error al obtener el comprobante PDF");
    }
});

btnEnviarIA.addEventListener("click", enviarMensajeIA);
inputIA.addEventListener("keypress", e => {
    if (e.key === "Enter") {
        e.preventDefault();
        enviarMensajeIA();
    }
});

const whatsappBtn = document.getElementById("btnWhatsappPdf");
whatsappBtn.style.display = "inline-block";

whatsappBtn.onclick = () => {
    const telefono = prompt("📞 Ingresa el número de WhatsApp del cliente (sin + ni espacios):");
    if (!telefono || !/^\d{9}$/.test(telefono)) {
        alert("❌ Número no válido. Debe tener 9 dígitos.");
        return;
    }

    const mensaje = `Hola, aquí está su comprobante electrónico: ${URLpdf}`;
    const enlace = `https://api.whatsapp.com/send?phone=51${telefono}&text=${encodeURIComponent(mensaje)}`;
    window.open(enlace, "_blank");
};

