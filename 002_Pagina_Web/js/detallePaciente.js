const API_BASES_DETALLE = [
    "http://localhost:8085",
    "http://localhost:8086",
    ""
];

let sesionesPacienteGlobal = [];
let graficaDonut = null;
let graficaLineas = null;

document.addEventListener("DOMContentLoaded", async function () {

    pintarUsuarioHeader();

    const pacienteId = obtenerPacienteIdDesdeURL();
    document.getElementById("pacienteId").value = pacienteId;

    await cargarDatosPaciente(pacienteId);

    sesionesPacienteGlobal = await cargarSesionesPaciente(pacienteId);

    if (sesionesPacienteGlobal.length > 0) {
        const primeraFecha = obtenerFechaSesionDetalle(sesionesPacienteGlobal[0]);
        actualizarGraficasPorDia(primeraFecha);
    } else {
        actualizarGraficasVacias();
    }

    const btnSave = document.getElementById("btn-save");

    if (btnSave) {
        btnSave.addEventListener("click", function () {
            alert("Observaciones guardadas correctamente.");
        });
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

    document.getElementById("patient-name").textContent = nombreCompleto;

    ponerTextoDetalle("patient-dni", dni);
    ponerTextoDetalle("patient-age", edad);
    ponerTextoDetalle("patient-city", localidad);
    ponerTextoDetalle("patient-phone", telefono);
    ponerTextoDetalle("patient-email", email);

    if (datosCompletos === 0) {
        document.getElementById("patient-level").textContent = "Estado: Pendiente";
    } else {
        document.getElementById("patient-level").textContent = "Estado: Completo";
    }

    configurarBotonesPaciente(dni, datosCompletos);

}

function pintarPacienteFallback() {

    document.getElementById("patient-name").textContent = "PACIENTE";

    ponerTextoDetalle("patient-dni", "-");
    ponerTextoDetalle("patient-age", "-");
    ponerTextoDetalle("patient-city", "-");
    ponerTextoDetalle("patient-phone", "-");
    ponerTextoDetalle("patient-email", "-");

    document.getElementById("patient-level").textContent = "Estado: -";

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
   GRÁFICAS
================================================== */

function actualizarGraficasPorDia(fecha) {

    const sesionesDia = sesionesPacienteGlobal.filter(function (sesion) {
        return obtenerFechaSesionDetalle(sesion) === fecha;
    });

    pintarGraficas(sesionesDia, "Día " + fecha, "dia");

}

function actualizarGraficasPorSemana(rango) {

    const sesionesSemana = sesionesPacienteGlobal.filter(function (sesion) {
        const fecha = obtenerFechaSesionDetalle(sesion);
        return fecha >= rango.inicio && fecha <= rango.fin;
    });

    const dias = agruparPorDia(sesionesSemana);

    pintarGraficas(dias, "SEMANA " + rango.inicio + " → " + rango.fin, "semana");
}

function actualizarGraficasVacias() {

    pintarGraficas([], "Sin datos");

}

function pintarGraficas(data, titulo, modo = "dia") {

    if (modo === "semana") {

        pintarGraficaDonutSemana(data, titulo);
        pintarGraficaLineasSemana(data, titulo);
        pintarGraficaCombinadaSemana(data, titulo);

        return;
    }

    // DAILY MODE (old behavior)
    const resumen = calcularResumenDetalle(data);

    // Extract date from first session if available
    let fechaInicio = null;
    let fechaFin = null;
    if (data.length > 0) {
        fechaInicio = obtenerFechaSesionDetalle(data[0]);
        fechaFin = obtenerFechaSesionDetalle(data[data.length - 1]);
    }

    pintarGraficaDonut(resumen, titulo, fechaInicio, fechaFin);
    pintarGraficaLineas(data, titulo);
    pintarGraficaCombinada(data, titulo);
}

function pintarGraficasSemana(dias, titulo) {

    const labels = dias.map(d => d.fecha);

    const scores = dias.map(d => d.score);
    const estabilidad = dias.map(d => d.estabilidad);
    const eventos = dias.map(d =>
        d.colisiones + d.aceleracionesBruscas + d.paradasBruscas
    );

    const canvas = document.getElementById("lineChart");
    if (!canvas) return;

    const ctx = canvas.getContext("2d");

    if (graficaLineas) graficaLineas.destroy();

    graficaLineas = new Chart(ctx, {
        type: "line",
        data: {
            labels,
            datasets: [{
                label: "Score diario (sumado)",
                data: scores,
                borderColor: "#000839",
                fill: true,
                tension: 0.4
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                title: {
                    display: true,
                    text: "SEMANA: " + titulo
                }
            }
        }
    });
}

function pintarGraficaDonut(resumen, titulo, fechaInicio = null, fechaFin = null) {

    const canvas = document.getElementById("donutChart");

    if (!canvas) return;

    const ctx = canvas.getContext("2d");

    if (graficaDonut) {
        graficaDonut.destroy();
    }

    let tituloFinal = titulo;
    if (fechaInicio && fechaFin) {
        if (fechaInicio === fechaFin) {
            tituloFinal = "Eventos por día " + fechaInicio;
        } else {
            tituloFinal = "Eventos por semana " + fechaInicio + " hasta " + fechaFin;
        }
    }

    graficaDonut = new Chart(ctx, {

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

    // Extract week dates
    let fechaInicio = null;
    let fechaFin = null;
    if (dias.length > 0) {
        fechaInicio = dias[0].fecha;
        fechaFin = dias[dias.length - 1].fecha;
    }

    pintarGraficaDonut(resumen, titulo, fechaInicio, fechaFin);
}

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

    // Calculate cumulative usage time in hours
    let cumulativeTime = 0;
    const tiempoUso = sesiones.map((sesion, idx) => {
        // The field is tiempoMovimiento (in minutes)
        let duracion = numeroDetalle(obtenerCampo(sesion, [
            "tiempoMovimiento",
            "tiempo_movimiento",
            "duracion", 
            "duration", 
            "tiempoSesion",
            "tiempo_sesion"
        ], 0));
        
        // Convert from minutes to hours
        const horas = duracion / 60;
        cumulativeTime += horas;
        
        return Math.round(cumulativeTime * 100) / 100; // Round to 2 decimals for precision
    });

    // 🌊 deep glow gradient
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

                    // ✨ modern points
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

function pintarGraficaCombinada(sesiones, titulo) {

    const canvas = document.getElementById("combinedChart");
    if (!canvas) return;

    const ctx = canvas.getContext("2d");

    if (window.graficaCombinada) {
        window.graficaCombinada.destroy();
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

    // 🌊 Gradients
    const scoreGradient = ctx.createLinearGradient(0, 0, 0, 300);
    scoreGradient.addColorStop(0, "rgba(0, 8, 57, 0.35)");
    scoreGradient.addColorStop(1, "rgba(0, 8, 57, 0.00)");

    const eventGradient = ctx.createLinearGradient(0, 0, 0, 300);
    eventGradient.addColorStop(0, "rgba(220, 53, 69, 0.30)");
    eventGradient.addColorStop(1, "rgba(220, 53, 69, 0.00)");

    const stabilityGradient = ctx.createLinearGradient(0, 0, 0, 300);
    stabilityGradient.addColorStop(0, "rgba(25, 135, 84, 0.30)");
    stabilityGradient.addColorStop(1, "rgba(25, 135, 84, 0.00)");

    window.graficaCombinada = new Chart(ctx, {
        type: "line",
        data: {
            labels,
            datasets: [

                // 🧠 SCORE (primary)
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

                // 🚨 EVENTS (negative metric)
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

                // ⚖️ STABILITY (new positive control metric)
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

    const canvas = document.getElementById("combinedChart");
    if (!canvas) return;

    const ctx = canvas.getContext("2d");

    if (window.graficaCombinada) window.graficaCombinada.destroy();

    const labels = dias.map(d => d.fecha);
    const scores = dias.map(d => d.score);
    const estabilidad = dias.map(d => d.estabilidad);

    const eventos = dias.map(d =>
        d.colisiones + d.aceleracionesBruscas + d.paradasBruscas
    );

    // 🌊 gradients (IMPORTANT: per dataset)
    const scoreGradient = ctx.createLinearGradient(0, 0, 0, 350);
    scoreGradient.addColorStop(0, "rgba(0, 8, 57, 0.35)");
    scoreGradient.addColorStop(1, "rgba(0, 8, 57, 0.00)");

    const eventGradient = ctx.createLinearGradient(0, 0, 0, 350);
    eventGradient.addColorStop(0, "rgba(220, 53, 69, 0.25)");
    eventGradient.addColorStop(1, "rgba(220, 53, 69, 0.00)");

    const stabilityGradient = ctx.createLinearGradient(0, 0, 0, 350);
    stabilityGradient.addColorStop(0, "rgba(25, 135, 84, 0.25)");
    stabilityGradient.addColorStop(1, "rgba(25, 135, 84, 0.00)");

    window.graficaCombinada = new Chart(ctx, {
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

function calcularResumenDetalle(sesiones) {

    let colisiones = 0;
    let aceleracionesBruscas = 0;
    let paradasBruscas = 0;
    let scoreTotal = 0;
    let estabilidadTotal = 0;

    sesiones.forEach(function (sesion) {

        colisiones += numeroDetalle(obtenerCampo(sesion, ["colisiones"], 0));
        aceleracionesBruscas += numeroDetalle(obtenerCampo(sesion, ["aceleracionesBruscas", "aceleraciones_bruscas"], 0));
        paradasBruscas += numeroDetalle(obtenerCampo(sesion, ["paradasBruscas", "paradas_bruscas"], 0));
        scoreTotal += numeroDetalle(obtenerCampo(sesion, ["score"], 0));
        estabilidadTotal += numeroDetalle(obtenerCampo(sesion, ["estabilidad"], 0));

    });

    const total = sesiones.length;

    const scoreMedioNumero = total > 0 ? scoreTotal / total : 0;
    const estabilidadMediaNumero = total > 0 ? estabilidadTotal / total : 0;

    return {
        colisiones: colisiones,
        aceleracionesBruscas: aceleracionesBruscas,
        paradasBruscas: paradasBruscas,
        scoreMedioNumero: scoreMedioNumero,
        estabilidadMediaNumero: estabilidadMediaNumero
    };

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

        // Add tiempo de uso (convert from minutes to hours)
        let duracion = numeroDetalle(obtenerCampo(s, [
            "tiempoMovimiento",
            "tiempo_movimiento",
            "duracion", 
            "duration", 
            "tiempoSesion",
            "tiempo_sesion"
        ], 0));
        
        if (duracion > 0) {
            const horas = duracion / 60; // Convert from minutes to hours
            mapa[fecha].tiempoUsoTotal += horas;
        }

        mapa[fecha].totalSesiones += 1;
    });

    return Object.values(mapa);
}

function pintarUsuarioHeader() {

    const usuarioHeader = document.getElementById("nombreUsuarioHeader");

    if (!usuarioHeader) {
        return;
    }

    const usuarioActivo = localStorage.getItem("usuarioActivo");

    if (usuarioActivo && usuarioActivo.trim() !== "") {
        usuarioHeader.textContent = usuarioActivo;
    } else {
        usuarioHeader.textContent = "Usuario";
    }

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

window.actualizarGraficasPorDia = actualizarGraficasPorDia;
window.actualizarGraficasPorSemana = actualizarGraficasPorSemana;