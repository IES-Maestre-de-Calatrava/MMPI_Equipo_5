package com.example.mmpi.controller;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.mmpi.dto.EventoDTO;
import com.example.mmpi.exception.EventoNotFoundException;
import com.example.mmpi.mapper.EventoMapper;
import com.example.mmpi.persistence.Evento;
import com.example.mmpi.repository.EventoRepository;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/evento")
@Validated
@CrossOrigin(origins = "*")
public class EventoController {

    private final EventoRepository repository;

    public EventoController(EventoRepository repository) {
    	
    	this.repository = repository;
    
    }

    @GetMapping("/find")
    public List<EventoDTO> getAllEventos() {

        List<EventoDTO> lista;

        lista = repository.findAll().stream().map(EventoMapper::toDTO).collect(Collectors.toList());

        return lista;
    
    }

    @GetMapping("/find/{id}")
    public ResponseEntity<EventoDTO> getEventoById(@PathVariable(value = "id") Long id)
    
    		throws EventoNotFoundException {

        EventoDTO evento;

        evento = repository.findById(id).map(EventoMapper::toDTO).orElseThrow(() -> new EventoNotFoundException(id));

        return ResponseEntity.ok().body(evento);
    
    }

    @PostMapping("/create")
    public EventoDTO createEvento(@Valid @RequestBody EventoDTO eventoDTO) {

        Evento evento;
        Evento eventoGuardado;
        EventoDTO respuesta;

        evento = EventoMapper.toEntity(eventoDTO);
        evento.setIdEvento(null);

        eventoGuardado = repository.save(evento);

        respuesta = EventoMapper.toDTO(eventoGuardado);

        return respuesta;
    
    }

    @PutMapping("/update/{id}")
    public ResponseEntity<EventoDTO> updateEvento(@Valid @RequestBody EventoDTO datos,
    
    		@PathVariable(value = "id") Long id) throws EventoNotFoundException {

        EventoDTO evento;

        evento = repository.findById(id).map(EventoMapper::toDTO).orElseThrow(() -> new EventoNotFoundException(id));

        if (datos.getDescripcion() != null) {
        	
            evento.setDescripcion(datos.getDescripcion());
        
        }

        if (datos.getTipoEvento() != null) {
        
        	evento.setTipoEvento(datos.getTipoEvento());
        
        }

        if (datos.getIdSesion() != null) {
        
        	evento.setIdSesion(datos.getIdSesion());
        
        }

        Evento eventoModificado;

        eventoModificado = repository.save(EventoMapper.toEntity(evento));

        return ResponseEntity.ok(EventoMapper.toDTO(eventoModificado));
    
    }

    @DeleteMapping("/delete/{id}")
    public Boolean deleteEvento(@PathVariable(value = "id") Long id)
    
    		throws EventoNotFoundException {

        EventoDTO evento;

        evento = repository.findById(id).map(EventoMapper::toDTO).orElseThrow(() -> new EventoNotFoundException(id));

        repository.delete(EventoMapper.toEntity(evento));

        return true;
    
    }

}