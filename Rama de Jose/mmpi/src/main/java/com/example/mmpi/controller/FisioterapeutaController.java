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

import com.example.mmpi.dto.FisioterapeutaDTO;
import com.example.mmpi.exception.FisioterapeutaNotFoundException;
import com.example.mmpi.mapper.FisioterapeutaMapper;
import com.example.mmpi.persistence.Fisioterapeuta;
import com.example.mmpi.repository.FisioterapeutaRepository;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/fisioterapeuta")
@Validated
@CrossOrigin(origins = "*")
public class FisioterapeutaController {

    private final FisioterapeutaRepository repository;

    public FisioterapeutaController(FisioterapeutaRepository repository) {
    	
        this.repository = repository;
    
    }

    @GetMapping("/find")
    public List<FisioterapeutaDTO> getAllFisioterapeutas() {

        List<FisioterapeutaDTO> lista;

        lista = repository.findAll().stream().map(FisioterapeutaMapper::toDTO).collect(Collectors.toList());

        return lista;
        
    }

    @GetMapping("/find/{dni}")
    public ResponseEntity<FisioterapeutaDTO> getFisioterapeutaByDni(@PathVariable(value = "dni") String dni)
    
            throws FisioterapeutaNotFoundException {

        FisioterapeutaDTO fisio;

        fisio = repository.findById(dni).map(FisioterapeutaMapper::toDTO).orElseThrow(() -> new FisioterapeutaNotFoundException(dni));

        return ResponseEntity.ok().body(fisio);
        
    }

    @PostMapping("/create")
    public FisioterapeutaDTO createFisioterapeuta(@Valid @RequestBody FisioterapeutaDTO fisioDTO) {

        Fisioterapeuta fisio;
        Fisioterapeuta fisioGuardado;
        FisioterapeutaDTO respuesta;

        fisio = FisioterapeutaMapper.toEntity(fisioDTO);

        fisioGuardado = repository.save(fisio);

        respuesta = FisioterapeutaMapper.toDTO(fisioGuardado);

        return respuesta;
        
    }

    @PutMapping("/update/{dni}")
    public ResponseEntity<FisioterapeutaDTO> updateFisioterapeuta(@Valid @RequestBody FisioterapeutaDTO datos,
    		
            @PathVariable(value = "dni") String dni) throws FisioterapeutaNotFoundException {

        FisioterapeutaDTO fisio;

        fisio = repository.findById(dni).map(FisioterapeutaMapper::toDTO).orElseThrow(() -> new FisioterapeutaNotFoundException(dni));

        if (datos.getNombre() != null) {
        	
            
        	fisio.setNombre(datos.getNombre());
        }

        if (datos.getApellidos() != null) {
            
        	fisio.setApellidos(datos.getApellidos());
        
        }

        if (datos.getDomicilio() != null) {
        
        	fisio.setDomicilio(datos.getDomicilio());
        
        }

        if (datos.getEmail() != null) {
        
        	fisio.setEmail(datos.getEmail());
        
        }

        if (datos.getTelefono() != null) {
        
        	fisio.setTelefono(datos.getTelefono());
        
        }

        if (datos.getIdAcceso() != null) {
        
        	fisio.setIdAcceso(datos.getIdAcceso());
        
        }

        Fisioterapeuta fisioModificado;

        fisioModificado = repository.save(FisioterapeutaMapper.toEntity(fisio));

        return ResponseEntity.ok(FisioterapeutaMapper.toDTO(fisioModificado));
    
    }

    @DeleteMapping("/delete/{dni}")
    public Boolean deleteFisioterapeuta(@PathVariable(value = "dni") String dni)
    
    		throws FisioterapeutaNotFoundException {

        FisioterapeutaDTO fisio;

        fisio = repository.findById(dni).map(FisioterapeutaMapper::toDTO).orElseThrow(() -> new FisioterapeutaNotFoundException(dni));

        repository.delete(FisioterapeutaMapper.toEntity(fisio));

        return true;
    
    }

}