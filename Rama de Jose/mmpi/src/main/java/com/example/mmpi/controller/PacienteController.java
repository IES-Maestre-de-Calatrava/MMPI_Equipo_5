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

import com.example.mmpi.dto.PacienteDTO;
import com.example.mmpi.exception.PacienteNotFoundException;
import com.example.mmpi.mapper.PacienteMapper;
import com.example.mmpi.persistence.Paciente;
import com.example.mmpi.repository.PacienteRepository;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/paciente")
@Validated
@CrossOrigin(origins = "*")
public class PacienteController {

    private final PacienteRepository repository;

    public PacienteController(PacienteRepository repository) {
    	
    	this.repository = repository;
    
    }

    @GetMapping("/find")
    public List<PacienteDTO> getAllPacientes() {

        List<PacienteDTO> lista;

        lista = repository.findAll().stream().map(PacienteMapper::toDTO).collect(Collectors.toList());

        
        return lista;
    }

    @GetMapping("/find/{dni}")
    public ResponseEntity<PacienteDTO> getPacienteByDni(@PathVariable(value = "dni") String dni)
        
    		throws PacienteNotFoundException {

        PacienteDTO paciente;

        paciente = repository.findById(dni).map(PacienteMapper::toDTO).orElseThrow(() -> new PacienteNotFoundException(dni));

        return ResponseEntity.ok().body(paciente);
    
    }

    @PostMapping("/create")
    public PacienteDTO createPaciente(@Valid @RequestBody PacienteDTO pacienteDTO) {

        Paciente paciente;
        Paciente pacienteGuardado;
        PacienteDTO respuesta;

        paciente = PacienteMapper.toEntity(pacienteDTO);

        pacienteGuardado = repository.save(paciente);

        respuesta = PacienteMapper.toDTO(pacienteGuardado);

        return respuesta;
    
    }

    @PutMapping("/update/{dni}")
    public ResponseEntity<PacienteDTO> updatePaciente(@Valid @RequestBody PacienteDTO datos,
    
    		@PathVariable(value = "dni") String dni) throws PacienteNotFoundException {

        PacienteDTO paciente;

        paciente = repository.findById(dni).map(PacienteMapper::toDTO).orElseThrow(() -> new PacienteNotFoundException(dni));

        if (datos.getNombre() != null) {
        	
            paciente.setNombre(datos.getNombre());
        
        }

        if (datos.getApellidos() != null) {
        
        	paciente.setApellidos(datos.getApellidos());
        
        }

        if (datos.getDomicilio() != null) {
        
        	paciente.setDomicilio(datos.getDomicilio());
        
        }

        if (datos.getEmail() != null) {
        
        	paciente.setEmail(datos.getEmail());
        
        }

        if (datos.getTelefono() != null) {
        
        	paciente.setTelefono(datos.getTelefono());
        
        }

        if (datos.getDniFisio() != null) {
        
        	paciente.setDniFisio(datos.getDniFisio());
        
        }

        Paciente pacienteModificado;

        pacienteModificado = repository.save(PacienteMapper.toEntity(paciente));

        return ResponseEntity.ok(PacienteMapper.toDTO(pacienteModificado));
    
    }

    @DeleteMapping("/delete/{dni}")
    public Boolean deletePaciente(@PathVariable(value = "dni") String dni)
    
    		throws PacienteNotFoundException {

        PacienteDTO paciente;

        paciente = repository.findById(dni).map(PacienteMapper::toDTO).orElseThrow(() -> new PacienteNotFoundException(dni));

        repository.delete(PacienteMapper.toEntity(paciente));

        return true;
        
    }
    
}