document.addEventListener('DOMContentLoaded', function() {
    
    // Buscamos el formulario de login por su ID
    const formLogin = document.getElementById('formLogin');

    if (formLogin) {
        formLogin.addEventListener('submit', function(event) {
            // 1. Detenemos el envío real para que no recargue la página
            event.preventDefault();
            
            // 2. Redirigimos a la página de inicio
            // Usamos la ruta relativa simple ya que están en la misma carpeta
            window.location.href = 'inicio.html'; 
        });
    }

    // EXTRA: Si tienes otros formularios (registro o recuperar contraseña) 
    // puedes añadir sus funciones aquí mismo abajo.
});