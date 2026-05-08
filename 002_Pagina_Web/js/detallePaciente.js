const API_BASES_DETALLE = [
    "http://localhost:8085",
    "http://localhost:8086",
    ""
];

let sesionesPacienteGlobal = [];
let graficaPie = null;
let graficaBarras = null;

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

    pintarGraficas(sesionesDia, "Día " + fecha);

}

function actualizarGraficasPorSemana(rango) {

    const sesionesSemana = sesionesPacienteGlobal.filter(function (sesion) {
        const fecha = obtenerFechaSesionDetalle(sesion);
        return fecha >= rango.inicio && fecha <= rango.fin;
    });

    pintarGraficas(sesionesSemana, rango.inicio + " a " + rango.fin);

}

function actualizarGraficasVacias() {

    pintarGraficas([], "Sin datos");

}

function pintarGraficas(sesiones, titulo) {

    const resumen = calcularResumenDetalle(sesiones);

    pintarGraficaPie(resumen, titulo);
    pintarGraficaBarras(resumen, titulo);

}

function pintarGraficaPie(resumen, titulo) {

    const canvas = document.getElementById("pieChart");

    if (!canvas) {
        return;
    }

    const ctx = canvas.getContext("2d");

    if (graficaPie) {
        graficaPie.destroy();
    }

    graficaPie = new Chart(ctx, {
        type: "doughnut",
        data: {
            labels: ["Colisiones", "Aceleraciones bruscas", "Paradas bruscas"],
            datasets: [{
                data: [
                    resumen.colisiones,
                    resumen.aceleracionesBruscas,
                    resumen.paradasBruscas
                ],
                backgroundColor: ["#dc3545", "#ffc107", "#0d6efd"]
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                title: {
                    display: true,
                    text: titulo
                },
                legend: {
                    position: "bottom"
                }
            }
        }
    });

}

function pintarGraficaBarras(resumen, titulo) {

    const canvas = document.getElementById("barChart");

    if (!canvas) {
        return;
    }

    const ctx = canvas.getContext("2d");

    if (graficaBarras) {
        graficaBarras.destroy();
    }

    graficaBarras = new Chart(ctx, {
        type: "bar",
        data: {
            labels: ["Resumen"],
            datasets: [
                {
                    label: "Score medio",
                    data: [resumen.scoreMedioNumero],
                    backgroundColor: "#000839"
                },
                {
                    label: "Estabilidad media",
                    data: [resumen.estabilidadMediaNumero],
                    backgroundColor: "#198754"
                },
                {
                    label: "Colisiones",
                    data: [resumen.colisiones],
                    backgroundColor: "#dc3545"
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                title: {
                    display: true,
                    text: titulo
                },
                legend: {
                    position: "bottom"
                }
            },
            scales: {
                y: {
                    beginAtZero: true
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