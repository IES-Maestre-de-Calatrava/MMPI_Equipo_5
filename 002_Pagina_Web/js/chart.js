/**
 * DICCIONARIO COMPLETO DE DATOS (Basado en tu JSON)
 * Incluye todos los días registrados para Alberto y Alonso.
 */
const datosPacientes = {
    "ALBERTO": {
        "sesiones": {
            "2026-03-05": { acc: 25, fren: 4, col: 4, est: 76 }, "2026-03-06": { acc: 116, fren: 9, col: 21, est: 71 },
            "2026-03-07": { acc: 144, fren: 6, col: 22, est: 58 }, "2026-03-08": { acc: 105, fren: 6, col: 16, est: 61 },
            "2026-03-09": { acc: 29, fren: 2, col: 6, est: 81 }, "2026-03-10": { acc: 34, fren: 4, col: 12, est: 69 },
            "2026-03-11": { acc: 20, fren: 5, col: 12, est: 82 }, "2026-03-12": { acc: 94, fren: 3, col: 9, est: 72 },
            "2026-03-13": { acc: 105, fren: 4, col: 8, est: 72 }, "2026-03-14": { acc: 70, fren: 1, col: 11, est: 60 },
            "2026-03-15": { acc: 67, fren: 3, col: 11, est: 77 }, "2026-03-16": { acc: 162, fren: 9, col: 20, est: 62 },
            "2026-03-17": { acc: 48, fren: 9, col: 15, est: 71 }, "2026-03-18": { acc: 86, fren: 4, col: 18, est: 78 },
            "2026-03-19": { acc: 53, fren: 4, col: 6, est: 85 }, "2026-03-20": { acc: 42, fren: 2, col: 17, est: 77 },
            "2026-03-21": { acc: 151, fren: 10, col: 26, est: 67 }, "2026-03-22": { acc: 50, fren: 5, col: 6, est: 71 },
            "2026-03-23": { acc: 130, fren: 3, col: 15, est: 69 }, "2026-03-24": { acc: 59, fren: 9, col: 14, est: 75 },
            "2026-03-25": { acc: 99, fren: 6, col: 17, est: 67 }, "2026-03-26": { acc: 110, fren: 3, col: 5, est: 77 },
            "2026-03-27": { acc: 109, fren: 5, col: 14, est: 52 }, "2026-03-28": { acc: 73, fren: 8, col: 16, est: 74 },
            "2026-03-29": { acc: 181, fren: 11, col: 14, est: 66 }, "2026-03-30": { acc: 121, fren: 6, col: 16, est: 53 },
            "2026-03-31": { acc: 57, fren: 0, col: 14, est: 66 }, "2026-04-01": { acc: 154, fren: 5, col: 16, est: 72 },
            "2026-04-02": { acc: 102, fren: 6, col: 9, min: 68 }, "2026-04-03": { acc: 199, fren: 10, col: 21, est: 64 },
            "2026-04-04": { acc: 12, fren: 0, col: 2, est: 88 }, "2026-04-05": { acc: 40, fren: 0, col: 10, est: 72 },
            "2026-04-06": { acc: 53, fren: 2, col: 9, est: 74 }, "2026-04-07": { acc: 55, fren: 4, col: 7, est: 71 },
            "2026-04-08": { acc: 77, fren: 3, col: 9, est: 67 }, "2026-04-09": { acc: 120, fren: 8, col: 14, est: 71 },
            "2026-04-10": { acc: 98, fren: 3, col: 13, est: 65 }, "2026-04-11": { acc: 81, fren: 7, col: 12, est: 73 },
            "2026-04-12": { acc: 88, fren: 6, col: 12, est: 61 }, "2026-04-13": { acc: 102, fren: 9, col: 8, est: 78 }
        }
    },
    "ALONSO MUÑOZ": {
        "sesiones": {
            "2026-03-25": { acc: 58, fren: 0, col: 20, est: 80 },
            "2026-03-26": { acc: 82, fren: 0, col: 7, est: 73 },
            "2026-03-27": { acc: 82, fren: 0, col: 7, est: 73 },
            "2026-03-28": { acc: 82, fren: 0, col: 7, est: 73 },
            "2026-03-29": { acc: 82, fren: 0, col: 7, est: 73 },
            "2026-03-30": { acc: 82, fren: 0, col: 7, est: 73 },
            "2026-03-31": { acc: 82, fren: 0, col: 7, est: 73 },
            "2026-04-10": { acc: 111, fren: 0, col: 16, est: 91 }
        }
    }
};

let miGraficaBarras;

function renderizarGrafica(fecha) {
    const nombreElemento = document.getElementById('nombrePaciente').innerText.toUpperCase();
    const paciente = datosPacientes[nombreElemento];
    
    // Obtenemos los datos o ponemos 0 si el día no tiene registros
    const d = (paciente && paciente.sesiones[fecha]) || { acc: 0, fren: 0, col: 0, est: 0 };

    const ctx = document.getElementById('barChart').getContext('2d');

    if (miGraficaBarras) {
        miGraficaBarras.destroy();
    }

    miGraficaBarras = new Chart(ctx, {
        data: {
            labels: [fecha],
            datasets: [
                { type: 'bar', label: 'Acelerones', data: [d.acc], backgroundColor: '#FFD700' },
                { type: 'bar', label: 'Frenazos', data: [d.fren], backgroundColor: '#FF4500' },
                { type: 'bar', label: 'Colisiones', data: [d.col], backgroundColor: '#FF0000' },
                { 
                    type: 'line', label: 'Estabilidad %', data: [d.est], 
                    borderColor: '#00FF7F', borderWidth: 5, yAxisID: 'y1', pointRadius: 10 
                }
            ]
        },
        options: {
            responsive: true,
            scales: {
                y: { stacked: true, beginAtZero: true },
                y1: { position: 'right', min: 0, max: 100, grid: { drawOnChartArea: false } }
            }
        }
    });
}

// Escuchamos el cambio de fecha en tu input
document.getElementById('fechaSeleccionada').addEventListener('change', (e) => {
    renderizarGrafica(e.target.value);
});

// Iniciamos la web mostrando el primer día con datos de Alonso
window.onload = () => {
    renderizarGrafica("2026-03-25");
};