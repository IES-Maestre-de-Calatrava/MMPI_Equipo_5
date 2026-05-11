package com.example.mmpi.mapper;

import com.example.mmpi.dto.SesionDTO;
import com.example.mmpi.persistence.*;

public class SesionMapper {

    public static SesionDTO toDTO(Sesion s) {

        SesionDTO dto = new SesionDTO();

        dto.setIdSesion(s.getIdSesion());
        dto.setAceleracionesBruscas(s.getAceleracionesBruscas());
        dto.setColisiones(s.getColisiones());
        dto.setEstabilidad(s.getEstabilidad());
        dto.setNivel(s.getNivel());
        dto.setParadasBruscas(s.getParadasBruscas());
        dto.setScore(s.getScore());
        dto.setTiempoMovimiento(s.getTiempoMovimiento());

        dto.setTiempoSesion(s.getTiempoSesion());

        dto.setAnioSesion(s.getAnioSesion());
        dto.setMesSesion(s.getMesSesion());
        dto.setDiaSesion(s.getDiaSesion());

        if (s.getFisioterapeuta() != null)
            dto.setDniFisio(s.getFisioterapeuta().getDniFisio());

        if (s.getPaciente() != null)
            dto.setDniPaciente(s.getPaciente().getDniPaciente());

        return dto;
    }

    public static Sesion toEntity(SesionDTO dto) {

        Sesion s = new Sesion();

        s.setIdSesion(dto.getIdSesion());
        s.setAceleracionesBruscas(dto.getAceleracionesBruscas());
        s.setColisiones(dto.getColisiones());
        s.setEstabilidad(dto.getEstabilidad());
        s.setNivel(dto.getNivel());
        s.setParadasBruscas(dto.getParadasBruscas());
        s.setScore(dto.getScore());
        s.setTiempoMovimiento(dto.getTiempoMovimiento());

        s.setTiempoSesion(dto.getTiempoSesion());

        s.setAnioSesion(dto.getAnioSesion());
        s.setMesSesion(dto.getMesSesion());
        s.setDiaSesion(dto.getDiaSesion());

        if (dto.getDniFisio() != null) {
            Fisioterapeuta f = new Fisioterapeuta();
            f.setDniFisio(dto.getDniFisio());
            s.setFisioterapeuta(f);
        }

        if (dto.getDniPaciente() != null) {
            Paciente p = new Paciente();
            p.setDniPaciente(dto.getDniPaciente());
            s.setPaciente(p);
        }

        return s;
    }
}