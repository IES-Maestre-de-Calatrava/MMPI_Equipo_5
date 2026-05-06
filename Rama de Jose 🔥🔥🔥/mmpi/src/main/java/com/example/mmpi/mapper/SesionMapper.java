package com.example.mmpi.mapper;

import com.example.mmpi.dto.SesionDTO;
import com.example.mmpi.persistence.Dispositivo;
import com.example.mmpi.persistence.Fisioterapeuta;
import com.example.mmpi.persistence.Paciente;
import com.example.mmpi.persistence.Sesion;

public class SesionMapper {

    public static SesionDTO toDTO(Sesion sesion) {

        SesionDTO dto = new SesionDTO();

        dto.setIdSesion(sesion.getIdSesion());
        dto.setAceleracionesBruscas(sesion.getAceleracionesBruscas());
        dto.setColisiones(sesion.getColisiones());
        dto.setEstabilidad(sesion.getEstabilidad());
        dto.setNivel(sesion.getNivel());
        dto.setParadasBruscas(sesion.getParadasBruscas());
        dto.setScore(sesion.getScore());
        dto.setTiempoMovimiento(sesion.getTiempoMovimiento());
        dto.setTiempoSesion(sesion.getTiempoSesion());

        if (sesion.getFisioterapeuta() != null) {
        	
            dto.setDniFisio(sesion.getFisioterapeuta().getDniFisio());
        
        }

        if (sesion.getPaciente() != null) {
        
        	dto.setDniPaciente(sesion.getPaciente().getDniPaciente());
        
        }

        if (sesion.getDispositivo() != null) {
        
        	dto.setIdDispositivo(sesion.getDispositivo().getIdDispositivo());
        
        }

        
        return dto;
    
    }

    public static Sesion toEntity(SesionDTO dto) {

        Sesion sesion = new Sesion();

        sesion.setIdSesion(dto.getIdSesion());
        sesion.setAceleracionesBruscas(dto.getAceleracionesBruscas());
        sesion.setColisiones(dto.getColisiones());
        sesion.setEstabilidad(dto.getEstabilidad());
        sesion.setNivel(dto.getNivel());
        sesion.setParadasBruscas(dto.getParadasBruscas());
        sesion.setScore(dto.getScore());
        sesion.setTiempoMovimiento(dto.getTiempoMovimiento());
        sesion.setTiempoSesion(dto.getTiempoSesion());

        if (dto.getDniFisio() != null) {
    
        	Fisioterapeuta fisio = new Fisioterapeuta();
            fisio.setDniFisio(dto.getDniFisio());
            sesion.setFisioterapeuta(fisio);
        
        }

        if (dto.getDniPaciente() != null) {
        
        	Paciente paciente = new Paciente();
            paciente.setDniPaciente(dto.getDniPaciente());
            sesion.setPaciente(paciente);
        
        }

        if (dto.getIdDispositivo() != null) {
        
        	Dispositivo dispositivo = new Dispositivo();
            dispositivo.setIdDispositivo(dto.getIdDispositivo());
            sesion.setDispositivo(dispositivo);
        
        }
        
        return sesion;
    
    }

}