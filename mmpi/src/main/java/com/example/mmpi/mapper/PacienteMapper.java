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
        dto.setEdad(paciente.getEdad());
        dto.setLocalidad(paciente.getLocalidad());
        dto.setDatosCompletos(paciente.getDatosCompletos());

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
        paciente.setEdad(dto.getEdad());
        paciente.setLocalidad(dto.getLocalidad());
        paciente.setDatosCompletos(dto.getDatosCompletos());

        if (dto.getDniFisio() != null && !dto.getDniFisio().isBlank()) {

            Fisioterapeuta fisioterapeuta = new Fisioterapeuta();
            fisioterapeuta.setDniFisio(dto.getDniFisio());

            paciente.setFisioterapeuta(fisioterapeuta);

        }

        return paciente;

    }

}