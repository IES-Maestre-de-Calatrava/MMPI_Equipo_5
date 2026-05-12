console.log("reports.js cargado");

const API_BASES_REPORTES = [
    "http://localhost:8085",
    "http://localhost:8086",
    ""
];

document.addEventListener("DOMContentLoaded", function () {

    const btnDiarioPDF = document.getElementById("btnReporteDiario");
    const btnSemanalPDF = document.getElementById("btnReporteSemanal");
    const btnGlobalPDF = document.getElementById("btnReporteGlobal");

    const btnDiarioExcel = document.getElementById("btnReporteDiarioExcel");
    const btnSemanalExcel = document.getElementById("btnReporteSemanalExcel");
    const btnGlobalExcel = document.getElementById("btnReporteGlobalExcel");

    if (btnDiarioPDF) {
        btnDiarioPDF.addEventListener("click", descargarReporteDiario);
    }

    if (btnSemanalPDF) {
        btnSemanalPDF.addEventListener("click", descargarReporteSemanal);
    }

    if (btnGlobalPDF) {
        btnGlobalPDF.addEventListener("click", descargarReporteGlobal);
    }

    if (btnDiarioExcel) {
        btnDiarioExcel.addEventListener("click", descargarExcelDiario);
    }

    if (btnSemanalExcel) {
        btnSemanalExcel.addEventListener("click", descargarExcelSemanal);
    }

    if (btnGlobalExcel) {
        btnGlobalExcel.addEventListener("click", descargarExcelGlobal);
    }

});

/* ==================================================
   DESCARGA PDF
================================================== */

async function descargarReporteDiario() {

    const fecha = document.getElementById("fechaSeleccionada").value;

    if (fecha === "") {
        notificarReporte("Selecciona un día primero.", "warning");
        return;
    }

    const sesiones = await obtenerSesionesReporteFiltradas();

    const sesionesFiltradas = sesiones.filter(function (sesion) {
        return obtenerFechaSesionReporte(sesion) === fecha;
    });

    if (sesionesFiltradas.length === 0) {
        notificarReporte("No hay sesiones para el día seleccionado.", "warning");
        return;
    }

    await generarPDF("Reporte diario", fecha, sesionesFiltradas);

}

async function descargarReporteSemanal() {

    const semana = document.getElementById("semanaReporte").value;
    const semanaVisual = document.getElementById("semanaVisual").value;

    if (semana === "" && semanaVisual === "") {
        notificarReporte("Selecciona una semana primero.", "warning");
        return;
    }

    const rango = obtenerRangoSemanaSeleccionadaReporte(semana, semanaVisual);
    const sesiones = await obtenerSesionesReporteFiltradas();

    const sesionesFiltradas = sesiones.filter(function (sesion) {
        const fechaSesion = obtenerFechaSesionReporte(sesion);
        return fechaSesion >= rango.inicio && fechaSesion <= rango.fin;
    });

    if (sesionesFiltradas.length === 0) {
        notificarReporte("No hay sesiones para la semana seleccionada.", "warning");
        return;
    }

    await generarPDF("Reporte semanal", rango.inicio + " a " + rango.fin, sesionesFiltradas);

}

async function descargarReporteGlobal() {

    const sesiones = await obtenerSesionesReporteFiltradas();

    if (sesiones.length === 0) {
        notificarReporte("No hay sesiones registradas.", "warning");
        return;
    }

    await generarPDF("Reporte global", "Informe completo del paciente", sesiones);

}

/* ==================================================
   DESCARGA EXCEL / CSV
================================================== */

async function descargarExcelDiario() {

    const fecha = document.getElementById("fechaSeleccionada").value;

    if (fecha === "") {
        notificarReporte("Selecciona un día primero.", "warning");
        return;
    }

    const sesiones = await obtenerSesionesReporteFiltradas();

    const sesionesFiltradas = sesiones.filter(function (sesion) {
        return obtenerFechaSesionReporte(sesion) === fecha;
    });

    if (sesionesFiltradas.length === 0) {
        notificarReporte("No hay sesiones para el día seleccionado.", "warning");
        return;
    }

    generarCSVReporte("Reporte diario", fecha, sesionesFiltradas);

}

async function descargarExcelSemanal() {

    const semana = document.getElementById("semanaReporte").value;
    const semanaVisual = document.getElementById("semanaVisual").value;

    if (semana === "" && semanaVisual === "") {
        notificarReporte("Selecciona una semana primero.", "warning");
        return;
    }

    const rango = obtenerRangoSemanaSeleccionadaReporte(semana, semanaVisual);
    const sesiones = await obtenerSesionesReporteFiltradas();

    const sesionesFiltradas = sesiones.filter(function (sesion) {
        const fechaSesion = obtenerFechaSesionReporte(sesion);
        return fechaSesion >= rango.inicio && fechaSesion <= rango.fin;
    });

    if (sesionesFiltradas.length === 0) {
        notificarReporte("No hay sesiones para la semana seleccionada.", "warning");
        return;
    }

    generarCSVReporte("Reporte semanal", rango.inicio + " a " + rango.fin, sesionesFiltradas);

}

async function descargarExcelGlobal() {

    const sesiones = await obtenerSesionesReporteFiltradas();

    if (sesiones.length === 0) {
        notificarReporte("No hay sesiones registradas.", "warning");
        return;
    }

    generarCSVReporte("Reporte global", "Informe completo del paciente", sesiones);

}

/* ==================================================
   OBTENER SESIONES
================================================== */

async function obtenerSesionesReporteFiltradas() {

    const sesiones = await obtenerSesionesReporte();
    const pacienteId = obtenerPacienteIdReporte();

    const filtradas = sesiones.filter(function (sesion) {
        return perteneceAlPacienteReporte(sesion, pacienteId);
    });

    const haySesionesConPaciente = sesiones.some(function (sesion) {
        return sesionTienePacienteReporte(sesion);
    });

    if (haySesionesConPaciente) {
        return filtradas;
    }

    return sesiones;

}

async function obtenerSesionesReporte() {

    for (let i = 0; i < API_BASES_REPORTES.length; i++) {

        const base = API_BASES_REPORTES[i];

        try {

            const respuesta = await fetch(base + "/sesion/find");

            if (respuesta.ok) {
                return await respuesta.json();
            }

        } catch (error) {
            console.warn("No respondió " + base + "/sesion/find");
        }

    }

    notificarReporte("No se pudieron cargar las sesiones desde el backend.", "danger");
    return [];

}

function obtenerPacienteIdReporte() {

    const input = document.getElementById("pacienteId");

    if (input && input.value) {
        return input.value;
    }

    const params = new URLSearchParams(window.location.search);

    return params.get("id") || params.get("dni") || "1";

}

function perteneceAlPacienteReporte(sesion, pacienteId) {

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

function sesionTienePacienteReporte(sesion) {

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

/* ==================================================
   FECHAS
================================================== */

function obtenerFechaSesionReporte(sesion) {

    const valor = obtenerValorCampoReporte(sesion, [
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
            return fechaDesdeTimestampReporte(numero);
        }

    }

    if (typeof valor === "number") {
        return fechaDesdeTimestampReporte(valor);
    }

    return "";

}

function fechaDesdeTimestampReporte(timestamp) {

    let fecha;

    if (timestamp > 1000000000000) {
        fecha = new Date(timestamp);
    } else {
        fecha = new Date(timestamp * 1000);
    }

    return formatearFechaReporte(fecha);

}

function obtenerHoraSesionReporte(sesion) {

    const valor = obtenerValorCampoReporte(sesion, [
        "timestamp",
        "tiempoSesion",
        "tiemposesion",
        "tiempo_sesion",
        "fecha"
    ]);

    if (valor === null || valor === undefined) {
        return "";
    }

    if (typeof valor === "string" && valor.includes("T")) {
        return valor.substring(11, 19);
    }

    if (typeof valor === "string" && valor.includes(" ")) {
        const partes = valor.split(" ");
        return partes[1] || "";
    }

    const numero = Number(valor);

    if (!isNaN(numero)) {

        let fecha;

        if (numero > 1000000000000) {
            fecha = new Date(numero);
        } else {
            fecha = new Date(numero * 1000);
        }

        return fecha.toLocaleTimeString("es-ES", {
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit"
        });

    }

    return "";

}

function obtenerRangoSemanaSeleccionadaReporte(semanaISO, semanaVisual) {

    if (semanaISO && semanaISO.includes("-W")) {
        return obtenerRangoDesdeSemanaISOReporte(semanaISO);
    }

    if (semanaVisual && semanaVisual.includes(" a ")) {

        const partes = semanaVisual.split(" a ");

        return {
            inicio: partes[0].trim(),
            fin: partes[1].trim()
        };

    }

    return {
        inicio: "",
        fin: ""
    };

}

function obtenerRangoDesdeSemanaISOReporte(valorSemana) {

    const partes = valorSemana.split("-W");
    const anio = Number(partes[0]);
    const semana = Number(partes[1]);

    const fechaBase = new Date(anio, 0, 1 + (semana - 1) * 7);
    const diaSemana = fechaBase.getDay();
    const lunes = new Date(fechaBase);

    if (diaSemana <= 4) {
        lunes.setDate(fechaBase.getDate() - fechaBase.getDay() + 1);
    } else {
        lunes.setDate(fechaBase.getDate() + 8 - fechaBase.getDay());
    }

    const domingo = new Date(lunes);
    domingo.setDate(lunes.getDate() + 6);

    return {
        inicio: formatearFechaReporte(lunes),
        fin: formatearFechaReporte(domingo)
    };

}

/* ==================================================
   GENERAR PDF
================================================== */

async function generarPDF(tipoReporte, fechaInforme, sesiones) {

    if (typeof html2canvas === "undefined") {
        notificarReporte("No se ha cargado html2canvas.", "danger");
        return;
    }

    let iframe = null;

    try {

        const JsPDF = obtenerJsPDFReporte();
        const datosPaciente = obtenerDatosPacientePantallaReporte();
        const resumen = calcularResumenReporte(sesiones);
        const observaciones = escaparHTMLReporte(obtenerObservacionesReporte()).replace(/\n/g, "<br>");

        const htmlInforme = crearHTMLInformePDF(tipoReporte, fechaInforme, datosPaciente, resumen, observaciones, sesiones);
        iframe = crearIframePDF(htmlInforme);

        await esperarIframePDF(iframe);

        const documentoIframe = iframe.contentDocument || iframe.contentWindow.document;

        await esperarImagenesPDF(documentoIframe);

        const paginas = documentoIframe.querySelectorAll(".pdf-page");

        if (!paginas || paginas.length === 0) {
            throw new Error("No se encontraron páginas .pdf-page dentro del iframe");
        }

        const pdf = new JsPDF({
            orientation: "portrait",
            unit: "px",
            format: [794, 1123]
        });

        for (let i = 0; i < paginas.length; i++) {

            const canvas = await html2canvas(paginas[i], {
                scale: 2,
                useCORS: true,
                backgroundColor: "#000033",
                width: 794,
                height: 1123,
                windowWidth: 794,
                windowHeight: 1123,
                scrollX: 0,
                scrollY: 0
            });

            const imagen = canvas.toDataURL("image/jpeg", 0.98);

            if (i > 0) {
                pdf.addPage([794, 1123], "portrait");
            }

            pdf.addImage(imagen, "JPEG", 0, 0, 794, 1123);

        }

        pdf.save(crearNombreArchivoReporte(tipoReporte, datosPaciente.nombre));

        notificarReporte("PDF generado correctamente.", "success");

    } catch (error) {

        console.error("Error generando el PDF:", error);
        notificarReporte("No se pudo generar el PDF.", "danger");

    } finally {

        if (iframe && iframe.parentNode) {
            iframe.parentNode.removeChild(iframe);
        }

    }

}

function crearHTMLInformePDF(tipoReporte, fechaInforme, datosPaciente, resumen, observaciones, sesiones) {

    const observacionesFinales =
        observaciones === "Sin observaciones."
            ? "Espacio reservado para observaciones del fisioterapeuta."
            : observaciones;

    const graficas = obtenerGraficasPDFSeparadas(sesiones, resumen);

    const graficaPrincipal = graficas.length > 0
        ? graficas[0]
        : crearTarjetaSinGraficaPDF("No hay datos gráficos disponibles.");

    const graficasSecundarias = graficas.length > 1
        ? graficas.slice(1).join("")
        : crearTarjetaSinGraficaPDF("No hay más gráficas disponibles para este informe.");

    return `
        <div class="pdf-wrapper pdf-wrapper-two-pages">

            <section class="pdf-page pdf-page-one">

                <div class="pdf-card pdf-card-page pdf-pro-page">

                    <div class="pdf-pro-hero">

                        <div class="pdf-pro-logo">
                            <img src="${obtenerLogoReporte()}" alt="Logo MMPI">
                        </div>

                        <div class="pdf-pro-title">
                            <h1>Información del paciente</h1>
                            <p>${escaparHTMLReporte(tipoReporte)} · ${escaparHTMLReporte(fechaInforme)}</p>
                        </div>

                    </div>

                    <div class="pdf-pro-patient-card">

                        <div class="pdf-pro-avatar">
                            <img src="${escaparHTMLReporte(datosPaciente.foto)}" alt="Foto paciente">
                        </div>

                        <div class="pdf-pro-patient-info">
                            <h2>${escaparHTMLReporte(datosPaciente.nombre)}</h2>

                            <div class="pdf-pro-patient-grid">
                                <p><strong>DNI / ID:</strong> ${escaparHTMLReporte(datosPaciente.dni)}</p>
                                <p><strong>Edad:</strong> ${escaparHTMLReporte(datosPaciente.edad)} años</p>
                                <p><strong>Localidad:</strong> ${escaparHTMLReporte(datosPaciente.localidad)}</p>
                                <p><strong>Teléfono:</strong> ${escaparHTMLReporte(datosPaciente.telefono)}</p>
                                <p><strong>Email:</strong> ${escaparHTMLReporte(datosPaciente.email)}</p>
                                <p><strong>Estado:</strong> ${escaparHTMLReporte(datosPaciente.estado)}</p>
                            </div>

                            <span class="pdf-pro-pill">
                                Nivel más frecuente: ${escaparHTMLReporte(resumen.nivelMasFrecuente)}
                            </span>
                        </div>

                    </div>

                    <div class="pdf-pro-section-title">
                        Resumen del informe
                    </div>

                    <div class="pdf-pro-kpi-grid">

                        <div class="pdf-pro-kpi">
                            <span>${resumen.totalSesiones}</span>
                            <small>Sesiones</small>
                        </div>

                        <div class="pdf-pro-kpi">
                            <span>${resumen.colisiones}</span>
                            <small>Colisiones</small>
                        </div>

                        <div class="pdf-pro-kpi">
                            <span>${resumen.aceleracionesBruscas}</span>
                            <small>Aceleraciones</small>
                        </div>

                        <div class="pdf-pro-kpi">
                            <span>${resumen.paradasBruscas}</span>
                            <small>Paradas</small>
                        </div>

                        <div class="pdf-pro-kpi">
                            <span>${resumen.scoreMedio}</span>
                            <small>Score medio</small>
                        </div>

                        <div class="pdf-pro-kpi">
                            <span>${resumen.estabilidadMedia}</span>
                            <small>Estabilidad media</small>
                        </div>

                        <div class="pdf-pro-kpi">
                            <span>${resumen.tiempoMovimiento}</span>
                            <small>Tiempo movimiento</small>
                        </div>

                        <div class="pdf-pro-kpi">
                            <span class="pdf-pro-kpi-small">${escaparHTMLReporte(resumen.nivelMasFrecuente)}</span>
                            <small>Nivel frecuente</small>
                        </div>

                    </div>

                    <div class="pdf-pro-section-title pdf-pro-section-title-small">
                        Observaciones
                    </div>

                    <div class="pdf-pro-observations">
                        ${observacionesFinales}
                    </div>

                    <div class="pdf-pro-section-title pdf-pro-section-title-small">
                        Gráfica principal
                    </div>

                    <div class="pdf-pro-main-graph">
                        ${graficaPrincipal}
                    </div>

                    <div class="pdf-pro-footer">
                        Informe generado automáticamente por ${escaparHTMLReporte(obtenerUsuarioReporte())}
                    </div>

                </div>

            </section>

            <section class="pdf-page pdf-page-two">

                <div class="pdf-card pdf-card-page pdf-pro-page">

                    <div class="pdf-pro-hero pdf-pro-hero-small">

                        <div class="pdf-pro-logo pdf-pro-logo-small">
                            <img src="${obtenerLogoReporte()}" alt="Logo MMPI">
                        </div>

                        <div class="pdf-pro-title">
                            <h1>Reporte gráfico</h1>
                            <p>${escaparHTMLReporte(datosPaciente.nombre)} · ${escaparHTMLReporte(tipoReporte)}</p>
                        </div>

                    </div>

                    <div class="pdf-pro-graph-grid">
                        ${graficasSecundarias}
                    </div>

                    <div class="pdf-pro-footer">
                        Página gráfica del informe · MMPI
                    </div>

                </div>

            </section>

        </div>
    `;

}

function obtenerGraficasPDFSeparadas(sesiones, resumen) {

    if (!sesiones || sesiones.length === 0) {
        return [];
    }

    const graficas = document.querySelectorAll(".grafica-reporte");
    const tarjetas = [];

    const titulos = [
        "Eventos del periodo",
        "Tiempo de uso",
        "Score, eventos y estabilidad"
    ];

    graficas.forEach(function (grafica, index) {

        try {

            if (graficaTieneDatosReporte(grafica)) {

                const imagen = grafica.toDataURL("image/png");
                const titulo = titulos[index] || ("Gráfica " + (index + 1));

                let claseGrafica = "pdf-pro-graph-card";

                if (index === 0) {
                    claseGrafica += " pdf-graph-pie";
                } else {
                    claseGrafica += " pdf-graph-line";
                }

                tarjetas.push(`
                    <div class="${claseGrafica}">
                        <div class="pdf-pro-graph-title">
                            ${escaparHTMLReporte(titulo)}
                        </div>

                        <div class="pdf-graph-img-box">
                            <img src="${imagen}" alt="${escaparHTMLReporte(titulo)}">
                        </div>
                    </div>
                `);

            }

        } catch (error) {
            console.error("Error cargando gráfica para PDF:", error);
        }

    });

    if (tarjetas.length === 0) {
        tarjetas.push(crearGraficaResumenHTMLReporte(resumen));
    }

    return tarjetas;

}

function crearTarjetaSinGraficaPDF(texto) {

    return `
        <div class="pdf-pro-graph-card pdf-pro-no-graph">
            <div class="pdf-pro-graph-title">
                Sin gráfica
            </div>

            <div class="pdf-pro-no-graph-text">
                ${escaparHTMLReporte(texto)}
            </div>
        </div>
    `;

}

function crearIframePDF(htmlInforme) {

    const iframe = document.createElement("iframe");

    iframe.style.position = "fixed";
    iframe.style.left = "0";
    iframe.style.top = "0";
    iframe.style.width = "794px";
    iframe.style.height = "2246px";
    iframe.style.border = "0";
    iframe.style.opacity = "0";
    iframe.style.zIndex = "-9999";
    iframe.style.pointerEvents = "none";
    iframe.style.background = "transparent";

    document.body.appendChild(iframe);

    const documento = iframe.contentDocument || iframe.contentWindow.document;
    const rutaCSS = obtenerRutaCSSPDF();

    documento.open();
    documento.write(`
        <!DOCTYPE html>
        <html lang="es">
        <head>
            <meta charset="UTF-8">
            <link rel="stylesheet" href="${rutaCSS}">
            <style>
                html,
                body {
                    margin: 0;
                    padding: 0;
                    width: 794px;
                    min-height: 2246px;
                    overflow: visible;
                    background: #000033;
                }
            </style>
        </head>
        <body class="pdf-body">
            <div class="pdf-export-root">
                ${htmlInforme}
            </div>
        </body>
        </html>
    `);
    documento.close();

    return iframe;

}

function esperarIframePDF(iframe) {

    return new Promise(function (resolve) {

        const documento = iframe.contentDocument || iframe.contentWindow.document;
        const linkCSS = documento.querySelector("link[rel='stylesheet']");
        let terminado = false;

        function resolverUnaVez() {
            if (!terminado) {
                terminado = true;
                setTimeout(resolve, 500);
            }
        }

        if (linkCSS) {
            linkCSS.onload = resolverUnaVez;
            linkCSS.onerror = resolverUnaVez;
        }

        setTimeout(resolverUnaVez, 1200);

    });

}

function esperarImagenesPDF(documento) {

    const imagenes = Array.from(documento.images);

    if (imagenes.length === 0) {
        return Promise.resolve();
    }

    return Promise.all(imagenes.map(function (imagen) {

        if (imagen.complete) {
            return Promise.resolve();
        }

        return new Promise(function (resolve) {
            imagen.onload = resolve;
            imagen.onerror = resolve;
        });

    }));

}

function obtenerRutaCSSPDF() {

    const link = document.querySelector("link[href*='reportscss.css']");

    if (link) {
        return link.href;
    }

    return "../styles/reportscss.css";

}

function obtenerJsPDFReporte() {

    if (window.jspdf && window.jspdf.jsPDF) {
        return window.jspdf.jsPDF;
    }

    if (window.jsPDF) {
        return window.jsPDF;
    }

    throw new Error("No se encontró jsPDF.");

}

/* ==================================================
   DATOS DEL PACIENTE
================================================== */

function obtenerDatosPacientePantallaReporte() {

    return {
        nombre: obtenerTextoReporte("patient-name", "Paciente"),
        dni: obtenerTextoReporte("patient-dni", "No indicado"),
        edad: obtenerTextoReporte("patient-age", "No indicada"),
        localidad: obtenerTextoReporte("patient-city", "No indicada"),
        telefono: obtenerTextoReporte("patient-phone", "No indicado"),
        email: obtenerTextoReporte("patient-email", "No indicado"),
        estado: limpiarEstadoReporte(obtenerTextoReporte("patient-level", "No indicado")),
        foto: obtenerFotoPacienteReporte()
    };

}

function obtenerFotoPacienteReporte() {

    const imagen = document.getElementById("patient-img");

    if (!imagen || !imagen.getAttribute("src")) {
        return new URL("../media/imgs/nino.png", window.location.href).href;
    }

    const src = imagen.getAttribute("src");

    if (src.startsWith("data:")) {
        return src;
    }

    return new URL(src, window.location.href).href;

}

function obtenerTextoReporte(id, valorDefecto) {

    const elemento = document.getElementById(id);

    if (!elemento) {
        return valorDefecto;
    }

    const texto = elemento.textContent.trim();

    if (texto === "") {
        return valorDefecto;
    }

    return texto;

}

function limpiarEstadoReporte(texto) {

    return String(texto)
        .replace("Nivel:", "")
        .replace("Estado:", "")
        .trim();

}

/* ==================================================
   RESUMEN
================================================== */

function calcularResumenReporte(sesiones) {

    let colisiones = 0;
    let aceleracionesBruscas = 0;
    let paradasBruscas = 0;
    let tiempoMovimientoTotal = 0;
    let scoreTotal = 0;
    let estabilidadTotal = 0;
    let niveles = {};

    sesiones.forEach(function (sesion) {

        colisiones += obtenerNumeroSesionReporte(sesion, ["colisiones"]);
        aceleracionesBruscas += obtenerNumeroSesionReporte(sesion, ["aceleracionesBruscas", "aceleraciones_bruscas"]);
        paradasBruscas += obtenerNumeroSesionReporte(sesion, ["paradasBruscas", "paradas_bruscas"]);
        tiempoMovimientoTotal += obtenerNumeroSesionReporte(sesion, ["tiempoMovimiento", "tiempomovimiento", "tiempo_movimiento", "tiempo"]);
        scoreTotal += obtenerNumeroSesionReporte(sesion, ["score"]);
        estabilidadTotal += obtenerNumeroSesionReporte(sesion, ["estabilidad"]);

        const nivel = obtenerValorCampoReporte(sesion, ["nivel"]);

        if (nivel) {

            if (!niveles[nivel]) {
                niveles[nivel] = 0;
            }

            niveles[nivel]++;

        }

    });

    const totalSesiones = sesiones.length;
    const scoreMedioNumero = calcularMediaNumeroReporte(scoreTotal, totalSesiones);
    const estabilidadMediaNumero = calcularMediaNumeroReporte(estabilidadTotal, totalSesiones);

    return {
        totalSesiones: totalSesiones,
        colisiones: colisiones,
        aceleracionesBruscas: aceleracionesBruscas,
        paradasBruscas: paradasBruscas,
        tiempoMovimiento: convertirTiempoMovimientoReporte(tiempoMovimientoTotal),
        scoreMedio: scoreMedioNumero.toFixed(2),
        scoreMedioNumero: scoreMedioNumero,
        estabilidadMedia: estabilidadMediaNumero.toFixed(2) + "%",
        estabilidadMediaNumero: estabilidadMediaNumero,
        nivelMasFrecuente: obtenerNivelMasFrecuenteReporte(niveles)
    };

}

function obtenerNumeroSesionReporte(sesion, nombresCampos) {

    const valor = obtenerValorCampoReporte(sesion, nombresCampos);

    if (valor === null || valor === undefined || valor === "") {
        return 0;
    }

    const numero = Number(valor);

    if (isNaN(numero)) {
        return 0;
    }

    return numero;

}

function obtenerValorCampoReporte(objeto, nombresCampos) {

    for (let i = 0; i < nombresCampos.length; i++) {

        const campo = nombresCampos[i];

        if (objeto && objeto[campo] !== undefined && objeto[campo] !== null) {
            return objeto[campo];
        }

    }

    return null;

}

function calcularMediaNumeroReporte(total, cantidad) {

    if (cantidad === 0) {
        return 0;
    }

    return total / cantidad;

}

function obtenerNivelMasFrecuenteReporte(niveles) {

    let nivelFinal = "No indicado";
    let cantidadMayor = 0;

    for (let nivel in niveles) {

        if (niveles[nivel] > cantidadMayor) {
            cantidadMayor = niveles[nivel];
            nivelFinal = nivel;
        }

    }

    return nivelFinal;

}

function convertirTiempoMovimientoReporte(total) {

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

function obtenerObservacionesReporte() {

    const textarea = document.getElementById("patient-obs");

    if (!textarea) {
        return "Sin observaciones.";
    }

    if (textarea.value.trim() === "") {
        return "Sin observaciones.";
    }

    return textarea.value.trim();

}

/* ==================================================
   GRÁFICAS / FALLBACK
================================================== */

function graficaTieneDatosReporte(grafica) {

    if (typeof Chart === "undefined") {
        return false;
    }

    const chart = Chart.getChart(grafica);

    if (!chart || !chart.data || !chart.data.datasets) {
        return false;
    }

    let tieneDatos = false;

    chart.data.datasets.forEach(function (dataset) {

        if (dataset.data && dataset.data.length > 0) {

            const hayValor = dataset.data.some(function (valor) {
                return Number(valor) > 0;
            });

            if (hayValor) {
                tieneDatos = true;
            }

        }

    });

    return tieneDatos;

}

function crearGraficaResumenHTMLReporte(resumen) {

    return `
        <div class="pdf-pro-graph-card pdf-pro-no-graph">
            <div class="pdf-pro-graph-title">
                Resumen visual
            </div>

            <div class="pdf-pro-no-graph-text">
                Sesiones: ${resumen.totalSesiones}<br>
                Colisiones: ${resumen.colisiones}<br>
                Aceleraciones: ${resumen.aceleracionesBruscas}<br>
                Paradas: ${resumen.paradasBruscas}<br>
                Score medio: ${resumen.scoreMedio}<br>
                Estabilidad media: ${resumen.estabilidadMedia}
            </div>
        </div>
    `;

}

/* ==================================================
   CSV / EXCEL
================================================== */

function generarCSVReporte(tipoReporte, periodo, sesiones) {

    const datosPaciente = obtenerDatosPacientePantallaReporte();
    const resumen = calcularResumenReporte(sesiones);
    const observaciones = obtenerObservacionesReporte();

    let filas = [];

    filas.push(["INFORME MMPI"]);
    filas.push([]);

    filas.push(["DATOS DEL INFORME"]);
    filas.push(["Tipo de informe", tipoReporte, "Periodo", periodo]);
    filas.push(["Fecha de descarga", new Date().toLocaleString("es-ES"), "Generado por", obtenerUsuarioReporte()]);
    filas.push([]);

    filas.push(["DATOS DEL PACIENTE"]);
    filas.push(["Nombre", datosPaciente.nombre, "DNI / ID", datosPaciente.dni]);
    filas.push(["Edad", datosPaciente.edad, "Localidad", datosPaciente.localidad]);
    filas.push(["Teléfono", datosPaciente.telefono, "Email", datosPaciente.email]);
    filas.push(["Estado", datosPaciente.estado]);
    filas.push([]);

    filas.push(["RESUMEN DEL INFORME"]);
    filas.push(["Total sesiones", resumen.totalSesiones, "Nivel más frecuente", resumen.nivelMasFrecuente]);
    filas.push(["Score medio", resumen.scoreMedio, "Estabilidad media", resumen.estabilidadMedia]);
    filas.push(["Colisiones totales", resumen.colisiones, "Aceleraciones bruscas", resumen.aceleracionesBruscas]);
    filas.push(["Paradas bruscas", resumen.paradasBruscas, "Tiempo movimiento total", resumen.tiempoMovimiento]);
    filas.push([]);

    filas.push(["OBSERVACIONES"]);
    filas.push([observaciones]);
    filas.push([]);
    filas.push([]);

    filas.push(["SESIONES"]);
    filas.push([
        "Paciente",
        "DNI / ID",
        "Fecha",
        "Hora",
        "Nivel",
        "Score",
        "Estabilidad",
        "Colisiones",
        "Aceleraciones bruscas",
        "Paradas bruscas",
        "Tiempo movimiento",
        "Timestamp"
    ]);

    sesiones.forEach(function (sesion) {

        filas.push([
            datosPaciente.nombre,
            datosPaciente.dni,
            obtenerFechaSesionReporte(sesion),
            obtenerHoraSesionReporte(sesion),
            obtenerValorCampoReporte(sesion, ["nivel"]) || "",
            obtenerNumeroSesionReporte(sesion, ["score"]),
            obtenerNumeroSesionReporte(sesion, ["estabilidad"]),
            obtenerNumeroSesionReporte(sesion, ["colisiones"]),
            obtenerNumeroSesionReporte(sesion, ["aceleracionesBruscas", "aceleraciones_bruscas"]),
            obtenerNumeroSesionReporte(sesion, ["paradasBruscas", "paradas_bruscas"]),
            obtenerNumeroSesionReporte(sesion, ["tiempoMovimiento", "tiempomovimiento", "tiempo_movimiento", "tiempo"]),
            obtenerValorCampoReporte(sesion, ["timestamp"]) || ""
        ]);

    });

    filas.push([]);
    filas.push([]);
    filas.push(["DATOS CRUDOS"]);
    filas.push(["Sesión", "Campo", "Valor"]);

    sesiones.forEach(function (sesion, indice) {

        Object.keys(sesion).forEach(function (clave) {
            filas.push([
                indice + 1,
                clave,
                valorPlanoCSV(sesion[clave])
            ]);
        });

        filas.push([]);

    });

    const contenidoCSV = convertirFilasACSV(filas);
    const nombreArchivo = crearNombreArchivoCSV(tipoReporte, datosPaciente.nombre);

    descargarArchivoCSV(contenidoCSV, nombreArchivo);

    notificarReporte("Excel generado correctamente.", "success");

}

function convertirFilasACSV(filas) {

    const separador = ";";

    return "\ufeff" + filas.map(function (fila) {

        return fila.map(function (valor) {
            return escaparValorCSV(valor);
        }).join(separador);

    }).join("\n");

}

function escaparValorCSV(valor) {

    if (valor === null || valor === undefined) {
        return "";
    }

    let texto = valorPlanoCSV(valor);

    texto = textoSeguroCSV(texto);
    texto = String(texto).replaceAll('"', '""');

    return '"' + texto + '"';

}

function valorPlanoCSV(valor) {

    if (valor === null || valor === undefined) {
        return "";
    }

    if (typeof valor === "object") {

        try {
            return JSON.stringify(valor);
        } catch (error) {
            return "";
        }

    }

    return valor;

}

function textoSeguroCSV(valor) {

    if (valor === null || valor === undefined) {
        return "";
    }

    let texto = String(valor);

    if (
        texto.startsWith("=") ||
        texto.startsWith("+") ||
        texto.startsWith("-") ||
        texto.startsWith("@")
    ) {
        texto = "'" + texto;
    }

    return texto;

}

function descargarArchivoCSV(contenido, nombreArchivo) {

    const blob = new Blob([contenido], {
        type: "text/csv;charset=utf-8;"
    });

    const url = URL.createObjectURL(blob);
    const enlace = document.createElement("a");

    enlace.href = url;
    enlace.download = nombreArchivo;
    enlace.style.display = "none";

    document.body.appendChild(enlace);
    enlace.click();

    document.body.removeChild(enlace);
    URL.revokeObjectURL(url);

}

/* ==================================================
   NOMBRES ARCHIVO / UTILIDADES
================================================== */

function crearNombreArchivoReporte(tipoReporte, nombrePaciente) {

    return limpiarNombreArchivoReporte(tipoReporte, nombrePaciente, "pdf");

}

function crearNombreArchivoCSV(tipoReporte, nombrePaciente) {

    return limpiarNombreArchivoReporte(tipoReporte, nombrePaciente, "csv");

}

function limpiarNombreArchivoReporte(tipoReporte, nombrePaciente, extension) {

    let tipo = String(tipoReporte).toLowerCase().replaceAll(" ", "_");
    let nombre = String(nombrePaciente).toLowerCase();

    nombre = nombre
        .replaceAll(" ", "_")
        .replaceAll("á", "a")
        .replaceAll("é", "e")
        .replaceAll("í", "i")
        .replaceAll("ó", "o")
        .replaceAll("ú", "u")
        .replaceAll("ñ", "n")
        .replaceAll("/", "_")
        .replaceAll("\\", "_")
        .replaceAll(":", "_")
        .replaceAll("*", "_")
        .replaceAll("?", "_")
        .replaceAll('"', "_")
        .replaceAll("<", "_")
        .replaceAll(">", "_")
        .replaceAll("|", "_");

    return tipo + "_" + nombre + "." + extension;

}

function obtenerUsuarioReporte() {

    const usuarioPantalla = document.getElementById("nombreUsuarioHeader");

    if (usuarioPantalla && usuarioPantalla.textContent.trim() !== "") {
        return usuarioPantalla.textContent.trim();
    }

    const usuario = localStorage.getItem("usuarioActivo");

    if (usuario && usuario.trim() !== "") {
        return usuario;
    }

    return "Equipo_5";

}

function formatearFechaReporte(fecha) {

    const anio = fecha.getFullYear();
    const mes = String(fecha.getMonth() + 1).padStart(2, "0");
    const dia = String(fecha.getDate()).padStart(2, "0");

    return anio + "-" + mes + "-" + dia;

}

function escaparHTMLReporte(texto) {

    return String(texto)
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");

}

function obtenerLogoReporte() {

    return new URL("../media/imgs_important/final.png", window.location.href).href;

}

function notificarReporte(mensaje, tipo) {

    if (typeof mostrarToast === "function") {
        mostrarToast(mensaje, tipo || "info");
    } else {
        console.log(mensaje);
    }

}