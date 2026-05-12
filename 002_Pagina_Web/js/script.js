const API_BASE = "http://localhost:8085";

document.addEventListener("DOMContentLoaded", function () {

    configurarLogin();
    configurarRegistroFisioterapeuta();
    configurarFormularioPaciente();

});

/* ==================================================
   LOGIN
================================================== */

function configurarLogin() {

    const formLogin = document.getElementById("formLogin");

    if (!formLogin) {
        return;
    }

    formLogin.addEventListener("submit", async function (event) {

        event.preventDefault();

        const email = obtenerValorInput("emailLogin");
        const contrasena = obtenerValorInput("contrasenaLogin");

        if (email === "" || contrasena === "") {
            notificar("Introduce el correo y la contraseña.", "warning");
            enfocarCampo("emailLogin");
            return;
        }

        try {

            const response = await fetch(API_BASE + "/acceso/find");

            if (!response.ok) {
                throw new Error("No se pudieron cargar los accesos");
            }

            const accesos = await response.json();

            const usuarioEncontrado = accesos.find(function (acceso) {
                return acceso.usuario === email && acceso.contrasena === contrasena;
            });

            if (usuarioEncontrado) {

                localStorage.setItem("usuarioActivo", usuarioEncontrado.usuario);
                window.location.href = "pages/inicio.html";

            } else {

                notificar("Usuario o contraseña incorrectos.", "warning");

            }

        } catch (error) {

            console.error("Error en login:", error);
            notificar("Error de conexión. Asegúrate de que el backend esté encendido en el puerto 8085.", "danger");

        }

    });

}

/* ==================================================
   REGISTRO DE FISIOTERAPEUTA
================================================== */

function configurarRegistroFisioterapeuta() {

    const formRegistro = document.getElementById("formRegistro");

    if (!formRegistro) {
        return;
    }

    formRegistro.addEventListener("submit", async function (event) {

        event.preventDefault();

        const pass1 = obtenerValorInput("pass1");
        const pass2 = obtenerValorInput("pass2");

        if (pass1 !== pass2) {
            notificar("Las contraseñas no coinciden.", "warning");
            enfocarCampo("pass1");
            return;
        }

        const datos = {
            nombre: obtenerValorInput("nombre"),
            apellidos: obtenerValorInput("apellidos"),
            email: obtenerValorInput("email"),
            dni: obtenerValorInput("dni"),
            telefono: obtenerValorInput("telefono"),
            direccion: obtenerValorInput("direccion"),
            perfil: obtenerValorInput("perfil"),
            contrasena: pass1
        };

        const acceso = {
            usuario: datos.email,
            contrasena: datos.contrasena
        };

        const fisio = {
            dniFisio: datos.dni,
            nombre: datos.nombre,
            apellidos: datos.apellidos,
            email: datos.email,
            telefono: numeroONull(datos.telefono),
            domicilio: datos.direccion
        };

        try {

            const responseAcceso = await fetch(API_BASE + "/acceso/create", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(acceso)
            });

            if (!responseAcceso.ok) {
                throw new Error("Error al crear el acceso");
            }

            if (datos.perfil === "fisio") {

                const responseFisio = await fetch(API_BASE + "/fisioterapeuta/create", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify(fisio)
                });

                if (!responseFisio.ok) {
                    throw new Error("Error al crear el fisioterapeuta");
                }

            }

            window.location.href = "../index.html";

        } catch (error) {

            console.error("Error en registro:", error);
            notificar("Error al conectar con el servidor. Revisa que el backend esté encendido en el puerto 8085.", "danger");

        }

    });

}

/* ==================================================
   FORMULARIO DE PACIENTE
================================================== */

function configurarFormularioPaciente() {

    const formPaciente = document.getElementById("formRegistroPaciente");

    if (!formPaciente) {
        return;
    }

    const btnLimpiar = document.getElementById("btnLimpiar");
    const btnVolver = document.getElementById("btnVolverPaciente");

    const params = new URLSearchParams(window.location.search);

    let idPaciente = params.get("id") || params.get("dni");
    const modo = params.get("modo") || "editar";
    let volver = params.get("volver") || "inicio.html";

    if (btnVolver) {
        btnVolver.href = volver;
    }

    if (!idPaciente || idPaciente.trim() === "") {

        notificar("No se ha indicado ningún paciente. Esta pantalla solo sirve para completar o editar pacientes existentes.", "danger");

        setTimeout(function () {
            window.location.href = volver;
        }, 1600);

        return;

    }

    prepararModoEditarPaciente(idPaciente, modo);

    if (btnLimpiar) {
        btnLimpiar.addEventListener("click", async function () {
            await cargarPacienteEnFormulario(idPaciente);
            notificar("Formulario restaurado.", "info");
        });
    }

    formPaciente.addEventListener("submit", async function (event) {

        event.preventDefault();

        const paciente = crearPacienteDesdeFormulario();

        if (paciente.dniPaciente === "") {
            notificar("El DNI / Identificación es obligatorio.", "warning");
            enfocarCampo("dni");
            return;
        }

        if (paciente.nombre === "") {
            notificar("El nombre es obligatorio.", "warning");
            enfocarCampo("nombre");
            return;
        }

        if (paciente.apellidos === "") {
            notificar("Los apellidos son obligatorios.", "warning");
            enfocarCampo("apellidos");
            return;
        }

        if (paciente.edad === null) {
            notificar("La edad es obligatoria.", "warning");
            enfocarCampo("edad");
            return;
        }

        if (paciente.email === "") {
            notificar("El email es obligatorio.", "warning");
            enfocarCampo("email");
            return;
        }

        if (paciente.telefono === null) {
            notificar("El teléfono es obligatorio.", "warning");
            enfocarCampo("telefono");
            return;
        }

        if (paciente.localidad === "") {
            notificar("La localidad es obligatoria.", "warning");
            enfocarCampo("localidad");
            return;
        }

        const resultado = await actualizarPaciente(idPaciente, paciente, volver);

        if (resultado && resultado.nuevoId) {
            idPaciente = resultado.nuevoId;
            volver = resultado.nuevoVolver;
        }

    });

}

async function prepararModoEditarPaciente(idPaciente, modo) {

    const titulo = document.getElementById("tituloFormularioPaciente");
    const subtitulo = document.getElementById("subtituloFormularioPaciente");
    const inputDni = document.getElementById("dni");
    const btnGuardar = document.getElementById("btnGuardarPaciente");

    if (titulo) {
        if (modo === "completar") {
            titulo.textContent = "Completar datos del paciente";
        } else {
            titulo.textContent = "Editar datos del paciente";
        }
    }

    if (subtitulo) {
        if (modo === "completar") {
            subtitulo.textContent = "Completa los datos pendientes del menor importado desde el JSON";
        } else {
            subtitulo.textContent = "Modifica los datos del paciente";
        }
    }

    if (btnGuardar) {
        if (modo === "completar") {
            btnGuardar.innerHTML = '<i class="bi bi-save"></i> Completar datos';
        } else {
            btnGuardar.innerHTML = '<i class="bi bi-save"></i> Guardar cambios';
        }
    }

    if (inputDni) {
        inputDni.readOnly = false;
        inputDni.value = idPaciente;
    }

    await cargarPacienteEnFormulario(idPaciente);

}

async function cargarPacienteEnFormulario(idPaciente) {

    try {

        const response = await fetch(API_BASE + "/paciente/find/" + encodeURIComponent(idPaciente));

        if (!response.ok) {
            throw new Error("No se pudo cargar el paciente");
        }

        const paciente = await response.json();

        const inputDni = document.getElementById("dni");

        if (paciente.dniPaciente && String(paciente.dniPaciente).startsWith("AUTO_")) {

            ponerValorInput("dni", "");

            if (inputDni) {
                inputDni.placeholder = "Introduce el DNI real del paciente";
                inputDni.readOnly = false;
            }

        } else {

            ponerValorInput("dni", paciente.dniPaciente);

            if (inputDni) {
                inputDni.placeholder = "DNI del paciente";
                inputDni.readOnly = false;
            }

        }

        ponerValorInput("nombre", limpiarPendiente(paciente.nombre));
        ponerValorInput("apellidos", limpiarPendiente(paciente.apellidos));
        ponerValorInput("edad", paciente.edad);
        ponerValorInput("email", limpiarPendiente(paciente.email));
        ponerValorInput("telefono", limpiarTelefono(paciente.telefono));
        ponerValorInput("localidad", limpiarPendiente(paciente.localidad || paciente.domicilio));

    } catch (error) {

        console.error("Error cargando paciente:", error);
        notificar("No se pudieron cargar los datos del paciente.", "danger");

    }

}

function crearPacienteDesdeFormulario() {

    const localidad = obtenerValorInput("localidad");

    return {
        dniPaciente: obtenerValorInput("dni"),
        nombre: obtenerValorInput("nombre"),
        apellidos: obtenerValorInput("apellidos"),
        edad: numeroONull(obtenerValorInput("edad")),
        email: obtenerValorInput("email"),
        telefono: numeroONull(obtenerValorInput("telefono")),
        localidad: localidad,
        domicilio: localidad,
        datosCompletos: 1
    };

}

async function actualizarPaciente(idPaciente, paciente, volver) {

    try {

        const response = await fetch(API_BASE + "/paciente/update/" + encodeURIComponent(idPaciente), {
            method: "PUT",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(paciente)
        });

        if (response.ok) {

            const pacienteActualizado = await response.json();
            const nuevoId = pacienteActualizado.dniPaciente || paciente.dniPaciente;
            const nuevoVolver = obtenerRutaVolverActualizada(volver, nuevoId);

            actualizarBotonVolver(nuevoVolver);
            actualizarURLFormulario(nuevoId, nuevoVolver);

            notificar("Paciente actualizado correctamente.", "success");

            return {
                nuevoId: nuevoId,
                nuevoVolver: nuevoVolver
            };

        } else {

            const texto = await response.text();
            console.error(texto);

            if (response.status === 409) {
                notificar("Ya existe un paciente con ese DNI.", "warning");
            } else {
                notificar("Error al actualizar el paciente.", "danger");
            }

            return null;

        }

    } catch (error) {

        console.error("Error actualizando paciente:", error);
        notificar("No se pudo conectar con el servidor en el puerto 8085.", "danger");
        return null;

    }

}

function obtenerRutaVolverActualizada(volver, nuevoId) {

    if (!volver || volver.trim() === "") {
        return "inicio.html";
    }

    if (volver.includes("informacion.html")) {
        return "informacion.html?id=" + encodeURIComponent(nuevoId);
    }

    return volver;

}

function actualizarBotonVolver(nuevoVolver) {

    const btnVolver = document.getElementById("btnVolverPaciente");

    if (btnVolver) {
        btnVolver.href = nuevoVolver;
    }

}

function actualizarURLFormulario(nuevoId, nuevoVolver) {

    const url = new URL(window.location.href);

    url.searchParams.set("id", nuevoId);
    url.searchParams.set("modo", "editar");
    url.searchParams.set("volver", nuevoVolver);

    window.history.replaceState({}, "", url.toString());

}

/* ==================================================
   FUNCIONES AUXILIARES
================================================== */

function obtenerValorInput(id) {

    const input = document.getElementById(id);

    if (!input) {
        return "";
    }

    return input.value.trim();

}

function ponerValorInput(id, valor) {

    const input = document.getElementById(id);

    if (!input) {
        return;
    }

    if (valor === null || valor === undefined) {
        input.value = "";
    } else {
        input.value = valor;
    }

}

function numeroONull(valor) {

    if (valor === null || valor === undefined || valor === "") {
        return null;
    }

    const numero = Number(valor);

    if (isNaN(numero)) {
        return null;
    }

    return numero;

}

function limpiarPendiente(valor) {

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

    if (texto.toLowerCase() === "pendiente@pendiente.com") {
        return "";
    }

    return texto;

}

function limpiarTelefono(valor) {

    if (valor === null || valor === undefined) {
        return "";
    }

    if (Number(valor) === 0) {
        return "";
    }

    return valor;

}

function enfocarCampo(id) {

    const campo = document.getElementById(id);

    if (campo) {
        campo.focus();
    }

}

function notificar(mensaje, tipo) {

    if (typeof mostrarToast === "function") {
        mostrarToast(mensaje, tipo);
    } else {
        console.log(tipo + ": " + mensaje);
    }

}