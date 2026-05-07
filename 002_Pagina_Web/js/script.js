document.addEventListener('DOMContentLoaded', function() {

    // ==========================================
    // 1. INICIO DE SESIÓN (LOGIN)
    // ==========================================
    const formLogin = document.getElementById('formLogin');
    if (formLogin) {
        formLogin.addEventListener('submit', async (event) => {
            event.preventDefault();

            // Capturamos los datos de los IDs de tu HTML
            const email = document.getElementById('emailLogin').value;
            const contrasena = document.getElementById('contrasenaLogin').value;

            try {
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
            }
        });
    }

    // ==========================================
    // 2. REGISTRO DE USUARIOS
    // ==========================================
    const formRegistro = document.getElementById('formRegistro');
    if (formRegistro) {
        formRegistro.addEventListener("submit", async (e) => {
            e.preventDefault();

            const nombre = document.getElementById("nombre").value;
            const email = document.getElementById("email").value;
            const pass = document.getElementById("pass1").value;
            // ... (puedes añadir el resto de campos aquí)

            const acceso = { usuario: email, contrasena: pass };

            try {
                const response = await fetch("http://localhost:8085/acceso/create", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(acceso)
                });

                if (response.ok) {
                    alert("Registro exitoso");
                    window.location.href = "index.html";
                }
            } catch (error) {
                alert("Error al registrar: " + error.message);
            }
        });
    }
});