package com.example.mmpi.mapper;

import com.example.mmpi.dto.PacienteDTO;
import com.example.mmpi.persistence.Fisioterapeuta;
import com.example.mmpi.persistence.Paciente;

public class PacienteMapper {

    public static PacienteDTO toDTO(Paciente paciente) {

        PacienteDTO dto = new PacienteDTO();

        dto.setDniPaciente(paciente.getDniPaciente());
        dto.setNombre(paciente.getNombre());
        dto.setApellidos(paciente.getApellidos());
        dto.setDomicilio(paciente.getDomicilio());
        dto.setEmail(paciente.getEmail());
        dto.setTelefono(paciente.getTelefono());

        if (paciente.getFisioterapeuta() != null) {
        	
            
        	dto.setDniFisio(paciente.getFisioterapeuta().getDniFisio());
        }

        return dto;
    
    }

    public static Paciente toEntity(PacienteDTO dto) {

        Paciente paciente = new Paciente();

        paciente.setDniPaciente(dto.getDniPaciente());
        paciente.setNombre(dto.getNombre());
        paciente.setApellidos(dto.getApellidos());
        paciente.setDomicilio(dto.getDomicilio());
        paciente.setEmail(dto.getEmail());
        paciente.setTelefono(dto.getTelefono());

        if (dto.getDniFisio() != null) {
    
        	Fisioterapeuta fisio = new Fisioterapeuta();
            fisio.setDniFisio(dto.getDniFisio());
            
            paciente.setFisioterapeuta(fisio);
        }

        
        return paciente;
    }

}