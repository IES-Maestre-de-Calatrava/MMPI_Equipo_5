package com.example.mmpi.persistence;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "ACCESO", schema = "mmpi")
public class Acceso implements java.io.Serializable {

    @Id
    @Column(name = "ID_ACCESO")
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long idAcceso;

    @Column(name = "USUARIO")
    private String usuario;

    @Column(name = "CONTRASENA")
    private String contrasena;

    public Acceso() {
    	
    }

    public Acceso(String usuario, String contrasena) {
    	
        this.usuario = usuario;
        this.contrasena = contrasena;
        
    }

    public Long getIdAcceso() {
    	
        return idAcceso;
        
    }

    public void setIdAcceso(Long idAcceso) {
    	
        this.idAcceso = idAcceso;
        
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