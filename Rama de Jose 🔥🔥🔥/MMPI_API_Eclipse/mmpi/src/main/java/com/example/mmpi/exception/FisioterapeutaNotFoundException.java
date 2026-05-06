package com.example.mmpi.exception;

public class FisioterapeutaNotFoundException extends Exception {

    public FisioterapeutaNotFoundException(String dni) {
    	
        super("No se ha encontrado el fisioterapeuta con DNI: " + dni);
        
    }
    
}