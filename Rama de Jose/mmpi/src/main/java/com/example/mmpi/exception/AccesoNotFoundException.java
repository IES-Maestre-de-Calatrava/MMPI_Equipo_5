package com.example.mmpi.exception;

public class AccesoNotFoundException extends Exception {

    public AccesoNotFoundException(Long id) {
    	
        super("No se ha encontrado el acceso con id: " + id);
        
    }
    
}