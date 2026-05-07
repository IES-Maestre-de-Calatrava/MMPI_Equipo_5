document.addEventListener('DOMContentLoaded', function() {

    // ==========================================
<<<<<<< Updated upstream
    // 1. INICIO DE SESIÓN (LOGIN)
=======
    // 1. LÓGICA DE INICIO DE SESIÓN (LOGIN)
>>>>>>> Stashed changes
    // ==========================================
    const formLogin = document.getElementById('formLogin');
    if (formLogin) {
        formLogin.addEventListener('submit', async (event) => {
<<<<<<< Updated upstream
            event.preventDefault();

            // Capturamos los datos de los IDs de tu HTML
=======
            event.preventDefault(); // Detiene la recarga de página

>>>>>>> Stashed changes
            const email = document.getElementById('emailLogin').value;
            const contrasena = document.getElementById('contrasenaLogin').value;

            try {
<<<<<<< Updated upstream
                // Petición al puerto 8085 (ajusta si al final usas el 8086)
                const response = await fetch("http://localhost:8086/acceso/login", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        usuario: email,
                        contrasena: contrasena
                    })
                });

                if (response.ok) {
                    alert("¡Bienvenido!");
                    window.location.href = 'inicio.html';
                } else {
                    alert("Correo o contraseña incorrectos");
                }

            } catch (error) {
                console.error("Error:", error);
                alert("Error de conexión. ¿Está el backend encendido con @CrossOrigin?");
=======
                const response = await fetch("http://localhost:8086/acceso/login", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ usuario: email, contrasena: contrasena })
                });

                if (response.ok) {
                    window.location.href = 'inicio.html'; //
                } else {
                    alert("Usuario o contraseña incorrectos");
                }
            } catch (error) {
                console.error("Error en login:", error);
                alert("Error de conexión. Asegúrate de que el backend 8086 esté encendido y tenga @CrossOrigin.");
>>>>>>> Stashed changes
            }
        });
    }

    // ==========================================
<<<<<<< Updated upstream
    // 2. REGISTRO DE USUARIOS
=======
    // 2. LÓGICA DE REGISTRO
>>>>>>> Stashed changes
    // ==========================================
    const formRegistro = document.getElementById('formRegistro');
    if (formRegistro) {
        formRegistro.addEventListener("submit", async (e) => {
            e.preventDefault();

<<<<<<< Updated upstream
            const nombre = document.getElementById("nombre").value;
            const email = document.getElementById("email").value;
            const pass = document.getElementById("pass1").value;
            // ... (puedes añadir el resto de campos aquí)

            const acceso = { usuario: email, contrasena: pass };

            try {
                const response = await fetch("http://localhost:8085/acceso/create", {
=======
            const datos = {
                nombre: document.getElementById("nombre").value,
                apellidos: document.getElementById("apellidos").value,
                email: document.getElementById("email").value,
                dni: document.getElementById("dni").value,
                telefono: document.getElementById("telefono").value,
                direccion: document.getElementById("direccion").value,
                perfil: document.getElementById("perfil").value,
                contrasena: document.getElementById("pass1").value
            };

            const acceso = { usuario: datos.email, contrasena: datos.contrasena };
            const fisio = {
                dniFisio: datos.dni,
                nombre: datos.nombre,
                apellidos: datos.apellidos,
                email: datos.email,
                telefono: datos.telefono,
                domicilio: datos.direccion
            };

            try {
                // Registro en tabla Acceso
                await fetch("http://localhost:8086/acceso/create", {
>>>>>>> Stashed changes
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(acceso)
                });

<<<<<<< Updated upstream
                if (response.ok) {
                    alert("Registro exitoso");
                    window.location.href = "index.html";
                }
            } catch (error) {
                alert("Error al registrar: " + error.message);
=======
                // Registro en tabla Fisioterapeuta si aplica
                if (datos.perfil === "fisio") {
                    await fetch("http://localhost:8086/fisioterapeuta/create", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify(fisio)
                    });
                }

                alert("Registro completado con éxito");
                window.location.href = "index.html"; //
            } catch (error) {
                console.error("Error en registro:", error);
                alert("Error al conectar con el servidor. Revisa el puerto 8086.");
>>>>>>> Stashed changes
            }
        });
    }
});