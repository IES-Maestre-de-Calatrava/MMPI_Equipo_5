package com.example.mmpi.mapper;

import com.example.mmpi.dto.EventoDTO;
import com.example.mmpi.persistence.Evento;
import com.example.mmpi.persistence.Sesion;

public class EventoMapper {

    public static EventoDTO toDTO(Evento evento) {

        EventoDTO dto = new EventoDTO();

        dto.setId(evento.getIdEvento());
        dto.setDescripcion(evento.getDescripcion());
        dto.setTipoEvento(evento.getTipoEvento());

        if (evento.getSesion() != null) {
        	
        	dto.setIdSesion(evento.getSesion().getIdSesion());
        
        }

        return dto;
    }

    public static Evento toEntity(EventoDTO dto) {

        Evento evento = new Evento();

        evento.setIdEvento(dto.getId());
        evento.setDescripcion(dto.getDescripcion());
        evento.setTipoEvento(dto.getTipoEvento());

        if (dto.getIdSesion() != null) {
        
        	Sesion sesion = new Sesion();
            sesion.setIdSesion(dto.getIdSesion());
            evento.setSesion(sesion);
        
        }

        return evento;
    
    }

}