package com.example.mmpi.dto;

public class PacienteDTO {

    private String dniPaciente;
    private String nombre;
    private String apellidos;
    private String domicilio;
    private String email;
    private Integer telefono;
    private Integer edad;
    private String localidad;
    private Integer datosCompletos;
    private String dniFisio;

    public PacienteDTO() {

    }

    public PacienteDTO(String dniPaciente, String nombre, String apellidos, String domicilio, String email, Integer telefono, Integer edad, String localidad, Integer datosCompletos, String dniFisio) {

        this.dniPaciente = dniPaciente;
        this.nombre = nombre;
        this.apellidos = apellidos;
        this.domicilio = domicilio;
        this.email = email;
        this.telefono = telefono;
        this.edad = edad;
        this.localidad = localidad;
        this.datosCompletos = datosCompletos;
        this.dniFisio = dniFisio;

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

    public Integer getEdad() {

        return edad;

    }

    public void setEdad(Integer edad) {

        this.edad = edad;

    }

    public String getLocalidad() {

        return localidad;

    }

    public void setLocalidad(String localidad) {

        this.localidad = localidad;

    }

    public Integer getDatosCompletos() {

        return datosCompletos;

    }

    public void setDatosCompletos(Integer datosCompletos) {

        this.datosCompletos = datosCompletos;

    }

    public String getDniFisio() {

        return dniFisio;

    }

    public void setDniFisio(String dniFisio) {

        this.dniFisio = dniFisio;

    }

}