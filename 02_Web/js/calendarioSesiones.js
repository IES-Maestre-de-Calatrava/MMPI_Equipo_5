console.log("calendarioSesiones.js cargado");

const API_BASES_CALENDARIO = [
    "http://localhost:8085",
    "http://localhost:8086",
    ""
];

let fechasConDatosCalendario = [];
let semanasConDatosCalendario = [];

document.addEventListener("DOMContentLoaded", function () {
    prepararInputsCalendario();
    cargarCalendariosConSesiones();
});

function prepararInputsCalendario() {
    prepararInputCalendario("fechaSeleccionada", "Selecciona un día");
    prepararInputCalendario("semanaVisual", "Selecciona una semana");
}

function prepararInputCalendario(id, placeholder) {
    const input = document.getElementById(id);

    if (input) {
        input.readOnly = true;
        input.placeholder = placeholder;
        input.style.cursor = "pointer";
        input.style.backgroundColor = "white";

        input.addEventListener("keydown", function (event) {
            event.preventDefault();
        });
    }
}

async function cargarCalendariosConSesiones() {
    const pacienteId = obtenerPacienteIdCalendario();
    const sesiones = await obtenerSesionesParaCalendario();

    const sesionesPaciente = filtrarSesionesPorPacienteCalendario(sesiones, pacienteId);

    fechasConDatosCalendario = obtenerFechasConDatosCalendario(sesionesPaciente);
    semanasConDatosCalendario = obtenerSemanasConDatosCalendario(sesionesPaciente);

    iniciarCalendarioDiario();
    iniciarCalendarioSemanal();
}

function obtenerPacienteIdCalendario() {
    const input = document.getElementById("pacienteId");

    if (input && input.value && input.value.trim() !== "") {
        return input.value.trim();
    }

    const params = new URLSearchParams(window.location.search);

    return params.get("id") || params.get("dni") || "1";
}

function filtrarSesionesPorPacienteCalendario(sesiones, pacienteId) {
    if (!sesiones || sesiones.length === 0) {
        return [];
    }

    const haySesionesConPaciente = sesiones.some(function (sesion) {
        return sesionTienePacienteCalendario(sesion);
    });

    if (!haySesionesConPaciente) {
        return sesiones;
    }

    return sesiones.filter(function (sesion) {
        return perteneceAlPacienteCalendario(sesion, pacienteId);
    });
}

function perteneceAlPacienteCalendario(sesion, pacienteId) {
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

function sesionTienePacienteCalendario(sesion) {
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

async function obtenerSesionesParaCalendario() {
    for (let i = 0; i < API_BASES_CALENDARIO.length; i++) {
        const base = API_BASES_CALENDARIO[i];

        try {
            const respuesta = await fetch(base + "/sesion/find");

            if (respuesta.ok) {
                return await respuesta.json();
            }
        } catch (error) {
            console.warn("No respondió " + base + "/sesion/find");
        }
    }

    return [];
}

function obtenerFechasConDatosCalendario(sesiones) {
    const fechas = [];

    sesiones.forEach(function (sesion) {
        const fecha = obtenerFechaSesionCalendario(sesion);

        if (fecha !== "" && !fechas.includes(fecha)) {
            fechas.push(fecha);
        }
    });

    fechas.sort();

    return fechas;
}

function obtenerSemanasConDatosCalendario(sesiones) {
    const semanas = [];

    sesiones.forEach(function (sesion) {
        const fechaTexto = obtenerFechaSesionCalendario(sesion);

        if (fechaTexto !== "") {
            const fecha = crearFechaLocalCalendario(fechaTexto);
            const semana = obtenerSemanaISOCalendario(fecha);

            if (!semanas.includes(semana)) {
                semanas.push(semana);
            }
        }
    });

    semanas.sort();

    return semanas;
}

function iniciarCalendarioDiario() {
    const input = document.getElementById("fechaSeleccionada");

    if (!input || typeof flatpickr === "undefined") {
        return;
    }

    destruirCalendarioSiExiste("fechaSeleccionada");

    flatpickr("#fechaSeleccionada", {
        dateFormat: "Y-m-d",
        locale: "es",
        allowInput: false,
        clickOpens: true,
        disableMobile: true,

        onReady: function (selectedDates, dateStr, fp) {
            prepararInputFlatpickr(fp);

            if (fechasConDatosCalendario.length > 0) {
                fp.jumpToDate(fechasConDatosCalendario[0]);
            }

            pintarDiasConDatos(fp);
        },

        onOpen: function (selectedDates, dateStr, fp) {
            if (!dateStr && fechasConDatosCalendario.length > 0) {
                fp.jumpToDate(fechasConDatosCalendario[0]);
            }

            setTimeout(function () {
                pintarDiasConDatos(fp);
            }, 20);
        },

        onMonthChange: function (selectedDates, dateStr, fp) {
            setTimeout(function () {
                pintarDiasConDatos(fp);
            }, 20);
        },

        onYearChange: function (selectedDates, dateStr, fp) {
            setTimeout(function () {
                pintarDiasConDatos(fp);
            }, 20);
        },

        onChange: function (selectedDates, dateStr, fp) {
            pintarDiasConDatos(fp);

            if (dateStr !== "" && typeof window.actualizarGraficasPorDia === "function") {
                window.actualizarGraficasPorDia(dateStr);
            }
        }
    });
}

function iniciarCalendarioSemanal() {
    const input = document.getElementById("semanaVisual");

    if (!input || typeof flatpickr === "undefined") {
        return;
    }

    destruirCalendarioSiExiste("semanaVisual");

    flatpickr("#semanaVisual", {
        dateFormat: "Y-m-d",
        locale: "es",
        allowInput: false,
        clickOpens: true,
        disableMobile: true,

        onReady: function (selectedDates, dateStr, fp) {
            prepararInputFlatpickr(fp);

            if (fechasConDatosCalendario.length > 0) {
                fp.jumpToDate(fechasConDatosCalendario[0]);
            }

            pintarSemanasConDatos(fp);
        },

        onOpen: function (selectedDates, dateStr, fp) {
            if (!dateStr && fechasConDatosCalendario.length > 0) {
                fp.jumpToDate(fechasConDatosCalendario[0]);
            }

            setTimeout(function () {
                pintarSemanasConDatos(fp);
            }, 20);
        },

        onMonthChange: function (selectedDates, dateStr, fp) {
            setTimeout(function () {
                pintarSemanasConDatos(fp);
            }, 20);
        },

        onYearChange: function (selectedDates, dateStr, fp) {
            setTimeout(function () {
                pintarSemanasConDatos(fp);
            }, 20);
        },

        onChange: function (selectedDates, dateStr, fp) {
            if (selectedDates.length > 0) {
                const fecha = selectedDates[0];
                const semanaISO = obtenerSemanaISOCalendario(fecha);
                const rango = obtenerRangoSemanaCalendario(fecha);

                const semanaReporte = document.getElementById("semanaReporte");
                const semanaVisual = document.getElementById("semanaVisual");

                if (semanaReporte) {
                    semanaReporte.value = semanaISO;
                }

                if (semanaVisual) {
                    semanaVisual.value = rango.inicio + " a " + rango.fin;
                }

                setTimeout(function () {
                    pintarSemanasConDatos(fp);
                    pintarSemanaSeleccionada(fp, semanaISO);
                }, 20);

                if (typeof window.actualizarGraficasPorSemana === "function") {
                    window.actualizarGraficasPorSemana(rango);
                }
            }
        }
    });
}

function prepararInputFlatpickr(fp) {
    fp.input.readOnly = true;
    fp.input.style.cursor = "pointer";
    fp.input.style.backgroundColor = "white";
}

function pintarDiasConDatos(fp) {
    const dias = fp.calendarContainer.querySelectorAll(".flatpickr-day");

    dias.forEach(function (dia) {
        limpiarEstiloDiaCalendario(dia);

        if (!dia.dateObj) {
            return;
        }

        const fecha = formatearFechaCalendario(dia.dateObj);

        if (fechasConDatosCalendario.includes(fecha)) {
            dia.classList.add("dia-con-datos");
            dia.style.backgroundColor = "#000839";
            dia.style.color = "white";
            dia.style.border = "2px solid #000839";
            dia.style.fontWeight = "bold";
            dia.style.borderRadius = "8px";
            dia.title = "Hay datos registrados este día para este paciente";
        }
    });
}

function pintarSemanasConDatos(fp) {
    const dias = fp.calendarContainer.querySelectorAll(".flatpickr-day");

    dias.forEach(function (dia) {
        limpiarEstiloDiaCalendario(dia);

        if (!dia.dateObj) {
            return;
        }

        const semana = obtenerSemanaISOCalendario(dia.dateObj);

        if (semanasConDatosCalendario.includes(semana)) {
            dia.classList.add("semana-con-datos");
            dia.style.backgroundColor = "#d7f3df";
            dia.style.color = "#000839";
            dia.style.border = "2px solid #198754";
            dia.style.fontWeight = "bold";
            dia.style.borderRadius = "8px";
            dia.title = "Hay datos registrados esta semana para este paciente";
        }
    });
}

function pintarSemanaSeleccionada(fp, semanaSeleccionada) {
    const dias = fp.calendarContainer.querySelectorAll(".flatpickr-day");

    dias.forEach(function (dia) {
        if (!dia.dateObj) {
            return;
        }

        const semana = obtenerSemanaISOCalendario(dia.dateObj);

        if (semana === semanaSeleccionada) {
            dia.style.backgroundColor = "#000839";
            dia.style.color = "white";
            dia.style.border = "2px solid #000839";
            dia.style.fontWeight = "bold";
            dia.style.borderRadius = "8px";
        }
    });
}

function limpiarEstiloDiaCalendario(dia) {
    dia.classList.remove("dia-con-datos");
    dia.classList.remove("semana-con-datos");

    dia.style.backgroundColor = "";
    dia.style.color = "";
    dia.style.border = "";
    dia.style.fontWeight = "";
    dia.style.borderRadius = "";
    dia.title = "";
}

function destruirCalendarioSiExiste(id) {
    const input = document.getElementById(id);

    if (input && input._flatpickr) {
        input._flatpickr.destroy();
    }
}

function obtenerFechaSesionCalendario(sesion) {
    const valor = obtenerValorCampoCalendario(sesion, [
        "tiempoSesion",
        "tiemposesion",
        "tiempo_sesion",
        "fecha",
        "timestamp"
    ]);

    if (valor === null || valor === undefined) {
        return "";
    }

    if (typeof valor === "string") {
        if (valor.includes("-")) {
            return valor.substring(0, 10);
        }

        const numero = Number(valor);

        if (!isNaN(numero)) {
            return fechaDesdeTimestampCalendario(numero);
        }
    }

    if (typeof valor === "number") {
        return fechaDesdeTimestampCalendario(valor);
    }

    return "";
}

function fechaDesdeTimestampCalendario(timestamp) {
    let fecha;

    if (timestamp > 1000000000000) {
        fecha = new Date(timestamp);
    } else {
        fecha = new Date(timestamp * 1000);
    }

    return formatearFechaCalendario(fecha);
}

function obtenerValorCampoCalendario(objeto, campos) {
    for (let i = 0; i < campos.length; i++) {
        const campo = campos[i];

        if (objeto && objeto[campo] !== undefined && objeto[campo] !== null) {
            return objeto[campo];
        }
    }

    return null;
}

function crearFechaLocalCalendario(fechaTexto) {
    const partes = fechaTexto.split("-");
    const anio = Number(partes[0]);
    const mes = Number(partes[1]) - 1;
    const dia = Number(partes[2]);

    return new Date(anio, mes, dia);
}

function obtenerSemanaISOCalendario(fechaOriginal) {
    const fecha = new Date(Date.UTC(
        fechaOriginal.getFullYear(),
        fechaOriginal.getMonth(),
        fechaOriginal.getDate()
    ));

    const dia = fecha.getUTCDay() || 7;

    fecha.setUTCDate(fecha.getUTCDate() + 4 - dia);

    const anio = fecha.getUTCFullYear();
    const inicioAnio = new Date(Date.UTC(anio, 0, 1));
    const semana = Math.ceil((((fecha - inicioAnio) / 86400000) + 1) / 7);

    return anio + "-W" + String(semana).padStart(2, "0");
}

function obtenerRangoSemanaCalendario(fechaOriginal) {
    const fecha = new Date(
        fechaOriginal.getFullYear(),
        fechaOriginal.getMonth(),
        fechaOriginal.getDate()
    );

    const diaSemana = fecha.getDay();
    const diferenciaLunes = fecha.getDate() - diaSemana + (diaSemana === 0 ? -6 : 1);

    const lunes = new Date(fecha);
    lunes.setDate(diferenciaLunes);

    const domingo = new Date(lunes);
    domingo.setDate(lunes.getDate() + 6);

    return {
        inicio: formatearFechaCalendario(lunes),
        fin: formatearFechaCalendario(domingo)
    };
}

function formatearFechaCalendario(fecha) {
    const anio = fecha.getFullYear();
    const mes = String(fecha.getMonth() + 1).padStart(2, "0");
    const dia = String(fecha.getDate()).padStart(2, "0");

    return anio + "-" + mes + "-" + dia;
}