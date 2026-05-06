package com.example.mmpi.persistence;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;

@Entity
@Table(name = "EVENTO", schema = "mmpi")
public class Evento implements java.io.Serializable {

    @Id
    @Column(name = "ID_EVENTO")
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long idEvento;

    @Column(name = "DESCRIPCION")
    private String descripcion;

    @Column(name = "TIPO_EVENTO")
    private String tipoEvento;

    @ManyToOne
    @JoinColumn(name = "ID_SESION")
    private Sesion sesion;

    public Evento() {
    	
    }

    public Evento(String descripcion, String tipoEvento, Sesion sesion) {
    	
        this.descripcion = descripcion;
        this.tipoEvento = tipoEvento;
        this.sesion = sesion;
    
    }

    public Long getIdEvento() {
    
    	return idEvento;
    
    }

    public void setIdEvento(Long idEvento) {
    
    	this.idEvento = idEvento;
    
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

    public Sesion getSesion() {
    
    	return sesion;
    
    }

    public void setSesion(Sesion sesion) {
    
    	this.sesion = sesion;
    
    }

}