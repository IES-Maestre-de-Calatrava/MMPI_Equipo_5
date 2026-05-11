package com.example.mmpi.persistence;

import java.time.LocalDateTime;
import jakarta.persistence.*;

@Entity
@Table(name = "SESION", schema = "mmpi")
public class Sesion implements java.io.Serializable {

    @Id
    @Column(name = "ID_SESION")
    private String idSesion;

    @Column(name = "NOMBRE_PACIENTE")
    private String nombrePaciente;

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

    // FULL timestamp (NOT just time)
    @Column(name = "TIEMPO_SESION")
    private LocalDateTime tiempoSesion;

    @Column(name = "AÑO_SESION")
    private Integer anioSesion;

    @Column(name = "MES_SESION")
    private Integer mesSesion;

    @Column(name = "DIA_SESION")
    private Integer diaSesion;

    @ManyToOne
    @JoinColumn(name = "DNI_FISIO")
    private Fisioterapeuta fisioterapeuta;

    @ManyToOne
    @JoinColumn(name = "DNI_PACIENTE")
    private Paciente paciente;

    // getters & setters

    public String getIdSesion() { return idSesion; }
    public void setIdSesion(String idSesion) { this.idSesion = idSesion; }

    public String getNombrePaciente() { return nombrePaciente; }
    public void setNombrePaciente(String nombrePaciente) { this.nombrePaciente = nombrePaciente; }

    public Integer getAceleracionesBruscas() { return aceleracionesBruscas; }
    public void setAceleracionesBruscas(Integer v) { this.aceleracionesBruscas = v; }

    public Integer getColisiones() { return colisiones; }
    public void setColisiones(Integer v) { this.colisiones = v; }

    public Integer getEstabilidad() { return estabilidad; }
    public void setEstabilidad(Integer v) { this.estabilidad = v; }

    public String getNivel() { return nivel; }
    public void setNivel(String nivel) { this.nivel = nivel; }

    public Integer getParadasBruscas() { return paradasBruscas; }
    public void setParadasBruscas(Integer v) { this.paradasBruscas = v; }

    public Integer getScore() { return score; }
    public void setScore(Integer v) { this.score = v; }

    public Integer getTiempoMovimiento() { return tiempoMovimiento; }
    public void setTiempoMovimiento(Integer v) { this.tiempoMovimiento = v; }

    public LocalDateTime getTiempoSesion() { return tiempoSesion; }
    public void setTiempoSesion(LocalDateTime v) { this.tiempoSesion = v; }

    public Integer getAnioSesion() { return anioSesion; }
    public void setAnioSesion(Integer v) { this.anioSesion = v; }

    public Integer getMesSesion() { return mesSesion; }
    public void setMesSesion(Integer v) { this.mesSesion = v; }

    public Integer getDiaSesion() { return diaSesion; }
    public void setDiaSesion(Integer v) { this.diaSesion = v; }

    public Fisioterapeuta getFisioterapeuta() { return fisioterapeuta; }
    public void setFisioterapeuta(Fisioterapeuta f) { this.fisioterapeuta = f; }

    public Paciente getPaciente() { return paciente; }
    public void setPaciente(Paciente p) { this.paciente = p; }
}