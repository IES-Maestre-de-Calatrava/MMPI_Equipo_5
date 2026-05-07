package com.example.mmpi.persistence;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "DISPOSITIVO", schema = "mmpi")
public class Dispositivo implements java.io.Serializable {

    @Id
    @Column(name = "ID_DISPOSITIVO")
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long idDispositivo;

    public Dispositivo() {
    	
    }

    public Long getIdDispositivo() {
    	
        return idDispositivo;
        
    }

    public void setIdDispositivo(Long idDispositivo) {
    	
        this.idDispositivo = idDispositivo;
        
    }
    
}