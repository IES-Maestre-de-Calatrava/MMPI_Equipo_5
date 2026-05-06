const API_URL = "http://localhost:8085/acceso";

const formLogin = document.getElementById("formLogin");
const formRegistro = document.getElementById("formRegistro");
const formRecuperar = document.getElementById("formRecuperar");

if (formLogin) {
    formLogin.addEventListener("submit", async (e) => {
        e.preventDefault();

        const email = document.getElementById("emailLogin").value;
        const contrasena = document.getElementById("contrasenaLogin").value;

        try {
            const response = await fetch(`${API_URL}/find`);

            if (!response.ok) {
                throw new Error("Error al comprobar el inicio de sesión");
            }

            const accesos = await response.json();

            const usuarioEncontrado = accesos.find(acceso =>
                acceso.usuario === email && acceso.contrasena === contrasena
            );

            if (usuarioEncontrado) {
                alert("Inicio de sesión correcto");
                window.location.href = "principal.html";
            } else {
                alert("Correo o contraseña incorrectos");
            }

        } catch (error) {
            alert(error.message);
        }
    });
}

if (formRegistro) {
    formRegistro.addEventListener("submit", async (e) => {
        e.preventDefault();

        const nombre = document.getElementById("nombreRegistro").value;
        const email = document.getElementById("emailRegistro").value;
        const perfil = document.getElementById("perfilRegistro").value;
        const contrasena = document.getElementById("contrasenaRegistro").value;

        if (contrasena.length < 8) {
            alert("La contraseña debe tener mínimo 8 caracteres");
            return;
        }

        const acceso = {
            usuario: email,
            contrasena: contrasena
        };

        try {
            const comprobarResponse = await fetch(`${API_URL}/find`);

            if (!comprobarResponse.ok) {
                throw new Error("Error al comprobar usuarios existentes");
            }

            const accesos = await comprobarResponse.json();

            const existeUsuario = accesos.find(acceso =>
                acceso.usuario === email
            );

            if (existeUsuario) {
                alert("Ese correo ya está registrado");
                return;
            }

            const response = await fetch(`${API_URL}/create`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(acceso)
            });

            if (!response.ok) {
                throw new Error("Error al registrar usuario");
            }

            alert("Usuario registrado correctamente");
            formRegistro.reset();
            window.location.href = "index.html";

        } catch (error) {
            alert(error.message);
        }
    });
}

if (formRecuperar) {
    formRecuperar.addEventListener("submit", async (e) => {
        e.preventDefault();

        const email = document.getElementById("emailRecuperar").value;

        try {
            const response = await fetch(`${API_URL}/find`);

            if (!response.ok) {
                throw new Error("Error al comprobar el correo");
            }

            const accesos = await response.json();

            const usuarioEncontrado = accesos.find(acceso =>
                acceso.usuario === email
            );

            if (usuarioEncontrado) {
                alert("El correo existe. En una app real aquí se enviaría un enlace de recuperación.");
                window.location.href = "index.html";
            } else {
                alert("No existe ninguna cuenta con ese correo");
            }

        } catch (error) {
            alert(error.message);
        }
    });
}