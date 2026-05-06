package com.example.mmpi.exception;

public class PacienteNotFoundException extends Exception {

    public PacienteNotFoundException(String dni) {
    	
        
    	super("No se ha encontrado el paciente con DNI: " + dni);
    
    }

}