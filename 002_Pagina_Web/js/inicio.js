/*Javascript exclusivo de la pagina vista pacientes o Inicio*/

document.addEventListener("DOMContentLoaded", () => {
    cargarPacientes();
});

async function cargarPacientes() {
    const container = document.getElementById('patient-container');
    
    try {
        // 1. Petición al servidor (Ajusta la URL a tu endpoint de Spring Boot)
        // Ejemplo: fetch('/api/pacientes/all')
        const response = await fetch('/api/pacientes/all');
        
        if (!response.ok) throw new Error("Error en la respuesta del servidor");
        
        const pacientes = await response.json();
        
        // Limpiamos el cargando
        container.innerHTML = "";

        if (pacientes.length === 0) {
            container.innerHTML = `<div class="col-12 text-center text-muted">No hay pacientes registrados.</div>`;
            return;
        }

        // 2. Generar las tarjetas
        pacientes.forEach(paciente => {
            const card = document.createElement('div');
            card.className = 'col-md-4';
            card.innerHTML = `
                <div class="patient-card text-white">
                    <div class="patient-img-wrapper bg-white rounded-3 mb-3">
                        <img src="${paciente.fotoUrl || '/media/imgs/nino.png'}" alt="${paciente.nombre}">
                    </div>
                    <h5 class="patient-name text-uppercase">${paciente.nombre} ${paciente.apellidos}</h5>
                    <div class="patient-info small mb-3">
                        <p><strong>Edad:</strong> ${paciente.edad} años</p>
                        <p><strong>Localidad:</strong> ${paciente.localidad}</p>
                        <p class="desc">${paciente.descripcion || 'Sin descripción disponible.'}</p>
                    </div>
                    <div class="d-grid gap-2">
                        <a href="/media/docs/reporte_${paciente.id}_diario.pdf" download class="btn btn-light btn-report">
                            <i class="bi bi-file-earmark-text"></i> Descargar Reporte Diario
                        </a>
                        <a href="/media/docs/reporte_${paciente.id}_semanal.pdf" download class="btn btn-light btn-report">
                            <i class="bi bi-file-earmark-text"></i> Descargar Reporte Semanal
                        </a>
                        <a href="informacion.html?id=${paciente.id}" class="btn btn-light btn-report">
                            <i class="bi bi-info-circle"></i> Ver más información
                        </a>
                    </div>
                </div>
            `;
            container.appendChild(card);
        });

    } catch (error) {
        console.error("Error cargando pacientes:", error);
        container.innerHTML = `
            <div class="col-12 text-center text-danger">
                <i class="bi bi-exclamation-triangle fs-1"></i>
                <p>No se pudo conectar con el servidor.</p>
            </div>`;
    }
}

document.addEventListener("DOMContentLoaded", () => {
    // Manejo del botón de añadir
    const btnAdd = document.getElementById("btnAddPatient");
    if (btnAdd) {
        btnAdd.addEventListener("click", () => {
            window.location.href = "/register.html";
        });
    }

    // Cargar pacientes desde el servidor
    cargarPacientes();
});

async function cargarPacientes() {
    const container = document.getElementById('patient-container');
    
    try {
        const response = await fetch('/api/pacientes/all');
        if (!response.ok) throw new Error("Error en el servidor");
        
        const pacientes = await response.json();
        container.innerHTML = ""; // Quitar loading

        if (pacientes.length === 0) {
            container.innerHTML = `<div class="col-12 text-center text-muted">No hay pacientes registrados.</div>`;
            return;
        }

        pacientes.forEach(p => {
            container.innerHTML += `
                <div class="col-md-4">
                    <div class="patient-card text-white">
                        <div class="patient-img-wrapper bg-white rounded-3 mb-3">
                            <img src="${p.fotoUrl || '/media/imgs/nino.png'}" alt="Paciente">
                        </div>
                        <h5 class="patient-name text-uppercase">${p.nombre} ${p.apellidos}</h5>
                        <div class="patient-info small mb-3">
                            <p><strong>Edad:</strong> ${p.edad} años</p>
                            <p><strong>Localidad:</strong> ${p.localidad}</p>
                        </div>
                        <div class="d-grid gap-2">
                            <a href="/informacion.html?id=${p.id}" class="btn btn-light btn-report">
                                <i class="bi bi-info-circle"></i> Ver Detalles
                            </a>
                        </div>
                    </div>
                </div>`;
        });
    } catch (error) {
        console.error(error);
        container.innerHTML = `<p class="text-center text-danger">No se pudo conectar con el servidor.</p>`;
    }
}