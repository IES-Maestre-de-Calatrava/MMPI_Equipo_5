console.log("reports.js cargado");

const API_BASES_REPORTES = [
    "http://localhost:8085",
    "http://localhost:8086",
    ""
];

document.addEventListener("DOMContentLoaded", function () {
    const btnDiario = document.getElementById("btnReporteDiario");
    const btnSemanal = document.getElementById("btnReporteSemanal");
    const btnGlobal = document.getElementById("btnReporteGlobal");

    if (btnDiario) {
        btnDiario.addEventListener("click", descargarReporteDiario);
    }

    if (btnSemanal) {
        btnSemanal.addEventListener("click", descargarReporteSemanal);
    }

    if (btnGlobal) {
        btnGlobal.addEventListener("click", descargarReporteGlobal);
    }
});

async function descargarReporteDiario() {
    const fecha = document.getElementById("fechaSeleccionada").value;

    if (fecha === "") {
        alert("Selecciona un día primero.");
        return;
    }

    const sesiones = await obtenerSesionesReporteFiltradas();

    const sesionesFiltradas = sesiones.filter(function (sesion) {
        return obtenerFechaSesionReporte(sesion) === fecha;
    });

    if (sesionesFiltradas.length === 0) {
        alert("No hay sesiones para el día seleccionado.");
        return;
    }

    await generarPDF("Reporte diario", fecha, sesionesFiltradas);
}

async function descargarReporteSemanal() {
    const semana = document.getElementById("semanaReporte").value;
    const semanaVisual = document.getElementById("semanaVisual").value;

    if (semana === "" && semanaVisual === "") {
        alert("Selecciona una semana primero.");
        return;
    }

    const rango = obtenerRangoSemanaSeleccionadaReporte(semana, semanaVisual);
    const sesiones = await obtenerSesionesReporteFiltradas();

    const sesionesFiltradas = sesiones.filter(function (sesion) {
        const fechaSesion = obtenerFechaSesionReporte(sesion);
        return fechaSesion >= rango.inicio && fechaSesion <= rango.fin;
    });

    if (sesionesFiltradas.length === 0) {
        alert("No hay sesiones para la semana seleccionada.");
        return;
    }

    await generarPDF("Reporte semanal", rango.inicio + " a " + rango.fin, sesionesFiltradas);
}

async function descargarReporteGlobal() {
    const sesiones = await obtenerSesionesReporteFiltradas();

    if (sesiones.length === 0) {
        alert("No hay sesiones registradas.");
        return;
    }

    await generarPDF("Reporte global", "Informe completo del paciente", sesiones);
}

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

    alert("No se pudieron cargar las sesiones desde el backend.");
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

async function generarPDF(tipoReporte, fechaInforme, sesiones) {
    if (typeof html2canvas === "undefined") {
        alert("No se ha cargado html2canvas.");
        return;
    }

    const JsPDF = obtenerJsPDFReporte();
    const datosPaciente = obtenerDatosPacientePantallaReporte();
    const resumen = calcularResumenReporte(sesiones);
    const observaciones = escaparHTMLReporte(obtenerObservacionesReporte()).replace(/\n/g, "<br>");

    const htmlInforme = crearHTMLInformePDF(tipoReporte, fechaInforme, datosPaciente, resumen, observaciones, sesiones);
    const iframe = crearIframePDF(htmlInforme);

    try {
        await esperarIframePDF(iframe);

        const documentoIframe = iframe.contentDocument || iframe.contentWindow.document;
        const elementoPDF = documentoIframe.querySelector(".pdf-wrapper");

        if (!elementoPDF) {
            throw new Error("No se encontró .pdf-wrapper dentro del iframe");
        }

        const canvas = await html2canvas(elementoPDF, {
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

        const pdf = new JsPDF({
            orientation: "portrait",
            unit: "px",
            format: [794, 1123]
        });

        pdf.addImage(imagen, "JPEG", 0, 0, 794, 1123);
        pdf.save(crearNombreArchivoReporte(tipoReporte, datosPaciente.nombre));

    } catch (error) {
        console.error("Error generando el PDF:", error);
        alert("No se pudo generar el PDF.");
    } finally {
        if (iframe && iframe.parentNode) {
            iframe.parentNode.removeChild(iframe);
        }
    }
}

function crearHTMLInformePDF(tipoReporte, fechaInforme, datosPaciente, resumen, observaciones, sesiones) {
    return `
        <div class="pdf-wrapper">
            <div class="pdf-card">

                <div class="pdf-header">
                    <div class="pdf-logo-box">
                    <img src="${obtenerLogoReporte()}" alt="Logo MMPI">
                </div>

                    <div class="pdf-title-block">
                        <h1 class="pdf-main-title">Información del paciente</h1>
                        <div class="pdf-subtitle">${escaparHTMLReporte(tipoReporte)} · ${escaparHTMLReporte(fechaInforme)}</div>
                    </div>
                </div>

                <div class="pdf-patient-area">
                <div class="pdf-avatar pdf-avatar-img-box">
                     <img src="${escaparHTMLReporte(datosPaciente.foto)}" alt="Foto paciente">
                </div>

                    <div class="pdf-patient-info">
                        <p class="pdf-patient-line"><strong>Nombre:</strong> ${escaparHTMLReporte(datosPaciente.nombre)}</p>
                        <p class="pdf-patient-line"><strong>DNI / ID:</strong> ${escaparHTMLReporte(datosPaciente.dni)}</p>
                        <p class="pdf-patient-line"><strong>Edad:</strong> ${escaparHTMLReporte(datosPaciente.edad)} años</p>
                        <p class="pdf-patient-line"><strong>Localidad:</strong> ${escaparHTMLReporte(datosPaciente.localidad)}</p>
                        <p class="pdf-patient-line"><strong>Teléfono:</strong> ${escaparHTMLReporte(datosPaciente.telefono)}</p>
                        <p class="pdf-patient-line"><strong>Email:</strong> ${escaparHTMLReporte(datosPaciente.email)}</p>
                        <p class="pdf-patient-line"><strong>Estado:</strong> ${escaparHTMLReporte(datosPaciente.estado)}</p>
                        <p class="pdf-patient-line"><strong>Nivel más frecuente:</strong> ${escaparHTMLReporte(resumen.nivelMasFrecuente)}</p>

                        <span class="pdf-pill">${escaparHTMLReporte(tipoReporte)}</span>
                    </div>
                </div>

                <div class="pdf-kpi-row">
                    <div class="pdf-kpi">
                        <span class="pdf-kpi-number">${resumen.totalSesiones}</span>
                        <span class="pdf-kpi-label">Sesiones</span>
                    </div>

                    <div class="pdf-kpi">
                        <span class="pdf-kpi-number">${resumen.colisiones}</span>
                        <span class="pdf-kpi-label">Colisiones</span>
                    </div>

                    <div class="pdf-kpi">
                        <span class="pdf-kpi-number">${resumen.aceleracionesBruscas}</span>
                        <span class="pdf-kpi-label">Aceleraciones</span>
                    </div>

                    <div class="pdf-kpi">
                        <span class="pdf-kpi-number">${resumen.paradasBruscas}</span>
                        <span class="pdf-kpi-label">Paradas</span>
                    </div>
                </div>

                <div class="pdf-kpi-row pdf-kpi-row-second">
                    <div class="pdf-kpi">
                        <span class="pdf-kpi-number">${resumen.scoreMedio}</span>
                        <span class="pdf-kpi-label">Score medio</span>
                    </div>

                    <div class="pdf-kpi">
                        <span class="pdf-kpi-number">${resumen.estabilidadMedia}</span>
                        <span class="pdf-kpi-label">Estabilidad media</span>
                    </div>

                    <div class="pdf-kpi">
                        <span class="pdf-kpi-number">${resumen.tiempoMovimiento}</span>
                        <span class="pdf-kpi-label">Tiempo movimiento</span>
                    </div>

                    <div class="pdf-kpi">
                        <span class="pdf-kpi-number">${escaparHTMLReporte(resumen.nivelMasFrecuente)}</span>
                        <span class="pdf-kpi-label">Nivel frecuente</span>
                    </div>
                </div>

                <div class="pdf-section-title">Reporte gráfico</div>
                <div class="pdf-divider"></div>

                <div class="pdf-graph-area">
                    ${obtenerGraficasPDF(sesiones, resumen)}
                </div>

                <div class="pdf-section-title">Observaciones</div>

                <div class="pdf-obs-box">
                    ${observaciones === "Sin observaciones." ? "Aquí van las observaciones" : observaciones}
                </div>

                <div class="pdf-footer">
                    Informe generado automáticamente por ${escaparHTMLReporte(obtenerUsuarioReporte())}
                </div>

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
    iframe.style.height = "1123px";
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
                    height: 1123px;
                    overflow: hidden;
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

function obtenerGraficasPDF(sesiones, resumen) {
    if (!sesiones || sesiones.length === 0) {
        return `<div class="pdf-no-data">No hay datos disponibles para mostrar gráficas en este informe.</div>`;
    }

    const graficas = document.querySelectorAll(".grafica-reporte");
    let html = "";
    let contador = 0;

    graficas.forEach(function (grafica) {
        try {
            if (graficaTieneDatosReporte(grafica)) {
                contador++;
                const imagen = grafica.toDataURL("image/png");

                html += `
                    <div class="pdf-graph-card">
                        <div class="pdf-graph-title">Gráfica ${contador}</div>
                        <img src="${imagen}">
                    </div>
                `;
            }
        } catch (error) {
            console.error("Error al cargar una gráfica para el PDF", error);
        }
    });

    if (contador > 0) {
        return html;
    }

    return crearGraficaResumenHTMLReporte(resumen);
}

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
    const maximoEventos = Math.max(
        resumen.colisiones,
        resumen.aceleracionesBruscas,
        resumen.paradasBruscas,
        1
    );

    const anchoColisiones = calcularAnchoBarraReporte(resumen.colisiones, maximoEventos);
    const anchoAceleraciones = calcularAnchoBarraReporte(resumen.aceleracionesBruscas, maximoEventos);
    const anchoParadas = calcularAnchoBarraReporte(resumen.paradasBruscas, maximoEventos);
    const anchoScore = calcularAnchoBarraReporte(resumen.scoreMedioNumero, 100);
    const anchoEstabilidad = calcularAnchoBarraReporte(resumen.estabilidadMediaNumero, 100);

    return `
        <div class="pdf-simple-chart">
            <div class="pdf-graph-title">Resumen visual del informe</div>

            <div class="pdf-bar-row">
                <div class="pdf-bar-label">Colisiones</div>
                <div class="pdf-bar-track">
                    <div class="pdf-bar-fill" style="width:${anchoColisiones}%"></div>
                </div>
                <div class="pdf-bar-value">${resumen.colisiones}</div>
            </div>

            <div class="pdf-bar-row">
                <div class="pdf-bar-label">Aceleraciones</div>
                <div class="pdf-bar-track">
                    <div class="pdf-bar-fill" style="width:${anchoAceleraciones}%"></div>
                </div>
                <div class="pdf-bar-value">${resumen.aceleracionesBruscas}</div>
            </div>

            <div class="pdf-bar-row">
                <div class="pdf-bar-label">Paradas</div>
                <div class="pdf-bar-track">
                    <div class="pdf-bar-fill" style="width:${anchoParadas}%"></div>
                </div>
                <div class="pdf-bar-value">${resumen.paradasBruscas}</div>
            </div>

            <div class="pdf-bar-row">
                <div class="pdf-bar-label">Score medio</div>
                <div class="pdf-bar-track">
                    <div class="pdf-bar-fill" style="width:${anchoScore}%"></div>
                </div>
                <div class="pdf-bar-value">${resumen.scoreMedio}</div>
            </div>

            <div class="pdf-bar-row">
                <div class="pdf-bar-label">Estabilidad</div>
                <div class="pdf-bar-track">
                    <div class="pdf-bar-fill" style="width:${anchoEstabilidad}%"></div>
                </div>
                <div class="pdf-bar-value">${resumen.estabilidadMedia}</div>
            </div>

            <div class="pdf-extra-data">
                <div class="pdf-extra-card">
                    <div class="pdf-extra-label">Tiempo en movimiento</div>
                    <div class="pdf-extra-value">${resumen.tiempoMovimiento}</div>
                </div>

                <div class="pdf-extra-card">
                    <div class="pdf-extra-label">Nivel más frecuente</div>
                    <div class="pdf-extra-value">${escaparHTMLReporte(resumen.nivelMasFrecuente)}</div>
                </div>
            </div>
        </div>
    `;
}

function calcularAnchoBarraReporte(valor, maximo) {
    if (maximo === 0) {
        return 0;
    }

    const ancho = (valor / maximo) * 100;

    if (ancho < 4 && valor > 0) {
        return 4;
    }

    if (ancho > 100) {
        return 100;
    }

    return ancho;
}

function crearNombreArchivoReporte(tipoReporte, nombrePaciente) {
    let tipo = tipoReporte.toLowerCase().replaceAll(" ", "_");
    let nombre = nombrePaciente.toLowerCase();

    nombre = nombre
        .replaceAll(" ", "_")
        .replaceAll("á", "a")
        .replaceAll("é", "e")
        .replaceAll("í", "i")
        .replaceAll("ó", "o")
        .replaceAll("ú", "u")
        .replaceAll("ñ", "n");

    return tipo + "_" + nombre + ".pdf";
}

function obtenerUsuarioReporte() {
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