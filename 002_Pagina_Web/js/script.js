if (formRegistro) {
    formRegistro.addEventListener("submit", async (e) => {
        e.preventDefault();

        const nombre = document.getElementById("nombre").value;
        const apellidos = document.getElementById("apellidos").value;
        const email = document.getElementById("email").value;
        const dni = document.getElementById("dni").value;
        const telefono = document.getElementById("telefono").value;
        const direccion = document.getElementById("direccion").value;
        const perfil = document.getElementById("perfil").value;
        const contrasena = document.getElementById("pass1").value;

        if (contrasena.length < 8) {
            alert("La contraseña debe tener mínimo 8 caracteres");
            return;
        }

        // 1. GUARDAR ACCESO
        const acceso = {
            usuario: email,
            contrasena: contrasena
        };

        // 2. GUARDAR FISIOTERAPEUTA (si aplica)
        const fisioterapeuta = {
            dniFisio: dni,
            nombre: nombre,
            apellidos: apellidos,
            email: email,
            telefono: telefono,
            domicilio: direccion,
            idAcceso: null // si luego lo conectas
        };

        try {
            // ACCESO
            await fetch("http://localhost:8085/acceso/create", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(acceso)
            });

            // FISIOTERAPEUTA (solo si es fisio)
            if (perfil === "fisio") {
                await fetch("http://localhost:8085/fisioterapeuta/create", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(fisioterapeuta)
                });
            }

            alert("Usuario registrado correctamente");
            formRegistro.reset();
            window.location.href = "index.html";

        } catch (error) {
            alert("Error al registrar: " + error.message);
        }
    });
}