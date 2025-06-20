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

// --- Variables y elementos clave ---
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

// --- Buscar datos ---
document.getElementById("btnBuscarDocumento").addEventListener("click", () => {
    const num = inputDocumento.value.trim();
    const tipo = tipoDoc === "01" ? "ruc" : "dni";

    if (!num) return alert("⚠️ Ingresa un número.");
    if ((tipo === "dni" && num.length !== 8) || (tipo === "ruc" && num.length !== 11)) {
        return alert(`⚠️ ${tipo.toUpperCase()} debe tener ${tipo === "dni" ? 8 : 11} dígitos.`);
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
            if (j.status !== 200 || !j.success) throw new Error(j.message || 'No se encontró información');
            const d = j.data;
            if (tipo === "dni") {
                document.getElementById("razonSocial").value = d.nombre_completo || "";
                document.getElementById("direccion").value = d.direccion_completa || d.direccion || "";
            } else {
                document.getElementById("razonSocial").value = d.nombre_o_razon_social || "";
                document.getElementById("direccion").value = d.direccion || "";
            }
        })
        .catch(err => {
            console.error(err);
            alert("❌ No se obtuvieron datos. Verifica el número y el token.");
        });
});

// --- Unidades ---
const unidades = [
    { codigo: "NIU", descripcion: "UNIDAD (BIENES)" },
    { codigo: "LTR", descripcion: "LITRO" },
    { codigo: "MIL", descripcion: "MILLARES" },
    { codigo: "KGM", descripcion: "KILOGRAMO" },
    { codigo: "DZN", descripcion: "DOCENA" },
    { codigo: "CA", descripcion: "LATAS" },
    { codigo: "BG", descripcion: "BOLSA" },
    { codigo: "GLL", descripcion: "US GALON (3,7843 L)" },
    { codigo: "YRD", descripcion: "YARDA" },
    { codigo: "C62", descripcion: "PIEZAS" },
    { codigo: "ZZ", descripcion: "UNIDAD (SERVICIOS)" },
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

function obtenerFechaPeru() {
    const hoy = new Date();
    const año = hoy.getFullYear();
    const mes = String(hoy.getMonth() + 1).padStart(2, "0");
    const dia = String(hoy.getDate()).padStart(2, "0");
    return `${año}-${mes}-${dia}T00:00:00-05:00`;
}

function convertirNumeroALetras(monto) {
    return `SON ${monto.toFixed(2)} CON 00/100 SOLES`;
}

function enviarComprobante(data) {
    fetch("https://tu-api.com/comprobantes", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(data)
    })
        .then(response => response.json())
        .then(respuesta => {
            console.log("✅ Respuesta del servidor:", respuesta);
            alert("📤 Comprobante enviado correctamente.");
        })
        .catch(error => {
            console.error("❌ Error al enviar comprobante:", error);
            alert("❌ No se pudo enviar el comprobante.");
        });
}

formComprobante.addEventListener("submit", function (e) {
    e.preventDefault();

    const fecha = obtenerFechaPeru();

    const data = {
        tipo_Operacion: "0101",
        tipo_Doc: tipoDoc,
        serie: tipoDoc === "01" ? "F001" : "B001",
        correlativo: "1",
        tipo_Moneda: "PEN",
        fecha_Emision: fecha,
        empresa_Ruc: "20607086215",
        cliente_Tipo_Doc: cliente_Tipo_Doc,
        cliente_Num_Doc: inputDocumento.value,
        cliente_Razon_Social: document.getElementById("razonSocial").value,
        cliente_Direccion: document.getElementById("direccion").value,
        monto_Oper_Gravadas: 0,
        monto_Igv: 0,
        total_Impuestos: 0,
        valor_Venta: 0,
        sub_Total: 0,
        monto_Imp_Venta: 0,
        monto_Oper_Exoneradas: 0,
        estado_Documento: "0",
        manual: false,
        id_Base_Dato: "15265",
        detalle: [],
        forma_pago: [
            {
                tipo: "Contado",
                monto: 0,
                cuota: 0,
                fecha_Pago: fecha
            }
        ],
        legend: []
    };

    const filas = cuerpo.querySelectorAll("tr");
    let totalBase = 0;
    let totalIGV = 0;

    filas.forEach(fila => {
        const [unidadCell, cantCell, codCell, descCell, precioCell] = fila.children;
        const unidad = unidadCell.querySelector("select")?.value || "";
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
                igv: igv,
                tip_Afe_Igv: "10",
                total_Impuestos: igv,
                monto_Precio_Unitario: totalUnitario,
                monto_Valor_Venta: base,
                factor_Icbper: 0
            });
        }

        enviarComprobante(data);
    });

    const totalVenta = +(totalBase + totalIGV).toFixed(2);

    data.monto_Oper_Gravadas = totalBase;
    data.valor_Venta = totalBase;
    data.monto_Igv = totalIGV;
    data.total_Impuestos = totalIGV;
    data.sub_Total = totalVenta;
    data.monto_Imp_Venta = totalVenta;
    data.forma_pago[0].monto = totalVenta;
    data.legend.push({
        legend_Code: "1000",
        legend_Value: convertirNumeroALetras(totalVenta)
    });

    const vistaJSON = document.getElementById("vistaJSON");
    const jsonPreview = document.getElementById("jsonPreview");
    vistaJSON.style.display = "block";
    jsonPreview.textContent = JSON.stringify(data, null, 2);

    console.log("Listo para enviar a SUNAT:", data);
    alert("📥 Comprobante generado correctamente.");
});

// --- Navegación ---
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
        </tr>`;
        cuerpoVentas.innerHTML += fila;
    });
}

document.addEventListener("DOMContentLoaded", cargarVentas);
