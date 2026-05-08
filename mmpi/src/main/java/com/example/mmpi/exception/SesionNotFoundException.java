package com.example.mmpi.exception;

public class SesionNotFoundException extends Exception {

    public SesionNotFoundException(String id) {
    	        
    	super("No se ha encontrado la sesión con id: " + id);

    }

}