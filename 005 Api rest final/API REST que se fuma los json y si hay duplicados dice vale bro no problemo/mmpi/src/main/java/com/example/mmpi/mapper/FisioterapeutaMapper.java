package com.example.mmpi.mapper;

import com.example.mmpi.dto.FisioterapeutaDTO;
import com.example.mmpi.persistence.Acceso;
import com.example.mmpi.persistence.Fisioterapeuta;

public class FisioterapeutaMapper {

    public static FisioterapeutaDTO toDTO(Fisioterapeuta fisio) {

        FisioterapeutaDTO dto = new FisioterapeutaDTO();

        dto.setDniFisio(fisio.getDniFisio());
        dto.setNombre(fisio.getNombre());
        dto.setApellidos(fisio.getApellidos());
        dto.setDomicilio(fisio.getDomicilio());
        dto.setEmail(fisio.getEmail());
        dto.setTelefono(fisio.getTelefono());

        if (fisio.getAcceso() != null) {
            dto.setIdAcceso(fisio.getAcceso().getIdAcceso());
            
        }

        return dto;
    
    }

    public static Fisioterapeuta toEntity(FisioterapeutaDTO dto) {

        Fisioterapeuta fisio = new Fisioterapeuta();

        fisio.setDniFisio(dto.getDniFisio());
        fisio.setNombre(dto.getNombre());
        fisio.setApellidos(dto.getApellidos());
        fisio.setDomicilio(dto.getDomicilio());
        fisio.setEmail(dto.getEmail());
        fisio.setTelefono(dto.getTelefono());

        if (dto.getIdAcceso() != null) {
    
        	Acceso acceso = new Acceso();
            acceso.setIdAcceso(dto.getIdAcceso());
            fisio.setAcceso(acceso);
        
        }

        return fisio;
    
    }

}