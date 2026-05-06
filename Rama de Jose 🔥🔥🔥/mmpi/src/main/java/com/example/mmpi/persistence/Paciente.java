package com.example.mmpi.persistence;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;

@Entity
@Table(name = "PACIENTE", schema = "mmpi")
public class Paciente implements java.io.Serializable {

    @Id
    @Column(name = "DNI_PACIENTE")
    private String dniPaciente;

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
    @JoinColumn(name = "DNI_FISIO")
    private Fisioterapeuta fisioterapeuta;

    public Paciente() {
    	
    }

    public Paciente(String dniPaciente, String nombre, String apellidos, String domicilio, String email, Integer telefono, Fisioterapeuta fisioterapeuta) {
      
    	this.dniPaciente = dniPaciente;
        this.nombre = nombre;
        this.apellidos = apellidos;
        this.domicilio = domicilio;
        this.email = email;
        this.telefono = telefono;
        this.fisioterapeuta = fisioterapeuta;
    
    }

    public String getDniPaciente() {
    
    	return dniPaciente;
    
    }

    public void setDniPaciente(String dniPaciente) {
    
    	this.dniPaciente = dniPaciente;
    
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

    public Fisioterapeuta getFisioterapeuta() {
    
    	return fisioterapeuta;

    }

    public void setFisioterapeuta(Fisioterapeuta fisioterapeuta) {
    
    	this.fisioterapeuta = fisioterapeuta;
    
    }

}