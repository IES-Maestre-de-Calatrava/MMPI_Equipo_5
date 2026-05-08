package com.example.mmpi.dto;

import java.time.LocalDateTime;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public class SesionDTO {

    @NotBlank
    @Size(max = 5)
    private String idSesion;

    private Integer aceleracionesBruscas;
    private Integer colisiones;
    private Integer estabilidad;
    private String nivel;
    private Integer paradasBruscas;
    private Integer score;
    private Integer tiempoMovimiento;
    private LocalDateTime tiempoSesion;

    private String dniFisio;
    private String dniPaciente;
    private Long idDispositivo;

    public SesionDTO() {
    	
    }

    public SesionDTO(String idSesion, Integer aceleracionesBruscas, Integer colisiones, Integer estabilidad, String nivel, Integer paradasBruscas, Integer score, Integer tiempoMovimiento,
LocalDateTime tiempoSesion, String dniFisio, String dniPaciente, Long idDispositivo) {
    	
        this.idSesion = idSesion;
        this.aceleracionesBruscas = aceleracionesBruscas;
        this.colisiones = colisiones;
        this.estabilidad = estabilidad;
        this.nivel = nivel;
        this.paradasBruscas = paradasBruscas;
        this.score = score;
        this.tiempoMovimiento = tiempoMovimiento;
        this.tiempoSesion = tiempoSesion;
        this.dniFisio = dniFisio;
        this.dniPaciente = dniPaciente;
        this.idDispositivo = idDispositivo;
        
    }

    public String getIdSesion() {
    	
        return idSesion;
    
    }

    public void setIdSesion(String idSesion) {
    
    	this.idSesion = idSesion;
    
    }

    public Integer getAceleracionesBruscas() {
    
    	return aceleracionesBruscas;
    
    }

    public void setAceleracionesBruscas(Integer aceleracionesBruscas) {
    
    	this.aceleracionesBruscas = aceleracionesBruscas;
    
    }

    public Integer getColisiones() {
    
    	return colisiones;
    
    }

    public void setColisiones(Integer colisiones) {
    
    	this.colisiones = colisiones;
    
    }

    public Integer getEstabilidad() {
    
    	return estabilidad;
    
    }

    public void setEstabilidad(Integer estabilidad) {
    
    	this.estabilidad = estabilidad;
    
    }

    public String getNivel() {
    
    	return nivel;
    
    }

    public void setNivel(String nivel) {
    
    	this.nivel = nivel;
    
    }

    public Integer getParadasBruscas() {
    
    	return paradasBruscas;
    
    }

    public void setParadasBruscas(Integer paradasBruscas) {
    
    	this.paradasBruscas = paradasBruscas;
    
    }

    public Integer getScore() {
     
    	return score;
    
    }

    public void setScore(Integer score) {
    
    	this.score = score;
    
    }

    public Integer getTiempoMovimiento() {
    
    	return tiempoMovimiento;
    
    }

    public void setTiempoMovimiento(Integer tiempoMovimiento) {
    
    	this.tiempoMovimiento = tiempoMovimiento;
    
    }

    public LocalDateTime getTiempoSesion() {
    
    	return tiempoSesion;
    
    }

    public void setTiempoSesion(LocalDateTime tiempoSesion) {
    
    	this.tiempoSesion = tiempoSesion;
    
    }

    public String getDniFisio() {
    
    	return dniFisio;
    
    }

    public void setDniFisio(String dniFisio) {
    
    	this.dniFisio = dniFisio;
    
    }

    public String getDniPaciente() {
    
    	return dniPaciente;
    
    }

    public void setDniPaciente(String dniPaciente) {
   
    	this.dniPaciente = dniPaciente;
    
    }

    public Long getIdDispositivo() {
    
    	return idDispositivo;
    
    }

    public void setIdDispositivo(Long idDispositivo) {
    
    	this.idDispositivo = idDispositivo;
    
    }

}