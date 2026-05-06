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

import com.example.mmpi.dto.DispositivoDTO;
import com.example.mmpi.exception.DispositivoNotFoundException;
import com.example.mmpi.mapper.DispositivoMapper;
import com.example.mmpi.persistence.Dispositivo;
import com.example.mmpi.repository.DispositivoRepository;

@RestController
@RequestMapping("/dispositivo")
@Validated
@CrossOrigin(origins = "*")
public class DispositivoController {

    private final DispositivoRepository repository;

    public DispositivoController(DispositivoRepository repository) {
    	
        this.repository = repository;
        
    }

    @GetMapping("/find")
    public List<DispositivoDTO> getAllDispositivos() {

        List<DispositivoDTO> listaDispositivos;

        listaDispositivos = repository.findAll()
                .stream()
                .map(DispositivoMapper::toDTO)
                .collect(Collectors.toList());

        return listaDispositivos;
 
    }

    @GetMapping("/find/{id}")
    public ResponseEntity<DispositivoDTO> getDispositivoById(@PathVariable(value = "id") Long dispositivoId)
    
            throws DispositivoNotFoundException {

        DispositivoDTO dispositivo;

        dispositivo = repository.findById(dispositivoId).map(DispositivoMapper::toDTO).orElseThrow(() -> new DispositivoNotFoundException(dispositivoId));

        return ResponseEntity.ok().body(dispositivo);
    }

    @PostMapping("/create")
    public DispositivoDTO createDispositivo(@RequestBody(required = false) DispositivoDTO dispositivoDTO) {

        Dispositivo dispositivo;
        Dispositivo dispositivoGuardado;
        DispositivoDTO dispositivoRespuesta;

        dispositivo = new Dispositivo();

        dispositivoGuardado = repository.save(dispositivo);

        dispositivoRespuesta = DispositivoMapper.toDTO(dispositivoGuardado);

        return dispositivoRespuesta;
        
    }

    @PutMapping("/update/{id}")
    public ResponseEntity<DispositivoDTO> updateDispositivo(@RequestBody DispositivoDTO datosDispositivo,
    		
            @PathVariable(value = "id") Long dispositivoId) throws DispositivoNotFoundException {

        DispositivoDTO dispositivo;

        dispositivo = repository.findById(dispositivoId)
                .map(DispositivoMapper::toDTO)
                .orElseThrow(() -> new DispositivoNotFoundException(dispositivoId));

        Dispositivo dispositivoModificado;

        dispositivoModificado = repository.save(DispositivoMapper.toEntity(dispositivo));

        return ResponseEntity.ok(DispositivoMapper.toDTO(dispositivoModificado));
    }

    @DeleteMapping("/delete/{id}")
    public Boolean deleteDispositivo(@PathVariable(value = "id") Long dispositivoId)
    
            throws DispositivoNotFoundException {

        DispositivoDTO dispositivo;

        dispositivo = repository.findById(dispositivoId).map(DispositivoMapper::toDTO).orElseThrow(() -> new DispositivoNotFoundException(dispositivoId));

        repository.delete(DispositivoMapper.toEntity(dispositivo));

        return true;
        
    }
    
}