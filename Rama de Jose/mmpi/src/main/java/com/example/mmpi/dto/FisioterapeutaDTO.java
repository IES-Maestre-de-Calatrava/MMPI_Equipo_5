package com.example.mmpi.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public class FisioterapeutaDTO {

    @NotBlank
    @Size(max = 9)
    private String dniFisio;

    @NotBlank
    @Size(max = 50)
    private String nombre;

    @NotBlank
    @Size(max = 50)
    private String apellidos;

    @Size(max = 50)
    private String domicilio;

    @Email
    @Size(max = 50)
    private String email;

    private Integer telefono;

    private Long idAcceso;

    public FisioterapeutaDTO() {
    	
    }

    public FisioterapeutaDTO(String dniFisio, String nombre, String apellidos, String domicilio, String email, Integer telefono, Long idAcceso) {
    	
        this.dniFisio = dniFisio;
        this.nombre = nombre;
        this.apellidos = apellidos;
        this.domicilio = domicilio;
        this.email = email;
        this.telefono = telefono;
        this.idAcceso = idAcceso;
        
    }

    public String getDniFisio() {
    	
        return dniFisio;
        
    }

    public void setDniFisio(String dniFisio) {
    	
        this.dniFisio = dniFisio;
        
    }

    public String getNombre() {
    	
        return nombre;
        
    }

    public void setNombre(String nombre) {
    	
        this.nombre = nombre;
        
    }

    public String getApellidos() {
    	
        return apellidos;
        
    }

    public void setApellidos(String apellidos) {
    	
        this.apellidos = apellidos;
        
    }

    public String getDomicilio() {
    	
        return domicilio;
        
    }

    public void setDomicilio(String domicilio) {
    	
        this.domicilio = domicilio;
        
    }

    public String getEmail() {
    	
        return email;
        
    }

    public void setEmail(String email) {
    	
        this.email = email;
    
    }

    public Integer getTelefono() {
        
    	return telefono;
    
    }

    public void setTelefono(Integer telefono) {
    
    	this.telefono = telefono;
    
    }

    public Long getIdAcceso() {
    
    	return idAcceso;
    
    }

    public void setIdAcceso(Long idAcceso) {
    
    	this.idAcceso = idAcceso;
    
    }

}