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

import com.example.mmpi.dto.AccesoDTO;
import com.example.mmpi.exception.AccesoNotFoundException;
import com.example.mmpi.mapper.AccesoMapper;
import com.example.mmpi.persistence.Acceso;
import com.example.mmpi.repository.AccesoRepository;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/acceso")
@Validated
@CrossOrigin(origins = "*")
public class AccesoController {

    private final AccesoRepository repository;

    public AccesoController(AccesoRepository repository) {
    	
        this.repository = repository;
        
    }

    @GetMapping("/find")
    public List<AccesoDTO> getAllAccesos() {

        List<AccesoDTO> listaAccesos;

        listaAccesos = repository.findAll()
                .stream()
                .map(AccesoMapper::toDTO)
                .collect(Collectors.toList());

        return listaAccesos;
        
    }

    @GetMapping("/find/{id}")
    public ResponseEntity<AccesoDTO> getAccesoById(@PathVariable(value = "id") Long accesoId)
    
            throws AccesoNotFoundException {

        AccesoDTO acceso;

        acceso = repository.findById(accesoId).map(AccesoMapper::toDTO).orElseThrow(() -> new AccesoNotFoundException(accesoId));

        return ResponseEntity.ok().body(acceso);
        
    }

    @PostMapping("/create")
    public AccesoDTO createAcceso(@Valid @RequestBody AccesoDTO accesoDTO) {

        Acceso acceso;
        Acceso accesoGuardado;
        AccesoDTO accesoRespuesta;

        acceso = AccesoMapper.toEntity(accesoDTO);
        acceso.setIdAcceso(null);

        accesoGuardado = repository.save(acceso);

        accesoRespuesta = AccesoMapper.toDTO(accesoGuardado);

        return accesoRespuesta;
        
    }

    @PutMapping("/update/{id}")
    public ResponseEntity<AccesoDTO> updateAcceso(@Valid @RequestBody AccesoDTO datosAcceso,
    		
            @PathVariable(value = "id") Long accesoId) throws AccesoNotFoundException {

        AccesoDTO acceso;

        acceso = repository.findById(accesoId)
                .map(AccesoMapper::toDTO)
                .orElseThrow(() -> new AccesoNotFoundException(accesoId));

        if (datosAcceso.getUsuario() != null) {
        	
            acceso.setUsuario(datosAcceso.getUsuario());
            
        }

        if (datosAcceso.getContrasena() != null) {
        	
            acceso.setContrasena(datosAcceso.getContrasena());
            
        }

        Acceso accesoModificado;

        accesoModificado = repository.save(AccesoMapper.toEntity(acceso));

        return ResponseEntity.ok(AccesoMapper.toDTO(accesoModificado));
        
    }

    @DeleteMapping("/delete/{id}")
    
    public Boolean deleteAcceso(@PathVariable(value = "id") Long accesoId) throws AccesoNotFoundException {

        AccesoDTO acceso;

        acceso = repository.findById(accesoId)
                .map(AccesoMapper::toDTO)
                .orElseThrow(() -> new AccesoNotFoundException(accesoId));

        repository.delete(AccesoMapper.toEntity(acceso));

        return true;
        
    }
    
}