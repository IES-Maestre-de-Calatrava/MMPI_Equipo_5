console.log("inicio.js cargado");

const API_BASES_INICIO = [
    "http://localhost:8085",
    "http://localhost:8086",
    ""
];

document.addEventListener("DOMContentLoaded", function () {
    const btnLogout = document.getElementById("btnLogout");

    if (btnLogout) {
        btnLogout.addEventListener("click", function () {
            localStorage.removeItem("usuarioActivo");
        });
    }

    pintarUsuarioHeader();

    cargarPacientes();

    activarBusquedaPacientes();
});

async function cargarPacientes() {
    const container = document.getElementById("patient-container");

    if (!container) {
        return;
    }

    container.innerHTML = `
        <div class="text-center p-5" id="loading">
            <div class="spinner-border text-primary" role="status"></div>
            <p class="mt-2">Cargando pacientes...</p>
        </div>
    `;

    const pacientes = await obtenerPacientes();

    container.innerHTML = "";

    if (!pacientes || pacientes.length === 0) {
        container.innerHTML = `
            <div class="col-12 text-center text-muted p-5">
                <i class="bi bi-person-x fs-1"></i>
                <p class="mt-3">No hay pacientes registrados.</p>
            </div>
        `;
        return;
    }

    pacientes.forEach(function (paciente) {
        const card = crearTarjetaPaciente(paciente);
        container.appendChild(card);
    });
}

async function obtenerPacientes() {
    const rutas = [
        "/paciente/find",
        "/pacientes/find",
        "/api/pacientes/all"
    ];

    for (let i = 0; i < API_BASES_INICIO.length; i++) {
        const base = API_BASES_INICIO[i];

        for (let j = 0; j < rutas.length; j++) {
            const url = base + rutas[j];

            try {
                const respuesta = await fetch(url);

                if (respuesta.ok) {
                    const datos = await respuesta.json();

                    if (Array.isArray(datos)) {
                        console.log("Pacientes cargados desde:", url);
                        return datos;
                    }

                    if (datos) {
                        console.log("Paciente único cargado desde:", url);
                        return [datos];
                    }
                }
            } catch (error) {
                console.warn("No respondió:", url);
            }
        }
    }

    console.error("No se pudieron cargar pacientes desde ningún endpoint.");
    return [];
}

function crearTarjetaPaciente(paciente) {
    const columna = document.createElement("div");
    columna.className = "col-12 col-xl-6";

    const idPaciente = obtenerIdPaciente(paciente);

    const nombre = limpiarNombreInicio(
        obtenerCampoPaciente(paciente, ["nombre", "name"], "Paciente")
    );

    const apellidosOriginal = obtenerCampoPaciente(
        paciente,
        ["apellidos", "apellido", "surname"],
        ""
    );

    const apellidos = limpiarTextoVacioInicio(apellidosOriginal);
    const nombreCompleto = (nombre + " " + apellidos).trim();

    const edad = limpiarPendienteInicio(
        obtenerCampoPaciente(paciente, ["edad"], "-")
    );

    const localidad = limpiarPendienteInicio(
        obtenerCampoPaciente(paciente, ["localidad", "ciudad", "domicilio"], "Pendiente")
    );

    const telefono = limpiarTelefonoInicio(
        obtenerCampoPaciente(paciente, ["telefono"], "0")
    );

    const descripcion = obtenerCampoPaciente(
        paciente,
        ["descripcion", "observaciones"],
        "Sin descripción disponible."
    );

    const foto = obtenerCampoPaciente(
        paciente,
        ["fotoUrl", "foto", "imagen"],
        "../media/imgs/nino.png"
    );

    const datosCompletos = Number(
        obtenerCampoPaciente(paciente, ["datosCompletos", "datos_completos"], 1)
    );

    const estaPendiente = datosCompletos === 0;

    let avisoPendiente = "";

    if (estaPendiente) {
        avisoPendiente = `
            <div class="alert alert-warning py-1 px-2 mb-2 fw-bold d-inline-flex align-items-center gap-2 patient-alert-compact">
                <i class="bi bi-exclamation-triangle-fill"></i>
                <span>Datos pendientes</span>
            </div>
        `;
    }

    let botonCompletar = "";

    if (estaPendiente) {
        const volver = encodeURIComponent("inicio.html");

        botonCompletar = `
            <a 
                href="anadir_paciente.html?id=${encodeURIComponent(idPaciente)}&modo=completar&volver=${volver}"
                class="btn btn-warning fw-bold rounded-3 px-3 py-2 mt-1 patient-complete-compact"
                onclick="event.stopPropagation();"
            >
                <i class="bi bi-pencil-square me-2"></i> Completar datos
            </a>
        `;
    }

    columna.innerHTML = `
        <div 
            class="patient-card-horizontal card border-0 shadow-sm rounded-4 overflow-hidden text-white h-100"
            onclick="window.location.href='informacion.html?id=${encodeURIComponent(idPaciente)}'"
        >
            <div class="row g-0 align-items-center h-100">

                <div class="col-4 p-3">
                    <div class="bg-light rounded-3 d-flex justify-content-center align-items-center patient-avatar-box">
                        <img 
                            src="${foto}" 
                            alt="${escaparHTMLInicio(nombreCompleto)}"
                            class="img-fluid patient-avatar-img"
                            onerror="this.src='../media/imgs/nino.png'"
                        >
                    </div>
                </div>

                <div class="col-8 p-3">

                    <h4 class="fw-bold text-uppercase mb-2 patient-title-compact">
                        ${escaparHTMLInicio(nombreCompleto)}
                    </h4>

                    ${avisoPendiente}

                    <div class="small mb-2 patient-info-compact">
                        <p class="mb-1"><strong>Edad:</strong> ${escaparHTMLInicio(edad)} años</p>
                        <p class="mb-1"><strong>Localidad:</strong> ${escaparHTMLInicio(localidad)}</p>
                        <p class="mb-1"><strong>Teléfono:</strong> ${escaparHTMLInicio(telefono)}</p>
                    </div>

                    <p class="mb-2 text-white-50 patient-desc-compact">
                        ${escaparHTMLInicio(descripcion)}
                    </p>

                    ${botonCompletar}

                </div>

            </div>
        </div>
    `;

    return columna;
}

function obtenerIdPaciente(paciente) {
    const posibles = [
        "id",
        "idPaciente",
        "dni",
        "dniPaciente",
        "identificacion"
    ];

    for (let i = 0; i < posibles.length; i++) {
        const campo = posibles[i];

        if (
            paciente[campo] !== undefined &&
            paciente[campo] !== null &&
            String(paciente[campo]).trim() !== ""
        ) {
            return paciente[campo];
        }
    }

    return "1";
}

function obtenerCampoPaciente(objeto, campos, valorDefecto) {
    for (let i = 0; i < campos.length; i++) {
        const campo = campos[i];

        if (
            objeto &&
            objeto[campo] !== undefined &&
            objeto[campo] !== null &&
            String(objeto[campo]).trim() !== ""
        ) {
            return objeto[campo];
        }
    }

    return valorDefecto;
}

function limpiarPendienteInicio(valor) {
    if (valor === null || valor === undefined) {
        return "-";
    }

    const texto = String(valor).trim();

    if (texto === "") {
        return "-";
    }

    if (texto.toLowerCase() === "pendiente") {
        return "-";
    }

    return texto;
}

function limpiarTextoVacioInicio(valor) {
    if (valor === null || valor === undefined) {
        return "";
    }

    const texto = String(valor).trim();

    if (texto === "") {
        return "";
    }

    if (texto.toLowerCase() === "pendiente") {
        return "";
    }

    return texto;
}

function limpiarNombreInicio(valor) {
    if (valor === null || valor === undefined) {
        return "Paciente";
    }

    const texto = String(valor).trim();

    if (texto === "") {
        return "Paciente";
    }

    return texto;
}

function limpiarTelefonoInicio(valor) {
    if (valor === null || valor === undefined) {
        return "-";
    }

    const texto = String(valor).trim();

    if (texto === "" || texto === "0") {
        return "-";
    }

    return texto;
}

function escaparHTMLInicio(texto) {
    return String(texto)
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
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

function activarBusquedaPacientes() {
    const inputBusqueda = document.getElementById("searchInput");
    const botonBusqueda = document.getElementById("btnSearch");

    if (!inputBusqueda || !botonBusqueda) {
        return;
    }

    let buscadorVisible = false;

    botonBusqueda.addEventListener("click", function () {
        if (!buscadorVisible) {
            inputBusqueda.classList.remove("d-none");
            inputBusqueda.focus();
            buscadorVisible = true;
            return;
        }

        realizarBusqueda();
    });

    inputBusqueda.addEventListener("keyup", function (event) {
        if (event.key === "Enter") {
            realizarBusqueda();
        }

        if (inputBusqueda.value.trim() === "") {
            cargarPacientes();
        }
    });
}

async function realizarBusqueda() {
    const inputBusqueda = document.getElementById("searchInput");
    const container = document.getElementById("patient-container");

    if (!inputBusqueda || !container) {
        return;
    }

    const textoBusqueda = inputBusqueda.value.toLowerCase().trim();

    if (textoBusqueda === "") {
        cargarPacientes();
        return;
    }

    const pacientes = await obtenerPacientes();

    container.innerHTML = "";

    const pacientesFiltrados = pacientes.filter(function (paciente) {
        const nombre = obtenerCampoPaciente(
            paciente,
            ["nombre", "name"],
            ""
        );

        const apellidos = obtenerCampoPaciente(
            paciente,
            ["apellidos", "apellido", "surname"],
            ""
        );

        const dni = obtenerCampoPaciente(
            paciente,
            ["dniPaciente", "dni", "idPaciente", "id"],
            ""
        );

        const localidad = obtenerCampoPaciente(
            paciente,
            ["localidad", "ciudad", "domicilio"],
            ""
        );

        const nombreCompleto = (nombre + " " + apellidos).toLowerCase();

        return nombreCompleto.includes(textoBusqueda) ||
               String(dni).toLowerCase().includes(textoBusqueda) ||
               String(localidad).toLowerCase().includes(textoBusqueda);
    });

    if (pacientesFiltrados.length === 0) {
        container.innerHTML = `
            <div class="col-12 text-center text-muted p-5">
                <i class="bi bi-search fs-1"></i>
                <p class="mt-3">No se encontraron pacientes.</p>
            </div>
        `;
        return;
    }

    pacientesFiltrados.forEach(function (paciente) {
        const card = crearTarjetaPaciente(paciente);
        container.appendChild(card);
    });
}