package com.example.mmpi.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public class AccesoDTO {

    private Long id;

    @NotBlank
    @Size(max = 50)
    private String usuario;

    @NotBlank
    @Size(max = 50)
    private String contrasena;

    public AccesoDTO() {
    	
    }

    public AccesoDTO(Long id, String usuario, String contrasena) {
    	
        this.id = id;
        this.usuario = usuario;
        this.contrasena = contrasena;
        
    }

    public Long getId() {
    	
        return id;
        
    }

    public void setId(Long id) {
    	
        this.id = id;
        
    }

    public String getUsuario() {
    	
        return usuario;
        
    }

    public void setUsuario(String usuario) {
    	
        this.usuario = usuario;
        
    }

    public String getContrasena() {
    	
        return contrasena;
        
    }

    public void setContrasena(String contrasena) {
    	
        this.contrasena = contrasena;
        
    }
    
}