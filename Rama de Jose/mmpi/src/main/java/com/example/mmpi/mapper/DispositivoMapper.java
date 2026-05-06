package com.example.mmpi.mapper;

import com.example.mmpi.dto.DispositivoDTO;
import com.example.mmpi.persistence.Dispositivo;

public class DispositivoMapper {

    public static DispositivoDTO toDTO(Dispositivo dispositivo) {

        DispositivoDTO dispositivoDTO = new DispositivoDTO();

        dispositivoDTO.setId(dispositivo.getIdDispositivo());

        return dispositivoDTO;
        
    }

    public static Dispositivo toEntity(DispositivoDTO dispositivoDTO) {

        Dispositivo dispositivo = new Dispositivo();

        dispositivo.setIdDispositivo(dispositivoDTO.getId());

        return dispositivo;
        
    }
    
}