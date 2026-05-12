const API_BASES_DETALLE = [
    "http://localhost:8085",
    "http://localhost:8086",
    ""
];

let sesionesPacienteGlobal = [];
let graficaPie = null;
let graficaBarras = null;
let graficaLineas = null;
let graficaCombinada = null;

let periodoSeleccionadoGlobal = {
    tipoPeriodo: "GLOBAL",
    fechaInicio: "",
    fechaFin: "",
    clavePeriodo: "GLOBAL",
    textoPantalla: "Vista global del paciente",
    badge: "Global"
};

document.addEventListener("DOMContentLoaded", async function () {

    await pintarUsuarioHeader();

    const pacienteId = obtenerPacienteIdDesdeURL();

    const inputPacienteId = document.getElementById("pacienteId");

    if (inputPacienteId) {
        inputPacienteId.value = pacienteId;
    }

    await cargarDatosPaciente(pacienteId);

    sesionesPacienteGlobal = await cargarSesionesPaciente(pacienteId);

    if (sesionesPacienteGlobal.length > 0) {
        actualizarGraficasGlobal();
    } else {
        actualizarGraficasVacias();
    }

    const btnSave = document.getElementById("btn-save");

    if (btnSave) {
        btnSave.addEventListener("click", guardarObservacionActual);
    }

});

function obtenerPacienteIdDesdeURL() {

    const params = new URLSearchParams(window.location.search);

    return params.get("id") || params.get("dni") || "1";

}

/* ==================================================
   DATOS DEL PACIENTE
================================================== */

async function cargarDatosPaciente(id) {

    const paciente = await pedirUno([
        "/paciente/find/" + encodeURIComponent(id)
    ]);

    if (!paciente) {
        pintarPacienteFallback();
        return;
    }

    const dni = obtenerCampo(paciente, ["dniPaciente", "dni", "idPaciente", "id"], id);
    const nombre = obtenerCampo(paciente, ["nombre", "name"], "Paciente");
    const apellidos = limpiarTextoPaciente(obtenerCampo(paciente, ["apellidos", "apellido", "surname"], ""));
    const edad = limpiarDatoPaciente(obtenerCampo(paciente, ["edad"], "-"));
    const localidad = limpiarDatoPaciente(obtenerCampo(paciente, ["localidad", "ciudad", "domicilio"], "-"));
    const telefono = limpiarTelefonoPaciente(obtenerCampo(paciente, ["telefono", "phone"], "-"));
    const email = limpiarEmailPaciente(obtenerCampo(paciente, ["email", "correo"], "-"));
    const datosCompletos = Number(obtenerCampo(paciente, ["datosCompletos", "datos_completos"], 1));

    const nombreCompleto = (nombre + " " + apellidos).trim().toUpperCase();

    ponerTextoDetalle("patient-name", nombreCompleto);
    ponerTextoDetalle("patient-dni", dni);
    ponerTextoDetalle("patient-age", edad);
    ponerTextoDetalle("patient-city", localidad);
    ponerTextoDetalle("patient-phone", telefono);
    ponerTextoDetalle("patient-email", email);

    if (datosCompletos === 0) {
        ponerTextoDetalle("patient-level", "Estado: Pendiente");
    } else {
        ponerTextoDetalle("patient-level", "Estado: Completo");
    }

    configurarBotonesPaciente(dni, datosCompletos);

}

function pintarPacienteFallback() {

    ponerTextoDetalle("patient-name", "PACIENTE");
    ponerTextoDetalle("patient-dni", "-");
    ponerTextoDetalle("patient-age", "-");
    ponerTextoDetalle("patient-city", "-");
    ponerTextoDetalle("patient-phone", "-");
    ponerTextoDetalle("patient-email", "-");
    ponerTextoDetalle("patient-level", "Estado: -");

}

function configurarBotonesPaciente(dniPaciente, datosCompletos) {

    const aviso = document.getElementById("patient-warning");
    const btnCompletar = document.getElementById("btnCompletarPaciente");
    const btnEditar = document.getElementById("btnEditarPaciente");

    const volver = "informacion.html?id=" + encodeURIComponent(dniPaciente);
    const volverCodificado = encodeURIComponent(volver);

    if (datosCompletos === 0) {

        if (aviso) {
            aviso.classList.remove("d-none");
        }

        if (btnCompletar) {
            btnCompletar.classList.remove("d-none");
            btnCompletar.href = "anadir_paciente.html?id=" + encodeURIComponent(dniPaciente) + "&modo=completar&volver=" + volverCodificado;
        }

        if (btnEditar) {
            btnEditar.classList.add("d-none");
        }

    } else {

        if (aviso) {
            aviso.classList.add("d-none");
        }

        if (btnCompletar) {
            btnCompletar.classList.add("d-none");
        }

        if (btnEditar) {
            btnEditar.classList.remove("d-none");
            btnEditar.href = "anadir_paciente.html?id=" + encodeURIComponent(dniPaciente) + "&modo=editar&volver=" + volverCodificado;
        }

    }

}

/* ==================================================
   SESIONES DEL PACIENTE
================================================== */

async function cargarSesionesPaciente(pacienteId) {

    const sesiones = await pedirLista("/sesion/find");

    if (!sesiones || sesiones.length === 0) {
        return [];
    }

    const filtradas = sesiones.filter(function (sesion) {
        return perteneceAlPaciente(sesion, pacienteId);
    });

    const haySesionesConPaciente = sesiones.some(function (sesion) {
        return sesionTienePaciente(sesion);
    });

    if (haySesionesConPaciente) {
        return ordenarSesionesPorFecha(filtradas);
    }

    return ordenarSesionesPorFecha(sesiones);

}

function perteneceAlPaciente(sesion, pacienteId) {

    const posibles = [
        sesion.dniPaciente,
        sesion.idPaciente,
        sesion.pacienteId,
        sesion.dni,
        sesion.paciente && sesion.paciente.dniPaciente,
        sesion.paciente && sesion.paciente.dni,
        sesion.paciente && sesion.paciente.id
    ];

    return posibles.some(function (valor) {
        return valor !== undefined &&
               valor !== null &&
               String(valor).trim() !== "" &&
               String(valor) === String(pacienteId);
    });

}

function sesionTienePaciente(sesion) {

    const posibles = [
        sesion.dniPaciente,
        sesion.idPaciente,
        sesion.pacienteId,
        sesion.dni,
        sesion.paciente && sesion.paciente.dniPaciente,
        sesion.paciente && sesion.paciente.dni,
        sesion.paciente && sesion.paciente.id
    ];

    return posibles.some(function (valor) {
        return valor !== undefined &&
               valor !== null &&
               String(valor).trim() !== "";
    });

}

function ordenarSesionesPorFecha(sesiones) {

    return sesiones.slice().sort(function (a, b) {
        return obtenerFechaSesionDetalle(a).localeCompare(obtenerFechaSesionDetalle(b));
    });

}

/* ==================================================
   PETICIONES AL BACKEND
================================================== */

async function pedirUno(rutas) {

    for (let i = 0; i < API_BASES_DETALLE.length; i++) {

        for (let j = 0; j < rutas.length; j++) {

            try {

                const respuesta = await fetch(API_BASES_DETALLE[i] + rutas[j]);

                if (respuesta.ok) {
                    return await respuesta.json();
                }

            } catch (error) {

            }

        }

    }

    return null;

}

async function pedirLista(ruta) {

    for (let i = 0; i < API_BASES_DETALLE.length; i++) {

        try {

            const respuesta = await fetch(API_BASES_DETALLE[i] + ruta);

            if (respuesta.ok) {
                return await respuesta.json();
            }

        } catch (error) {

        }

    }

    return [];

}

/* ==================================================
   GRÁFICAS - MAIN FUNCTIONS
================================================== */
function actualizarGraficasGlobal() {

    periodoSeleccionadoGlobal = {
        tipoPeriodo: "GLOBAL",
        fechaInicio: "",
        fechaFin: "",
        clavePeriodo: "GLOBAL",
        textoPantalla: "Reporte global del paciente",
        badge: "Global"
    };

    pintarPeriodoSeleccionado();
    cargarObservacionActual();

    pintarGraficas(sesionesPacienteGlobal, "Reporte global");

}

function actualizarGraficasPorDia(fecha) {

    periodoSeleccionadoGlobal = {
        tipoPeriodo: "DIA",
        fechaInicio: fecha,
        fechaFin: fecha,
        clavePeriodo: fecha,
        textoPantalla: "Día seleccionado: " + fecha,
        badge: "Diario"
    };

    pintarPeriodoSeleccionado();
    cargarObservacionActual();

    const sesionesDia = sesionesPacienteGlobal.filter(function (sesion) {
        return obtenerFechaSesionDetalle(sesion) === fecha;
    });

    pintarGraficas(sesionesDia, "Día " + fecha, "dia");

}

function actualizarGraficasPorSemana(rango) {

    periodoSeleccionadoGlobal = {
        tipoPeriodo: "SEMANA",
        fechaInicio: rango.inicio,
        fechaFin: rango.fin,
        clavePeriodo: rango.inicio + "_" + rango.fin,
        textoPantalla: "Semana seleccionada: " + rango.inicio + " a " + rango.fin,
        badge: "Semanal"
    };

    pintarPeriodoSeleccionado();
    cargarObservacionActual();

    const sesionesSemana = sesionesPacienteGlobal.filter(function (sesion) {
        const fecha = obtenerFechaSesionDetalle(sesion);
        return fecha >= rango.inicio && fecha <= rango.fin;
    });

    pintarGraficas(sesionesSemana, rango.inicio + " a " + rango.fin, "semana");

}

function actualizarGraficasVacias() {

    periodoSeleccionadoGlobal = {
        tipoPeriodo: "GLOBAL",
        fechaInicio: "",
        fechaFin: "",
        clavePeriodo: "GLOBAL",
        textoPantalla: "Reporte global del paciente",
        badge: "Global"
    };

    pintarPeriodoSeleccionado();
    cargarObservacionActual();

    pintarGraficas([], "Sin datos");

}

function pintarGraficas(sesiones, titulo, modo = "dia") {

    if (modo === "semana") {
        const dias = agruparPorDia(sesiones);
        pintarGraficaDonutSemana(dias, titulo);
        pintarGraficaLineasSemana(dias, titulo);
        pintarGraficaCombinadaSemana(dias, titulo);
        return;
    }

    // DAILY MODE
    const resumen = calcularResumenDetalle(sesiones);

    let fechaInicio = null;
    let fechaFin = null;
    if (sesiones.length > 0) {
        fechaInicio = obtenerFechaSesionDetalle(sesiones[0]);
        fechaFin = obtenerFechaSesionDetalle(sesiones[sesiones.length - 1]);
    }

    pintarResumenPeriodo(resumen);
    pintarGraficaDonut(resumen, titulo, fechaInicio, fechaFin);
    pintarGraficaLineas(sesiones, titulo);
    pintarGraficaCombinada(sesiones, titulo);

}

/* ==================================================
   GRÁFICAS - DONUT / PIE
================================================== */

function pintarGraficaDonut(resumen, titulo, fechaInicio = null, fechaFin = null) {

    const canvas = document.getElementById("pieChart");

    if (!canvas) return;

    const ctx = canvas.getContext("2d");

    if (graficaPie) {
        graficaPie.destroy();
    }

    let tituloFinal = titulo;
    if (fechaInicio && fechaFin) {
        if (fechaInicio === fechaFin) {
            tituloFinal = "Eventos por día " + fechaInicio;
        } else {
            tituloFinal = "Eventos por semana " + fechaInicio + " hasta " + fechaFin;
        }
    }

    graficaPie = new Chart(ctx, {

        type: "doughnut",

        data: {

            labels: ["Colisiones", "Aceleraciones", "Paradas"],

            datasets: [{

                data: [
                    resumen.colisiones,
                    resumen.aceleracionesBruscas,
                    resumen.paradasBruscas
                ],

                backgroundColor: [
                    "rgba(220, 53, 69, 0.75)",
                    "rgba(255, 193, 7, 0.75)",
                    "rgba(13, 110, 253, 0.75)"
                ],

                borderColor: [
                    "#dc3545",
                    "#ffc107",
                    "#0d6efd"
                ],

                borderWidth: 2,
                hoverOffset: 18,
                cutout: "40%"
            }]

        },

        options: {

            responsive: true,
            maintainAspectRatio: false,

            animation: {
                animateRotate: true,
                animateScale: true,
                duration: 900
            },

            plugins: {

                title: {
                    display: true,
                    text: tituloFinal,
                    color: "#000839",
                    font: {
                        size: 16,
                        weight: "bold"
                    }
                },

                legend: {
                    position: "bottom",
                    labels: {
                        usePointStyle: true,
                        pointStyle: "circle",
                        padding: 15,
                        color: "#000839",
                        font: {
                            weight: "600",
                            size: 12
                        }
                    }
                },

                tooltip: {
                    backgroundColor: "#000839",
                    titleColor: "#fff",
                    bodyColor: "#fff",
                    padding: 12,
                    cornerRadius: 10
                }

            }

        }

    });

}

function pintarGraficaDonutSemana(dias, titulo) {

    const resumen = dias.reduce((acc, d) => {

        acc.colisiones += d.colisiones;
        acc.aceleracionesBruscas += d.aceleracionesBruscas;
        acc.paradasBruscas += d.paradasBruscas;

        return acc;

    }, {
        colisiones: 0,
        aceleracionesBruscas: 0,
        paradasBruscas: 0
    });

    let fechaInicio = null;
    let fechaFin = null;
    if (dias.length > 0) {
        fechaInicio = dias[0].fecha;
        fechaFin = dias[dias.length - 1].fecha;
    }

    pintarGraficaDonut(resumen, titulo, fechaInicio, fechaFin);
}

/* ==================================================
   GRÁFICAS - LINEAS
================================================== */

function pintarGraficaLineas(sesiones, titulo) {

    const canvas = document.getElementById("lineChart");
    if (!canvas) return;

    const ctx = canvas.getContext("2d");

    if (graficaLineas) {
        graficaLineas.destroy();
    }

    sesiones.sort((a, b) =>
        String(a.idSesion || a.id || "").localeCompare(String(b.idSesion || b.id || ""))
    );

    const labels = sesiones.map((_, index) => "Sesión #" + (index + 1));

    let cumulativeTime = 0;
    const tiempoUso = sesiones.map((sesion, idx) => {
        let duracion = numeroDetalle(obtenerCampo(sesion, [
            "tiempoMovimiento",
            "tiempo_movimiento",
            "duracion", 
            "duration", 
            "tiempoSesion",
            "tiempo_sesion"
        ], 0));
        
        const horas = duracion / 60;
        cumulativeTime += horas;
        
        return Math.round(cumulativeTime * 100) / 100;
    });

    const gradient = ctx.createLinearGradient(0, 0, 0, 350);
    gradient.addColorStop(0, "rgba(0, 8, 57, 0.45)");
    gradient.addColorStop(1, "rgba(0, 8, 57, 0.00)");

    graficaLineas = new Chart(ctx, {
        type: "line",
        data: {
            labels,
            datasets: [
                {
                    label: "Tiempo de uso acumulado (horas)",
                    data: tiempoUso,

                    borderColor: "#000839",
                    backgroundColor: gradient,

                    fill: true,
                    tension: 0.5,

                    pointRadius: 3,
                    pointHoverRadius: 8,
                    pointBackgroundColor: "#ffffff",
                    pointBorderColor: "#000839",
                    pointBorderWidth: 2,

                    pointHoverBackgroundColor: "#000839",
                    pointHoverBorderWidth: 3
                }
            ]
        },

        options: {
            responsive: true,
            maintainAspectRatio: false,

            interaction: {
                mode: "index",
                intersect: false
            },

            plugins: {

                title: {
                    display: true,
                    text: "Tiempo de uso - " + titulo,
                    color: "#000839",
                    font: {
                        size: 18,
                        weight: "700"
                    },
                    padding: {
                        bottom: 15
                    }
                },

                legend: {
                    position: "bottom",
                    labels: {
                        color: "#000839",
                        font: {
                            weight: "600",
                            size: 12
                        },
                        usePointStyle: true,
                        pointStyle: "circle",
                        padding: 18
                    }
                },

                tooltip: {
                    backgroundColor: "rgba(0, 8, 57, 0.95)",
                    titleColor: "#ffffff",
                    bodyColor: "#ffffff",
                    padding: 14,
                    cornerRadius: 12,
                    displayColors: false,
                    titleFont: { weight: "700" },
                    callbacks: {
                        label: function(context) {
                            return context.dataset.label + ": " + context.parsed.y + " h";
                        }
                    }
                }
            },

            scales: {

                x: {
                    grid: {
                        display: false
                    },
                    ticks: {
                        color: "#8a8f98",
                        font: {
                            weight: "500"
                        }
                    }
                },

                y: {
                    beginAtZero: true,
                    grid: {
                        color: "rgba(0,0,0,0.04)"
                    },
                    ticks: {
                        color: "#8a8f98",
                        font: {
                            weight: "500"
                        }
                    }
                }
            },

            elements: {
                line: {
                    borderWidth: 3
                }
            }
        }
    });
}

function pintarGraficaLineasSemana(dias, titulo) {

    const canvas = document.getElementById("lineChart");
    if (!canvas) return;

    const ctx = canvas.getContext("2d");

    if (graficaLineas) graficaLineas.destroy();

    const labels = dias.map(d => d.fecha);
    const tiempoUso = dias.map(d => d.tiempoUsoTotal || 0);

    const gradient = ctx.createLinearGradient(0, 0, 0, 350);
    gradient.addColorStop(0, "rgba(0, 8, 57, 0.45)");
    gradient.addColorStop(1, "rgba(0, 8, 57, 0.00)");

    graficaLineas = new Chart(ctx, {
        type: "line",
        data: {
            labels,
            datasets: [
                {
                    label: "Tiempo de uso (horas)",
                    data: tiempoUso,

                    borderColor: "#000839",
                    backgroundColor: gradient,

                    fill: true,
                    tension: 0.5,

                    pointRadius: 3,
                    pointHoverRadius: 8,
                    pointBackgroundColor: "#ffffff",
                    pointBorderColor: "#000839",
                    pointBorderWidth: 2,

                    pointHoverBackgroundColor: "#000839",
                    pointHoverBorderWidth: 3
                }
            ]
        },

        options: {
            responsive: true,
            maintainAspectRatio: false,

            interaction: {
                mode: "index",
                intersect: false
            },

            plugins: {

                title: {
                    display: true,
                    text: "Tiempo de uso - " + titulo,
                    color: "#000839",
                    font: {
                        size: 18,
                        weight: "700"
                    },
                    padding: {
                        bottom: 15
                    }
                },

                legend: {
                    position: "bottom",
                    labels: {
                        color: "#000839",
                        font: {
                            weight: "600",
                            size: 12
                        },
                        usePointStyle: true,
                        pointStyle: "circle",
                        padding: 18
                    }
                },

                tooltip: {
                    backgroundColor: "rgba(0, 8, 57, 0.95)",
                    titleColor: "#ffffff",
                    bodyColor: "#ffffff",
                    padding: 14,
                    cornerRadius: 12,
                    displayColors: false
                }
            },

            scales: {

                x: {
                    grid: { display: false },
                    ticks: {
                        color: "#8a8f98",
                        font: { weight: "500" }
                    }
                },

                y: {
                    beginAtZero: true,
                    grid: {
                        color: "rgba(0,0,0,0.04)"
                    },
                    ticks: {
                        color: "#8a8f98",
                        font: { weight: "500" }
                    }
                }
            },

            elements: {
                line: {
                    borderWidth: 3
                }
            }
        }
    });
}

/* ==================================================
   GRÁFICAS - COMBINADA (SCORE + EVENTOS + ESTABILIDAD)
================================================== */

function pintarGraficaCombinada(sesiones, titulo) {

    const canvas = document.getElementById("barChart");
    if (!canvas) return;

    const ctx = canvas.getContext("2d");

    if (graficaCombinada) {
        graficaCombinada.destroy();
    }

    sesiones.sort((a, b) =>
        String(a.idSesion || a.id || "").localeCompare(String(b.idSesion || b.id || ""))
    );

    const labels = sesiones.map((_, index) => "Sesión #" + (index + 1));

    const scores = sesiones.map(s =>
        numeroDetalle(obtenerCampo(s, ["score"], 0))
    );

    const estabilidad = sesiones.map(s =>
        numeroDetalle(obtenerCampo(s, ["estabilidad"], 0))
    );

    const eventos = sesiones.map(s => {
        const colisiones = numeroDetalle(obtenerCampo(s, ["colisiones"], 0));
        const aceleraciones = numeroDetalle(
            obtenerCampo(s, ["aceleracionesBruscas", "aceleraciones_bruscas"], 0)
        );
        const paradas = numeroDetalle(
            obtenerCampo(s, ["paradasBruscas", "paradas_bruscas"], 0)
        );

        return colisiones + aceleraciones + paradas;
    });

    const scoreGradient = ctx.createLinearGradient(0, 0, 0, 300);
    scoreGradient.addColorStop(0, "rgba(0, 8, 57, 0.35)");
    scoreGradient.addColorStop(1, "rgba(0, 8, 57, 0.00)");

    const eventGradient = ctx.createLinearGradient(0, 0, 0, 300);
    eventGradient.addColorStop(0, "rgba(220, 53, 69, 0.30)");
    eventGradient.addColorStop(1, "rgba(220, 53, 69, 0.00)");

    const stabilityGradient = ctx.createLinearGradient(0, 0, 0, 300);
    stabilityGradient.addColorStop(0, "rgba(25, 135, 84, 0.30)");
    stabilityGradient.addColorStop(1, "rgba(25, 135, 84, 0.00)");

    graficaCombinada = new Chart(ctx, {
        type: "line",
        data: {
            labels,
            datasets: [

                {
                    label: "Score",
                    data: scores,
                    borderColor: "#000839",
                    backgroundColor: scoreGradient,
                    borderWidth: 3,
                    tension: 0.45,
                    fill: true,
                    pointRadius: 3,
                    pointHoverRadius: 7,
                    pointBackgroundColor: "#fff",
                    pointBorderColor: "#000839",
                    pointBorderWidth: 2,
                    pointHoverBackgroundColor: "#000839"
                },

                {
                    label: "Eventos Totales",
                    data: eventos,
                    borderColor: "#dc3545",
                    backgroundColor: eventGradient,
                    borderWidth: 3,
                    tension: 0.45,
                    fill: true,
                    pointRadius: 3,
                    pointHoverRadius: 7,
                    pointBackgroundColor: "#fff",
                    pointBorderColor: "#dc3545",
                    pointBorderWidth: 2,
                    pointHoverBackgroundColor: "#dc3545"
                },

                {
                    label: "Estabilidad",
                    data: estabilidad,
                    borderColor: "#198754",
                    backgroundColor: stabilityGradient,
                    borderWidth: 3,
                    tension: 0.45,
                    fill: true,
                    pointRadius: 3,
                    pointHoverRadius: 7,
                    pointBackgroundColor: "#fff",
                    pointBorderColor: "#198754",
                    pointBorderWidth: 2,
                    pointHoverBackgroundColor: "#198754"
                }
            ]
        },

        options: {
            responsive: true,
            maintainAspectRatio: false,

            interaction: {
                mode: "index",
                intersect: false
            },

            plugins: {

                title: {
                    display: true,
                    text: "Score vs Eventos vs Estabilidad - " + titulo,
                    color: "#000839",
                    font: {
                        size: 16,
                        weight: "bold"
                    }
                },

                legend: {
                    position: "bottom",
                    labels: {
                        usePointStyle: true,
                        pointStyle: "circle",
                        padding: 15,
                        color: "#000839",
                        font: {
                            weight: "600",
                            size: 12
                        }
                    }
                },

                tooltip: {
                    backgroundColor: "rgba(0, 8, 57, 0.92)",
                    titleColor: "#fff",
                    bodyColor: "#fff",
                    padding: 12,
                    cornerRadius: 10,
                    displayColors: true
                }
            },

            scales: {

                x: {
                    grid: { display: false },
                    ticks: { color: "#6c757d" }
                },

                y: {
                    beginAtZero: true,
                    grid: { color: "rgba(0,0,0,0.06)" },
                    ticks: { color: "#6c757d" }
                }
            }
        }
    });
}

function pintarGraficaCombinadaSemana(dias, titulo) {

    const canvas = document.getElementById("barChart");
    if (!canvas) return;

    const ctx = canvas.getContext("2d");

    if (graficaCombinada) graficaCombinada.destroy();

    const labels = dias.map(d => d.fecha);
    const scores = dias.map(d => d.score);
    const estabilidad = dias.map(d => d.estabilidad);

    const eventos = dias.map(d =>
        d.colisiones + d.aceleracionesBruscas + d.paradasBruscas
    );

    const scoreGradient = ctx.createLinearGradient(0, 0, 0, 350);
    scoreGradient.addColorStop(0, "rgba(0, 8, 57, 0.35)");
    scoreGradient.addColorStop(1, "rgba(0, 8, 57, 0.00)");

    const eventGradient = ctx.createLinearGradient(0, 0, 0, 350);
    eventGradient.addColorStop(0, "rgba(220, 53, 69, 0.25)");
    eventGradient.addColorStop(1, "rgba(220, 53, 69, 0.00)");

    const stabilityGradient = ctx.createLinearGradient(0, 0, 0, 350);
    stabilityGradient.addColorStop(0, "rgba(25, 135, 84, 0.25)");
    stabilityGradient.addColorStop(1, "rgba(25, 135, 84, 0.00)");

    graficaCombinada = new Chart(ctx, {
        type: "line",
        data: {
            labels,
            datasets: [

                {
                    label: "Score",
                    data: scores,
                    borderColor: "#000839",
                    backgroundColor: scoreGradient,
                    fill: true,
                    tension: 0.5,
                    borderWidth: 3,
                    pointRadius: 3,
                    pointHoverRadius: 7,
                    pointBackgroundColor: "#fff",
                    pointBorderColor: "#000839",
                    pointBorderWidth: 2,
                    pointHoverBackgroundColor: "#000839"
                },

                {
                    label: "Eventos",
                    data: eventos,
                    borderColor: "#dc3545",
                    backgroundColor: eventGradient,
                    fill: true,
                    tension: 0.5,
                    borderWidth: 3,
                    pointRadius: 3,
                    pointHoverRadius: 7,
                    pointBackgroundColor: "#fff",
                    pointBorderColor: "#dc3545",
                    pointBorderWidth: 2,
                    pointHoverBackgroundColor: "#dc3545"
                },

                {
                    label: "Estabilidad",
                    data: estabilidad,
                    borderColor: "#198754",
                    backgroundColor: stabilityGradient,
                    fill: true,
                    tension: 0.5,
                    borderWidth: 3,
                    pointRadius: 3,
                    pointHoverRadius: 7,
                    pointBackgroundColor: "#fff",
                    pointBorderColor: "#198754",
                    pointBorderWidth: 2,
                    pointHoverBackgroundColor: "#198754"
                }
            ]
        },

        options: {
            responsive: true,
            maintainAspectRatio: false,

            interaction: {
                mode: "index",
                intersect: false
            },

            plugins: {

                title: {
                    display: true,
                    text: "Score vs Eventos vs Estabilidad - " + titulo,
                    color: "#000839",
                    font: {
                        size: 18,
                        weight: "700"
                    },
                    padding: { bottom: 15 }
                },

                legend: {
                    position: "bottom",
                    labels: {
                        usePointStyle: true,
                        pointStyle: "circle",
                        padding: 18,
                        color: "#000839",
                        font: {
                            weight: "600",
                            size: 12
                        }
                    }
                },

                tooltip: {
                    backgroundColor: "rgba(0, 8, 57, 0.95)",
                    titleColor: "#fff",
                    bodyColor: "#fff",
                    padding: 14,
                    cornerRadius: 12,
                    displayColors: true
                }
            },

            scales: {

                x: {
                    grid: { display: false },
                    ticks: {
                        color: "#8a8f98",
                        font: { weight: "500" }
                    }
                },

                y: {
                    beginAtZero: true,
                    grid: { color: "rgba(0,0,0,0.04)" },
                    ticks: {
                        color: "#8a8f98",
                        font: { weight: "500" }
                    }
                }
            }
        }
    });
}

/* ==================================================
   RESUMEN DEL PERIODO
================================================== */

function calcularResumenDetalle(sesiones) {

    let colisiones = 0;
    let aceleracionesBruscas = 0;
    let paradasBruscas = 0;
    let tiempoMovimientoTotal = 0;
    let scoreTotal = 0;
    let estabilidadTotal = 0;
    let niveles = {};

    sesiones.forEach(function (sesion) {

        colisiones += numeroDetalle(obtenerCampo(sesion, ["colisiones"], 0));
        aceleracionesBruscas += numeroDetalle(obtenerCampo(sesion, ["aceleracionesBruscas", "aceleraciones_bruscas"], 0));
        paradasBruscas += numeroDetalle(obtenerCampo(sesion, ["paradasBruscas", "paradas_bruscas"], 0));
        tiempoMovimientoTotal += numeroDetalle(obtenerCampo(sesion, ["tiempoMovimiento", "tiempomovimiento", "tiempo_movimiento", "tiempo"], 0));
        scoreTotal += numeroDetalle(obtenerCampo(sesion, ["score"], 0));
        estabilidadTotal += numeroDetalle(obtenerCampo(sesion, ["estabilidad"], 0));

        const nivel = obtenerCampo(sesion, ["nivel"], "");

        if (nivel !== null && nivel !== undefined && String(nivel).trim() !== "") {

            const nivelTexto = String(nivel).trim();

            if (!niveles[nivelTexto]) {
                niveles[nivelTexto] = 0;
            }

            niveles[nivelTexto]++;

        }

    });

    const total = sesiones.length;

    const scoreMedioNumero = total > 0 ? scoreTotal / total : 0;
    const estabilidadMediaNumero = total > 0 ? estabilidadTotal / total : 0;

    return {
        totalSesiones: total,
        colisiones: colisiones,
        aceleracionesBruscas: aceleracionesBruscas,
        paradasBruscas: paradasBruscas,
        tiempoMovimiento: convertirTiempoMovimientoDetalle(tiempoMovimientoTotal),
        scoreMedioNumero: scoreMedioNumero,
        estabilidadMediaNumero: estabilidadMediaNumero,
        nivelMasFrecuente: obtenerNivelMasFrecuenteDetalle(niveles)
    };

}

function pintarResumenPeriodo(resumen) {

    ponerTextoDetalle("kpiSesiones", resumen.totalSesiones);
    ponerTextoDetalle("kpiColisiones", resumen.colisiones);
    ponerTextoDetalle("kpiAceleraciones", resumen.aceleracionesBruscas);
    ponerTextoDetalle("kpiParadas", resumen.paradasBruscas);
    ponerTextoDetalle("kpiScore", resumen.scoreMedioNumero.toFixed(2));
    ponerTextoDetalle("kpiEstabilidad", resumen.estabilidadMediaNumero.toFixed(2) + "%");
    ponerTextoDetalle("kpiTiempo", resumen.tiempoMovimiento);
    ponerTextoDetalle("kpiNivel", resumen.nivelMasFrecuente);

}

function obtenerNivelMasFrecuenteDetalle(niveles) {

    let nivelFinal = "-";
    let cantidadMayor = 0;

    for (let nivel in niveles) {

        if (niveles[nivel] > cantidadMayor) {
            cantidadMayor = niveles[nivel];
            nivelFinal = nivel;
        }

    }

    return nivelFinal;

}

function convertirTiempoMovimientoDetalle(total) {

    if (total === 0) {
        return "0 min 0 s";
    }

    let segundosTotales;

    if (total < 1000) {
        segundosTotales = Math.floor(total);
    } else {
        segundosTotales = Math.floor(total / 1000);
    }

    const horas = Math.floor(segundosTotales / 3600);
    const minutos = Math.floor((segundosTotales % 3600) / 60);
    const segundos = segundosTotales % 60;

    if (horas > 0) {
        return horas + " h " + minutos + " min " + segundos + " s";
    }

    return minutos + " min " + segundos + " s";

}

/* ==================================================
   PERIODO SELECCIONADO Y OBSERVACIONES
================================================== */

function pintarPeriodoSeleccionado() {

    const texto = document.getElementById("selectedPeriodText");
    const badge = document.getElementById("selectedPeriodBadge");
    const obsHeader = document.getElementById("obsHeader");

    if (texto) {
        texto.textContent = periodoSeleccionadoGlobal.textoPantalla;
    }

    if (badge) {
        badge.textContent = periodoSeleccionadoGlobal.badge;
    }

    if (obsHeader) {
        obsHeader.textContent = "OBSERVACIONES - " + periodoSeleccionadoGlobal.badge.toUpperCase();
    }

}

async function cargarObservacionActual() {

    const textarea = document.getElementById("patient-obs");

    if (!textarea) {
        return;
    }

    const pacienteId = obtenerPacienteIdDesdeURL();

    const ruta =
        "/observacion/find" +
        "?dniPaciente=" + encodeURIComponent(pacienteId) +
        "&tipoPeriodo=" + encodeURIComponent(periodoSeleccionadoGlobal.tipoPeriodo) +
        "&clavePeriodo=" + encodeURIComponent(periodoSeleccionadoGlobal.clavePeriodo);

    const observacion = await pedirUno([ruta]);

    if (observacion && observacion.texto !== undefined && observacion.texto !== null) {
        textarea.value = observacion.texto;
    } else {
        textarea.value = "";
    }

}

async function guardarObservacionActual() {

    const textarea = document.getElementById("patient-obs");

    if (!textarea) {
        return;
    }

    const pacienteId = obtenerPacienteIdDesdeURL();

    const datos = {
        dniPaciente: pacienteId,
        tipoPeriodo: periodoSeleccionadoGlobal.tipoPeriodo,
        fechaInicio: periodoSeleccionadoGlobal.fechaInicio || null,
        fechaFin: periodoSeleccionadoGlobal.fechaFin || null,
        clavePeriodo: periodoSeleccionadoGlobal.clavePeriodo,
        texto: textarea.value.trim()
    };

    try {

        let guardado = false;

        for (let i = 0; i < API_BASES_DETALLE.length; i++) {

            const response = await fetch(API_BASES_DETALLE[i] + "/observacion/save", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(datos)
            });

            if (response.ok) {
                guardado = true;
                break;
            }

        }

        if (guardado) {

            if (typeof mostrarToast === "function") {
                mostrarToast("Observación guardada correctamente.", "success");
            } else {
                console.log("Observación guardada correctamente.");
            }

        } else {

            if (typeof mostrarToast === "function") {
                mostrarToast("No se pudo guardar la observación.", "danger");
            } else {
                console.error("No se pudo guardar la observación.");
            }

        }

    } catch (error) {

        console.error("Error guardando observación:", error);

        if (typeof mostrarToast === "function") {
            mostrarToast("Error de conexión al guardar la observación.", "danger");
        }

    }

}

function obtenerPeriodoSeleccionadoDetalle() {
    return periodoSeleccionadoGlobal;
}

/* ==================================================
   FUNCIONES AUXILIARES
================================================== */

function agruparPorDia(sesiones) {

    const mapa = {};

    sesiones.forEach(s => {

        const fecha = obtenerFechaSesionDetalle(s);

        if (!mapa[fecha]) {
            mapa[fecha] = {
                fecha: fecha,
                score: 0,
                estabilidad: 0,
                colisiones: 0,
                aceleracionesBruscas: 0,
                paradasBruscas: 0,
                tiempoUsoTotal: 0,
                totalSesiones: 0
            };
        }

        mapa[fecha].score += numeroDetalle(obtenerCampo(s, ["score"], 0));
        mapa[fecha].estabilidad += numeroDetalle(obtenerCampo(s, ["estabilidad"], 0));

        mapa[fecha].colisiones += numeroDetalle(obtenerCampo(s, ["colisiones"], 0));
        mapa[fecha].aceleracionesBruscas += numeroDetalle(obtenerCampo(s, ["aceleracionesBruscas", "aceleraciones_bruscas"], 0));
        mapa[fecha].paradasBruscas += numeroDetalle(obtenerCampo(s, ["paradasBruscas", "paradas_bruscas"], 0));

        let duracion = numeroDetalle(obtenerCampo(s, [
            "tiempoMovimiento",
            "tiempo_movimiento",
            "duracion", 
            "duration", 
            "tiempoSesion",
            "tiempo_sesion"
        ], 0));
        
        if (duracion > 0) {
            const horas = duracion / 60;
            mapa[fecha].tiempoUsoTotal += horas;
        }

        mapa[fecha].totalSesiones += 1;
    });

    return Object.values(mapa);
}

async function pintarUsuarioHeader() {

    const usuarioHeader = document.getElementById("nombreUsuarioHeader");

    if (!usuarioHeader) {
        return;
    }

    const usuarioActivo = localStorage.getItem("usuarioActivo");

    if (!usuarioActivo || usuarioActivo.trim() === "") {
        usuarioHeader.textContent = "Usuario";
        return;
    }

    try {

        const fisios = await obtenerFisioterapeutasDetalle();

        const fisio = fisios.find(function (item) {
            return String(item.email).trim().toLowerCase() === String(usuarioActivo).trim().toLowerCase();
        });

        if (fisio) {

            const nombre = limpiarTextoUsuarioDetalle(fisio.nombre);
            const apellidos = limpiarTextoUsuarioDetalle(fisio.apellidos);
            const nombreCompleto = (nombre + " " + apellidos).trim();

            if (nombreCompleto !== "") {
                usuarioHeader.textContent = nombreCompleto;
            } else {
                usuarioHeader.textContent = usuarioActivo;
            }

        } else {
            usuarioHeader.textContent = usuarioActivo;
        }

    } catch (error) {

        console.error("No se pudo cargar el nombre del usuario:", error);
        usuarioHeader.textContent = usuarioActivo;

    }

}

async function obtenerFisioterapeutasDetalle() {

    const rutas = [
        "/fisioterapeuta/find",
        "/fisioterapeutas/find"
    ];

    for (let i = 0; i < API_BASES_DETALLE.length; i++) {

        const base = API_BASES_DETALLE[i];

        for (let j = 0; j < rutas.length; j++) {

            const url = base + rutas[j];

            try {

                const respuesta = await fetch(url);

                if (respuesta.ok) {

                    const datos = await respuesta.json();

                    if (Array.isArray(datos)) {
                        return datos;
                    }

                    if (datos) {
                        return [datos];
                    }

                }

            } catch (error) {

            }

        }

    }

    return [];

}

function limpiarTextoUsuarioDetalle(valor) {

    if (valor === null || valor === undefined) {
        return "";
    }

    const texto = String(valor).trim();

    if (texto === "" || texto.toLowerCase() === "pendiente") {
        return "";
    }

    return texto;

}

function ponerTextoDetalle(id, valor) {

    const elemento = document.getElementById(id);

    if (!elemento) {
        return;
    }

    if (valor === null || valor === undefined || String(valor).trim() === "") {
        elemento.textContent = "-";
    } else {
        elemento.textContent = valor;
    }

}

function limpiarDatoPaciente(valor) {

    if (valor === null || valor === undefined) {
        return "-";
    }

    const texto = String(valor).trim();

    if (texto === "" || texto.toLowerCase() === "pendiente" || texto === "0") {
        return "-";
    }

    return texto;

}

function limpiarTextoPaciente(valor) {

    if (valor === null || valor === undefined) {
        return "";
    }

    const texto = String(valor).trim();

    if (texto === "" || texto.toLowerCase() === "pendiente") {
        return "";
    }

    return texto;

}

function limpiarTelefonoPaciente(valor) {

    if (valor === null || valor === undefined) {
        return "-";
    }

    const texto = String(valor).trim();

    if (texto === "" || texto === "0") {
        return "-";
    }

    return texto;

}

function limpiarEmailPaciente(valor) {

    if (valor === null || valor === undefined) {
        return "-";
    }

    const texto = String(valor).trim();

    if (texto === "" || texto.toLowerCase() === "pendiente@pendiente.com") {
        return "-";
    }

    return texto;

}

function obtenerCampo(objeto, campos, valorDefecto) {

    for (let i = 0; i < campos.length; i++) {

        if (objeto && objeto[campos[i]] !== undefined && objeto[campos[i]] !== null) {
            return objeto[campos[i]];
        }

    }

    return valorDefecto;

}

function numeroDetalle(valor) {

    const n = Number(valor);

    return isNaN(n) ? 0 : n;

}

function obtenerFechaSesionDetalle(sesion) {

    const valor = obtenerCampo(sesion, [
        "tiempoSesion",
        "tiemposesion",
        "tiempo_sesion",
        "fecha",
        "timestamp"
    ], "");

    if (typeof valor === "string" && valor.includes("-")) {
        return valor.substring(0, 10);
    }

    if (typeof valor === "number") {
        const fecha = new Date(valor > 1000000000000 ? valor : valor * 1000);
        return formatearFechaDetalle(fecha);
    }

    return "";

}

function formatearFechaDetalle(fecha) {

    const anio = fecha.getFullYear();
    const mes = String(fecha.getMonth() + 1).padStart(2, "0");
    const dia = String(fecha.getDate()).padStart(2, "0");

    return anio + "-" + mes + "-" + dia;

}

window.actualizarGraficasGlobal = actualizarGraficasGlobal;
window.actualizarGraficasPorDia = actualizarGraficasPorDia;
window.actualizarGraficasPorSemana = actualizarGraficasPorSemana;
window.obtenerPeriodoSeleccionadoDetalle = obtenerPeriodoSeleccionadoDetalle;
window.cargarObservacionActual = cargarObservacionActual;