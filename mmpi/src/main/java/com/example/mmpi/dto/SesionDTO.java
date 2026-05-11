package com.example.mmpi.dto;

import java.time.LocalDateTime;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public class SesionDTO {

    @NotBlank
    @Size(max = 20)
    private String idSesion;

    private Integer aceleracionesBruscas;
    private Integer colisiones;
    private Integer estabilidad;
    private String nivel;
    private Integer paradasBruscas;
    private Integer score;
    private Integer tiempoMovimiento;

    private LocalDateTime tiempoSesion;

    private Integer anioSesion;
    private Integer mesSesion;
    private Integer diaSesion;

    private String dniFisio;
    private String dniPaciente;
    private Long idDispositivo;

    // getters & setters

    public String getIdSesion() { return idSesion; }
    public void setIdSesion(String idSesion) { this.idSesion = idSesion; }

    public Integer getAceleracionesBruscas() { return aceleracionesBruscas; }
    public void setAceleracionesBruscas(Integer v) { this.aceleracionesBruscas = v; }

    public Integer getColisiones() { return colisiones; }
    public void setColisiones(Integer v) { this.colisiones = v; }

    public Integer getEstabilidad() { return estabilidad; }
    public void setEstabilidad(Integer v) { this.estabilidad = v; }

    public String getNivel() { return nivel; }
    public void setNivel(String v) { this.nivel = v; }

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

    public String getDniFisio() { return dniFisio; }
    public void setDniFisio(String v) { this.dniFisio = v; }

    public String getDniPaciente() { return dniPaciente; }
    public void setDniPaciente(String v) { this.dniPaciente = v; }

    public Long getIdDispositivo() { return idDispositivo; }
    public void setIdDispositivo(Long v) { this.idDispositivo = v; }
}