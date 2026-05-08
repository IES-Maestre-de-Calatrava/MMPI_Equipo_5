package com.example.mmpi.mapper;

import com.example.mmpi.dto.AccesoDTO;
import com.example.mmpi.persistence.Acceso;

public class AccesoMapper {

    public static AccesoDTO toDTO(Acceso acceso) {

        AccesoDTO accesoDTO = new AccesoDTO();

        accesoDTO.setId(acceso.getIdAcceso());
        accesoDTO.setUsuario(acceso.getUsuario());
        accesoDTO.setContrasena(acceso.getContrasena());

        return accesoDTO;
        
    }

    public static Acceso toEntity(AccesoDTO accesoDTO) {

        Acceso acceso = new Acceso();

        acceso.setIdAcceso(accesoDTO.getId());
        acceso.setUsuario(accesoDTO.getUsuario());
        acceso.setContrasena(accesoDTO.getContrasena());

        return acceso;
        
    }
    
}