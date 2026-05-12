console.log("notificaciones.js cargado");

const STORAGE_NOTIFICACIONES = "mmpi_notificaciones";
const STORAGE_PACIENTES_VISTOS = "mmpi_pacientes_vistos";

let filtroNotificacionesActual = "todos";

/* ==================================================
   TOASTS
================================================== */

function mostrarToast(mensaje, tipo, duracion) {
    const tipoFinal = tipo || "info";
    const duracionFinal = duracion || obtenerDuracionToast(tipoFinal);

    if (tipoFinal === "warning") {
        guardarNotificacion({
            categoria: "aviso",
            titulo: "Aviso general",
            mensaje: mensaje
        });
    }

    const contenedor = obtenerContenedorToasts();

    const toast = document.createElement("div");
    toast.className = "toast-mmpi " + tipoFinal;

    const datos = obtenerDatosToast(tipoFinal);

    toast.innerHTML = `
        <div class="toast-mmpi-content">
            <div class="toast-mmpi-icon">
                <i class="bi ${datos.icono}"></i>
            </div>

            <div class="toast-mmpi-text">
                <div class="toast-mmpi-title">${datos.titulo}</div>
                <div class="toast-mmpi-message">${escaparHTMLToast(mensaje)}</div>
            </div>
        </div>

        <div class="toast-mmpi-progress"></div>
    `;

    contenedor.appendChild(toast);

    const barra = toast.querySelector(".toast-mmpi-progress");

    let temporizador = null;

    setTimeout(function () {
        toast.classList.add("show");
        iniciarCuentaAtrasToast(toast, barra, duracionFinal);
    }, 20);

    function iniciarCuentaAtrasToast(elementoToast, elementoBarra, tiempo) {
        clearTimeout(temporizador);

        elementoBarra.style.transition = "none";
        elementoBarra.style.width = "100%";

        setTimeout(function () {
            elementoBarra.style.transition = "width " + tiempo + "ms linear";
            elementoBarra.style.width = "0%";
        }, 30);

        temporizador = setTimeout(function () {
            cerrarToast(elementoToast);
        }, tiempo + 50);
    }

    toast.addEventListener("mouseenter", function () {
        clearTimeout(temporizador);
        barra.style.transition = "none";
        barra.style.width = "100%";
    });

    toast.addEventListener("mouseleave", function () {
        iniciarCuentaAtrasToast(toast, barra, duracionFinal);
    });
}

function obtenerContenedorToasts() {
    let contenedor = document.getElementById("toastContainerMMPI");

    if (!contenedor) {
        contenedor = document.createElement("div");
        contenedor.id = "toastContainerMMPI";
        contenedor.className = "toast-container-mmpi";
        document.body.appendChild(contenedor);
    }

    return contenedor;
}

function cerrarToast(toast) {
    toast.classList.remove("show");
    toast.classList.add("hide");

    setTimeout(function () {
        if (toast && toast.parentNode) {
            toast.parentNode.removeChild(toast);
        }
    }, 300);
}

function obtenerDatosToast(tipo) {
    if (tipo === "success") {
        return {
            titulo: "Correcto",
            icono: "bi-check-lg"
        };
    }

    if (tipo === "danger") {
        return {
            titulo: "Error",
            icono: "bi-x-lg"
        };
    }

    if (tipo === "warning") {
        return {
            titulo: "Aviso",
            icono: "bi-exclamation-triangle-fill"
        };
    }

    return {
        titulo: "Información",
        icono: "bi-info-lg"
    };
}

function obtenerDuracionToast(tipo) {
    if (tipo === "danger") {
        return 6500;
    }

    if (tipo === "warning") {
        return 5500;
    }

    if (tipo === "success") {
        return 4200;
    }

    return 4500;
}

/* ==================================================
   CENTRO DE NOTIFICACIONES
================================================== */

document.addEventListener("DOMContentLoaded", function () {
    prepararCentroNotificaciones();
    actualizarBadgeNotificaciones();
});

function prepararCentroNotificaciones() {
    crearPanelNotificaciones();

    const botonesCampana = document.querySelectorAll(".btn-notif, #btnNotifications, .btn-navy-icon");

    botonesCampana.forEach(function (boton) {
        if (boton.dataset.notificacionesPreparadas === "1") {
            return;
        }

        boton.dataset.notificacionesPreparadas = "1";

        if (!boton.querySelector(".notification-badge-mmpi")) {
            const badge = document.createElement("span");
            badge.className = "notification-badge-mmpi";
            boton.appendChild(badge);
        }

        boton.addEventListener("click", function (event) {
            event.stopPropagation();
            alternarPanelNotificaciones();
        });
    });

    document.addEventListener("click", function (event) {
        const panel = document.getElementById("notificationPanelMMPI");

        if (!panel) {
            return;
        }

        if (!panel.contains(event.target) && !event.target.closest(".btn-notif") && !event.target.closest(".btn-navy-icon")) {
            panel.classList.remove("show");
        }
    });
}

function crearPanelNotificaciones() {
    if (document.getElementById("notificationPanelMMPI")) {
        return;
    }

    const panel = document.createElement("div");
    panel.id = "notificationPanelMMPI";
    panel.className = "notification-panel-mmpi";

    panel.innerHTML = `
        <div class="notification-panel-header-mmpi">
            <p class="notification-panel-title-mmpi">
                <i class="bi bi-bell-fill me-2"></i> Notificaciones
            </p>
            <div class="notification-panel-subtitle-mmpi">
                Avisos, pacientes nuevos y datos pendientes
            </div>
        </div>

        <div class="notification-filters-mmpi">
            <button class="notification-filter-btn-mmpi active" data-filter="todos">Todos</button>
            <button class="notification-filter-btn-mmpi" data-filter="nuevo">Nuevos</button>
            <button class="notification-filter-btn-mmpi" data-filter="pendiente">Pendientes</button>
            <button class="notification-filter-btn-mmpi" data-filter="aviso">Avisos</button>

            <button class="notification-clear-mmpi" id="btnClearNotifications">
                Borrar
            </button>
        </div>

        <div class="notification-list-mmpi" id="notificationListMMPI"></div>
    `;

    document.body.appendChild(panel);

    const filtros = panel.querySelectorAll(".notification-filter-btn-mmpi");

    filtros.forEach(function (boton) {
        boton.addEventListener("click", function () {
            filtros.forEach(function (b) {
                b.classList.remove("active");
            });

            boton.classList.add("active");
            filtroNotificacionesActual = boton.dataset.filter;
            pintarListaNotificaciones();
        });
    });

    const btnBorrar = document.getElementById("btnClearNotifications");

    if (btnBorrar) {
        btnBorrar.addEventListener("click", function () {
            borrarNotificacionesPorFiltro(filtroNotificacionesActual);
        });
    }
}

function alternarPanelNotificaciones() {
    const panel = document.getElementById("notificationPanelMMPI");

    if (!panel) {
        return;
    }

    pintarListaNotificaciones();
    panel.classList.toggle("show");
}

function pintarListaNotificaciones() {
    const lista = document.getElementById("notificationListMMPI");

    if (!lista) {
        return;
    }

    const notificaciones = obtenerNotificacionesFiltradas();

    lista.innerHTML = "";

    if (notificaciones.length === 0) {
        lista.innerHTML = `
            <div class="notification-empty-mmpi">
                <i class="bi bi-inbox"></i>
                No hay notificaciones para mostrar.
            </div>
        `;
        return;
    }

    notificaciones.forEach(function (notificacion) {
        const item = document.createElement("div");
        item.className = "notification-item-mmpi";

        item.innerHTML = `
            <div class="notification-item-icon-mmpi ${notificacion.categoria}">
                <i class="bi ${obtenerIconoNotificacion(notificacion.categoria)}"></i>
            </div>

            <div class="notification-item-content-mmpi">
                <div class="notification-item-title-mmpi">${escaparHTMLToast(notificacion.titulo)}</div>
                <div class="notification-item-message-mmpi">${escaparHTMLToast(notificacion.mensaje)}</div>
                <div class="notification-item-date-mmpi">${formatearFechaNotificacion(notificacion.fecha)}</div>
            </div>
        `;

        if (notificacion.pacienteId) {
            item.addEventListener("click", function () {
                window.location.href = "informacion.html?id=" + encodeURIComponent(notificacion.pacienteId);
            });
        }

        lista.appendChild(item);
    });
}

function obtenerNotificacionesFiltradas() {
    const notificaciones = obtenerNotificaciones();

    if (filtroNotificacionesActual === "todos") {
        return notificaciones;
    }

    return notificaciones.filter(function (notificacion) {
        return notificacion.categoria === filtroNotificacionesActual;
    });
}

function guardarNotificacion(datos) {
    const notificaciones = obtenerNotificaciones();

    const id = datos.id || crearIdNotificacion(datos);

    const existente = notificaciones.find(function (notificacion) {
        return notificacion.id === id;
    });

    if (existente) {
        existente.titulo = datos.titulo;
        existente.mensaje = datos.mensaje;
        existente.fecha = new Date().toISOString();
        existente.pacienteId = datos.pacienteId || existente.pacienteId || "";
        existente.categoria = datos.categoria;
    } else {
        notificaciones.unshift({
            id: id,
            categoria: datos.categoria,
            titulo: datos.titulo,
            mensaje: datos.mensaje,
            pacienteId: datos.pacienteId || "",
            fecha: new Date().toISOString()
        });
    }

    guardarNotificaciones(notificaciones.slice(0, 60));
    actualizarBadgeNotificaciones();

    if (document.getElementById("notificationPanelMMPI")) {
        pintarListaNotificaciones();
    }
}

function borrarNotificacionesPorFiltro(filtro) {
    let notificaciones = obtenerNotificaciones();

    if (filtro === "todos") {
        notificaciones = [];
    } else {
        notificaciones = notificaciones.filter(function (notificacion) {
            return notificacion.categoria !== filtro;
        });
    }

    guardarNotificaciones(notificaciones);
    actualizarBadgeNotificaciones();
    pintarListaNotificaciones();
}

function actualizarBadgeNotificaciones() {
    const notificaciones = obtenerNotificaciones();
    const cantidad = notificaciones.length;

    const badges = document.querySelectorAll(".notification-badge-mmpi");

    badges.forEach(function (badge) {
        if (cantidad <= 0) {
            badge.style.display = "none";
            badge.textContent = "";
        } else {
            badge.style.display = "flex";
            badge.textContent = cantidad > 9 ? "9+" : String(cantidad);
        }
    });
}

function obtenerNotificaciones() {
    try {
        const datos = localStorage.getItem(STORAGE_NOTIFICACIONES);

        if (!datos) {
            return [];
        }

        const lista = JSON.parse(datos);

        if (Array.isArray(lista)) {
            return lista;
        }

        return [];
    } catch (error) {
        return [];
    }
}

function guardarNotificaciones(notificaciones) {
    localStorage.setItem(STORAGE_NOTIFICACIONES, JSON.stringify(notificaciones));
}

function crearIdNotificacion(datos) {
    if (datos.categoria === "pendiente" && datos.pacienteId) {
        return "pendiente:" + datos.pacienteId;
    }

    if (datos.categoria === "nuevo" && datos.pacienteId) {
        return "nuevo:" + datos.pacienteId;
    }

    return "aviso:" + normalizarTexto(datos.mensaje);
}

function obtenerIconoNotificacion(categoria) {
    if (categoria === "nuevo") {
        return "bi-person-plus-fill";
    }

    if (categoria === "pendiente") {
        return "bi-exclamation-triangle-fill";
    }

    return "bi-info-circle-fill";
}

/* ==================================================
   SINCRONIZAR PACIENTES CON NOTIFICACIONES
================================================== */

function sincronizarNotificacionesPacientes(pacientes) {
    if (!Array.isArray(pacientes)) {
        return;
    }

    sincronizarPacientesNuevos(pacientes);
    sincronizarPacientesPendientes(pacientes);
    actualizarBadgeNotificaciones();
}

function sincronizarPacientesNuevos(pacientes) {
    const idsActuales = pacientes.map(function (paciente) {
        return obtenerIdPacienteNotificaciones(paciente);
    }).filter(function (id) {
        return id !== "";
    });

    const vistosGuardados = localStorage.getItem(STORAGE_PACIENTES_VISTOS);

    if (!vistosGuardados) {
        localStorage.setItem(STORAGE_PACIENTES_VISTOS, JSON.stringify(idsActuales));
        return;
    }

    let vistos = [];

    try {
        vistos = JSON.parse(vistosGuardados);

        if (!Array.isArray(vistos)) {
            vistos = [];
        }
    } catch (error) {
        vistos = [];
    }

    idsActuales.forEach(function (id) {
        if (!vistos.includes(id)) {
            const paciente = pacientes.find(function (p) {
                return obtenerIdPacienteNotificaciones(p) === id;
            });

            guardarNotificacion({
                categoria: "nuevo",
                pacienteId: id,
                titulo: "Nuevo paciente detectado",
                mensaje: obtenerNombrePacienteNotificaciones(paciente) + " se ha importado desde el JSON."
            });

            vistos.push(id);
        }
    });

    localStorage.setItem(STORAGE_PACIENTES_VISTOS, JSON.stringify(vistos));
}

function sincronizarPacientesPendientes(pacientes) {
    const idsPendientes = pacientes.filter(function (paciente) {
        return Number(obtenerCampoPacienteNotificaciones(paciente, ["datosCompletos", "datos_completos"], 1)) === 0;
    }).map(function (paciente) {
        return obtenerIdPacienteNotificaciones(paciente);
    });

    let notificaciones = obtenerNotificaciones();

    notificaciones = notificaciones.filter(function (notificacion) {
        if (notificacion.categoria !== "pendiente") {
            return true;
        }

        return idsPendientes.includes(notificacion.pacienteId);
    });

    guardarNotificaciones(notificaciones);

    pacientes.forEach(function (paciente) {
        const datosCompletos = Number(obtenerCampoPacienteNotificaciones(paciente, ["datosCompletos", "datos_completos"], 1));

        if (datosCompletos === 0) {
            const id = obtenerIdPacienteNotificaciones(paciente);

            guardarNotificacion({
                categoria: "pendiente",
                pacienteId: id,
                titulo: "Datos pendientes",
                mensaje: obtenerNombrePacienteNotificaciones(paciente) + " necesita completar sus datos."
            });
        }
    });
}

function obtenerIdPacienteNotificaciones(paciente) {
    return String(obtenerCampoPacienteNotificaciones(paciente, [
        "id",
        "idPaciente",
        "dni",
        "dniPaciente",
        "identificacion"
    ], "")).trim();
}

function obtenerNombrePacienteNotificaciones(paciente) {
    const nombre = obtenerCampoPacienteNotificaciones(paciente, ["nombre", "name"], "Paciente");
    const apellidos = obtenerCampoPacienteNotificaciones(paciente, ["apellidos", "apellido", "surname"], "");

    return (nombre + " " + apellidos).trim();
}

function obtenerCampoPacienteNotificaciones(objeto, campos, defecto) {
    for (let i = 0; i < campos.length; i++) {
        const campo = campos[i];

        if (objeto && objeto[campo] !== undefined && objeto[campo] !== null && String(objeto[campo]).trim() !== "") {
            return objeto[campo];
        }
    }

    return defecto;
}

/* ==================================================
   UTILIDADES
================================================== */

function normalizarTexto(texto) {
    return String(texto)
        .toLowerCase()
        .replaceAll(" ", "_")
        .replaceAll(".", "")
        .replaceAll(",", "")
        .replaceAll("á", "a")
        .replaceAll("é", "e")
        .replaceAll("í", "i")
        .replaceAll("ó", "o")
        .replaceAll("ú", "u")
        .replaceAll("ñ", "n")
        .substring(0, 60);
}

function formatearFechaNotificacion(fechaISO) {
    if (!fechaISO) {
        return "";
    }

    const fecha = new Date(fechaISO);

    if (isNaN(fecha.getTime())) {
        return "";
    }

    return fecha.toLocaleString("es-ES", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit"
    });
}

function escaparHTMLToast(texto) {
    return String(texto)
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
}