package com.example.mmpi.exception;

public class DispositivoNotFoundException extends Exception {

    public DispositivoNotFoundException(Long id) {
    	
        super("No se ha encontrado el dispositivo con id: " + id);
        
    }
    
}