package com.example.mmpi.exception;

public class EventoNotFoundException extends Exception {

    public EventoNotFoundException(Long id) {
    	
    	super("No se ha encontrado el evento con id: " + id);
    
    }

}