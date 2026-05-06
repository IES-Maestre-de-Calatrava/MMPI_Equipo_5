package com.example.mmpi.persistence;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;

@Entity
@Table(name = "FISIOTERAPEUTA", schema = "mmpi")
public class Fisioterapeuta implements java.io.Serializable {

    @Id
    @Column(name = "DNI_FISIO")
    private String dniFisio;

    @Column(name = "NOMBRE")
    private String nombre;

    @Column(name = "APELLIDOS")
    private String apellidos;

    @Column(name = "DOMICILIO")
    private String domicilio;

    @Column(name = "EMAIL")
    private String email;

    @Column(name = "TELEFONO")
    private Integer telefono;

    @ManyToOne
    @JoinColumn(name = "ID_ACCESO")
    private Acceso acceso;

    public Fisioterapeuta() {
    	
    }

    public Fisioterapeuta(String dniFisio, String nombre, String apellidos, String domicilio, String email, Integer telefono, Acceso acceso) {
    	
        this.dniFisio = dniFisio;
        this.nombre = nombre;
        this.apellidos = apellidos;
        this.domicilio = domicilio;
        this.email = email;
        this.telefono = telefono;
        this.acceso = acceso;
        
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

    public Acceso getAcceso() {
    	
        return acceso;
        
    }

    public void setAcceso(Acceso acceso) {
    	
        this.acceso = acceso;
        
    }
    
}