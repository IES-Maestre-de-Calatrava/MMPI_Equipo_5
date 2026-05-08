package com.example.mmpi.persistence;

import java.time.LocalDateTime;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;

@Entity
@Table(name = "SESION", schema = "mmpi")
public class Sesion implements java.io.Serializable {

    @Id
    @Column(name = "ID_SESION")
    private String idSesion;

    @Column(name = "ACELERACIONES_BRUSCAS")
    private Integer aceleracionesBruscas;

    @Column(name = "COLISIONES")
    private Integer colisiones;

    @Column(name = "ESTABILIDAD")
    private Integer estabilidad;

    @Column(name = "NIVEL")
    private String nivel;

    @Column(name = "PARADAS_BRUSCAS")
    private Integer paradasBruscas;

    @Column(name = "SCORE")
    private Integer score;

    @Column(name = "TIEMPO_MOVIMIENTO")
    private Integer tiempoMovimiento;

    @Column(name = "TIEMPO_SESION")
    private LocalDateTime tiempoSesion;

    @ManyToOne
    @JoinColumn(name = "DNI_FISIO")
    private Fisioterapeuta fisioterapeuta;

    @ManyToOne
    @JoinColumn(name = "DNI_PACIENTE")
    private Paciente paciente;

    public Sesion() {
    	
    }

    public Sesion(String idSesion, Integer aceleracionesBruscas, Integer colisiones, Integer estabilidad, String nivel, Integer paradasBruscas, Integer score, Integer tiempoMovimiento,
LocalDateTime tiempoSesion, Fisioterapeuta fisioterapeuta, Paciente paciente) {
    	
        this.idSesion = idSesion;
        this.aceleracionesBruscas = aceleracionesBruscas;
        this.colisiones = colisiones;
        this.estabilidad = estabilidad;
        this.nivel = nivel;
        this.paradasBruscas = paradasBruscas;
        this.score = score;
        this.tiempoMovimiento = tiempoMovimiento;
        this.tiempoSesion = tiempoSesion;
        this.fisioterapeuta = fisioterapeuta;
        this.paciente = paciente;
    
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

    public Fisioterapeuta getFisioterapeuta() {
    
    	return fisioterapeuta;
    
    }

    public void setFisioterapeuta(Fisioterapeuta fisioterapeuta) {
    
    	this.fisioterapeuta = fisioterapeuta;
    
    }

    public Paciente getPaciente() {
    
    	return paciente;
    
    }

    public void setPaciente(Paciente paciente) {
    
    	this.paciente = paciente;
    
    }

}