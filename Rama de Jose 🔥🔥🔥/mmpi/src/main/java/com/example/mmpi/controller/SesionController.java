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

import com.example.mmpi.dto.SesionDTO;
import com.example.mmpi.exception.SesionNotFoundException;
import com.example.mmpi.mapper.SesionMapper;
import com.example.mmpi.persistence.Sesion;
import com.example.mmpi.repository.SesionRepository;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/sesion")
@Validated
@CrossOrigin(origins = "*")
public class SesionController {

    private final SesionRepository repository;

    public SesionController(SesionRepository repository) {
    	    
    	this.repository = repository;
    
    }

    @GetMapping("/find")
    public List<SesionDTO> getAllSesiones() {

        List<SesionDTO> lista;

        lista = repository.findAll().stream().map(SesionMapper::toDTO).collect(Collectors.toList());

        return lista;
    
    }

    @GetMapping("/find/{id}")
    public ResponseEntity<SesionDTO> getSesionById(@PathVariable(value = "id") String id)
    
    		throws SesionNotFoundException {

        SesionDTO sesion;

        sesion = repository.findById(id).map(SesionMapper::toDTO).orElseThrow(() -> new SesionNotFoundException(id));

        return ResponseEntity.ok().body(sesion);
    
    }

    @PostMapping("/create")
    public SesionDTO createSesion(@Valid @RequestBody SesionDTO sesionDTO) {

        Sesion sesion;
        Sesion sesionGuardada;
        SesionDTO respuesta;

        sesion = SesionMapper.toEntity(sesionDTO);

        sesionGuardada = repository.save(sesion);

        respuesta = SesionMapper.toDTO(sesionGuardada);

        return respuesta;
    }

    @PutMapping("/update/{id}")
    public ResponseEntity<SesionDTO> updateSesion(@Valid @RequestBody SesionDTO datos,
    
    		@PathVariable(value = "id") String id) throws SesionNotFoundException {

        SesionDTO sesion;

        sesion = repository.findById(id).map(SesionMapper::toDTO).orElseThrow(() -> new SesionNotFoundException(id));

        if (datos.getAceleracionesBruscas() != null) {
        	
            sesion.setAceleracionesBruscas(datos.getAceleracionesBruscas());
        
        }

        if (datos.getColisiones() != null) {
        
        	sesion.setColisiones(datos.getColisiones());
        
        }

        if (datos.getEstabilidad() != null) {
        
        	sesion.setEstabilidad(datos.getEstabilidad());
        
        }

        if (datos.getNivel() != null) {
        
        	sesion.setNivel(datos.getNivel());
        
        }

        if (datos.getParadasBruscas() != null) {
        
        	sesion.setParadasBruscas(datos.getParadasBruscas());
        
        }

        if (datos.getScore() != null) {
        
        	sesion.setScore(datos.getScore());
        
        }

        if (datos.getTiempoMovimiento() != null) {
        
        	sesion.setTiempoMovimiento(datos.getTiempoMovimiento());
        
        }

        if (datos.getTiempoSesion() != null) {
        
        	sesion.setTiempoSesion(datos.getTiempoSesion());
        
        }

        if (datos.getDniFisio() != null) {
        
        	sesion.setDniFisio(datos.getDniFisio());
        
        }

        if (datos.getDniPaciente() != null) {
        
        	sesion.setDniPaciente(datos.getDniPaciente());
        
        }

        if (datos.getIdDispositivo() != null) {
        
        	sesion.setIdDispositivo(datos.getIdDispositivo());
        
        }

        Sesion sesionModificada;

        sesionModificada = repository.save(SesionMapper.toEntity(sesion));

        return ResponseEntity.ok(SesionMapper.toDTO(sesionModificada));
    
    }

    @DeleteMapping("/delete/{id}")
    public Boolean deleteSesion(@PathVariable(value = "id") String id)
    
    		throws SesionNotFoundException {

        SesionDTO sesion;

        sesion = repository.findById(id).map(SesionMapper::toDTO).orElseThrow(() -> new SesionNotFoundException(id));

        repository.delete(SesionMapper.toEntity(sesion));

        return true;
    
    }

}