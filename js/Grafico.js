let chart;
let periodoActual = 'dia';
let mostrandoComparacion = false;

const simulados = {
    dia: {
        actual: { labels: ['8 AM', '10 AM', '12 PM', '2 PM', '4 PM', '6 PM'], datos: [100, 200, 150, 250, 180, 220] },
        anterior: { datos: [80, 170, 120, 200, 160, 190] }
    },
    semana: {
        actual: { labels: ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'], datos: [400, 500, 450, 520, 600, 580, 490] },
        anterior: { datos: [350, 420, 400, 470, 510, 550, 430] }
    },
    mes: {
        actual: { labels: ['Semana 1', 'Semana 2', 'Semana 3', 'Semana 4'], datos: [2000, 2700, 3100, 2500] },
        anterior: { datos: [1800, 2400, 2900, 2300] }
    },
    año: {
        actual: { labels: ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun'], datos: [8000, 9000, 7500, 10000, 9500, 11000] },
        anterior: { datos: [7000, 8500, 7300, 9200, 8800, 10500] }
    }
};

document.addEventListener("DOMContentLoaded", () => {
    const ctx = document.getElementById('ventasChart').getContext('2d');

    chart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: [],
            datasets: [{
                label: 'Ventas (S/)',
                data: [],
                fill: true,
                backgroundColor: 'rgba(43, 76, 126, 0.1)',
                borderColor: 'rgba(43, 76, 126, 1)',
                tension: 0.4
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: { display: true }
            },
            scales: {
                y: { beginAtZero: true }
            }
        }
    });

    cambiarPeriodo('dia'); // carga inicial
});

function cambiarPeriodo(periodo) {
    periodoActual = periodo;
    mostrandoComparacion = false;

    const datos = simulados[periodo].actual;
    chart.data.labels = datos.labels;
    chart.data.datasets = [{
        label: 'Ventas (S/)',
        data: datos.datos,
        fill: true,
        backgroundColor: 'rgba(43, 76, 126, 0.1)',
        borderColor: 'rgba(43, 76, 126, 1)',
        tension: 0.4
    }];
    document.getElementById('tituloGrafico').textContent = `Gráfico de Ventas de${nombrePeriodo(periodo)}`;
    chart.update();
}

function toggleComparacion() {
    if (mostrandoComparacion) {
        chart.data.datasets = [chart.data.datasets[0]];
        mostrandoComparacion = false;
        chart.update();
        return;
    }

    const datosAnt = simulados[periodoActual].anterior;
    chart.data.datasets.push({
        label: 'Anterior',
        data: datosAnt.datos,
        fill: false,
        borderColor: 'rgb(217,15,15)', // rojo intenso
        borderDash: [5, 5],
        tension: 0.4
    });
    mostrandoComparacion = true;
    chart.update();
}

function nombrePeriodo(p) {
    switch (p) {
        case 'dia': return 'l Día';
        case 'semana': return ' la Semana';
        case 'mes': return 'l Mes';
        case 'año': return 'l Año';
        default: return '';
    }
}