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
            alert("Introduce el correo y la contraseña.");
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
                alert("Usuario o contraseña incorrectos.");
            }

        } catch (error) {

            console.error("Error en login:", error);
            alert("Error de conexión. Asegúrate de que el backend esté encendido en el puerto 8085.");

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
            alert("Las contraseñas no coinciden.");
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

            alert("Registro completado con éxito.");
            window.location.href = "../index.html";

        } catch (error) {

            console.error("Error en registro:", error);
            alert("Error al conectar con el servidor. Revisa que el backend esté encendido en el puerto 8085.");

        }

    });

}

/* ==================================================
   FORMULARIO DE PACIENTE
   Solo completar/editar pacientes creados desde JSON
================================================== */

function configurarFormularioPaciente() {

    const formPaciente = document.getElementById("formRegistroPaciente");

    if (!formPaciente) {
        return;
    }

    const btnLimpiar = document.getElementById("btnLimpiar");
    const btnVolver = document.getElementById("btnVolverPaciente");

    const params = new URLSearchParams(window.location.search);

    const idPaciente = params.get("id") || params.get("dni");
    const modo = params.get("modo") || "editar";
    const volver = params.get("volver") || "inicio.html";

    if (btnVolver) {
        btnVolver.href = volver;
    }

    if (!idPaciente || idPaciente.trim() === "") {
        alert("No se ha indicado ningún paciente. Esta pantalla solo sirve para completar o editar pacientes existentes.");
        window.location.href = volver;
        return;
    }

    prepararModoEditarPaciente(idPaciente, modo);

    if (btnLimpiar) {
        btnLimpiar.addEventListener("click", function () {
            if (confirm("¿Seguro que quieres borrar los campos del formulario?")) {
                formPaciente.reset();
                ponerValorInput("dni", idPaciente);
            }
        });
    }

    formPaciente.addEventListener("submit", async function (event) {

        event.preventDefault();

        const paciente = crearPacienteDesdeFormulario();

        if (paciente.dniPaciente === "") {
            alert("El DNI / Identificación es obligatorio.");
            return;
        }

        if (paciente.nombre === "") {
            alert("El nombre es obligatorio.");
            return;
        }

        if (paciente.apellidos === "") {
            alert("Los apellidos son obligatorios.");
            return;
        }

        if (paciente.edad === null) {
            alert("La edad es obligatoria.");
            return;
        }

        if (paciente.email === "") {
            alert("El email es obligatorio.");
            return;
        }

        if (paciente.telefono === null) {
            alert("El teléfono es obligatorio.");
            return;
        }

        if (paciente.localidad === "") {
            alert("La localidad es obligatoria.");
            return;
        }

        await actualizarPaciente(idPaciente, paciente, volver);

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
        inputDni.readOnly = true;
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
        alert("No se pudieron cargar los datos del paciente.");

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
            alert("Paciente actualizado con éxito.");
            window.location.href = volver;
        } else {
            const texto = await response.text();
            console.error(texto);
            alert("Error al actualizar el paciente.");
        }

    } catch (error) {

        console.error("Error actualizando paciente:", error);
        alert("No se pudo conectar con el servidor en el puerto 8085.");

    }

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