package com.example.mmpi.dto;

import jakarta.validation.constraints.Size;

public class EventoDTO {

    private Long id;

    @Size(max = 50)
    private String descripcion;

    @Size(max = 50)
    private String tipoEvento;

    private String idSesion;

    public EventoDTO() {
    	
    }

    public EventoDTO(Long id, String descripcion, String tipoEvento, String idSesion) {
        
    	this.id = id;
        this.descripcion = descripcion;
        this.tipoEvento = tipoEvento;
        this.idSesion = idSesion;
    
    }

    public Long getId() {
    
    	return id;
    
    }

    public void setId(Long id) {
    
    	this.id = id;
    
    }

    public String getDescripcion() {
    
    	return descripcion;
    
    }

    public void setDescripcion(String descripcion) {
    
    	this.descripcion = descripcion;
    
    }

    public String getTipoEvento() {
    
    	return tipoEvento;
    
    }

    public void setTipoEvento(String tipoEvento) {
    
    	this.tipoEvento = tipoEvento;
    
    }

    public String getIdSesion() {

    	return idSesion;
    
    }

    public void setIdSesion(String idSesion) {
    
    	this.idSesion = idSesion;
    
    }

}