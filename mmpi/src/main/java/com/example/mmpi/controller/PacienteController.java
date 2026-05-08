package com.example.mmpi.controller;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.transaction.annotation.Transactional;
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
import org.springframework.web.server.ResponseStatusException;

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
    private final JdbcTemplate jdbcTemplate;

    public PacienteController(PacienteRepository repository, JdbcTemplate jdbcTemplate) {

        this.repository = repository;
        this.jdbcTemplate = jdbcTemplate;

    }

    @GetMapping("/find")
    public List<PacienteDTO> getAllPacientes() {

        List<PacienteDTO> lista;

        lista = repository.findAll()
                .stream()
                .map(PacienteMapper::toDTO)
                .collect(Collectors.toList());

        return lista;

    }

    @GetMapping("/find/{dni}")
    public ResponseEntity<PacienteDTO> getPacienteByDni(@PathVariable(value = "dni") String dni)
            throws PacienteNotFoundException {

        PacienteDTO paciente;

        paciente = repository.findById(dni)
                .map(PacienteMapper::toDTO)
                .orElseThrow(() -> new PacienteNotFoundException(dni));

        return ResponseEntity.ok().body(paciente);

    }

    @PostMapping("/create")
    public PacienteDTO createPaciente(@Valid @RequestBody PacienteDTO pacienteDTO) {

        Paciente paciente;
        Paciente pacienteGuardado;
        PacienteDTO respuesta;

        paciente = PacienteMapper.toEntity(pacienteDTO);

        pacienteGuardado = repository.saveAndFlush(paciente);

        respuesta = PacienteMapper.toDTO(pacienteGuardado);

        return respuesta;

    }

    @PutMapping("/update/{dni}")
    @Transactional
    public ResponseEntity<PacienteDTO> updatePaciente(
            @Valid @RequestBody PacienteDTO datos,
            @PathVariable(value = "dni") String dni) throws PacienteNotFoundException {

        Paciente pacienteOriginal;

        pacienteOriginal = repository.findById(dni)
                .orElseThrow(() -> new PacienteNotFoundException(dni));

        PacienteDTO pacienteDTO;

        pacienteDTO = PacienteMapper.toDTO(pacienteOriginal);

        if (datos.getNombre() != null) {

            pacienteDTO.setNombre(datos.getNombre());

        }

        if (datos.getApellidos() != null) {

            pacienteDTO.setApellidos(datos.getApellidos());

        }

        if (datos.getDomicilio() != null) {

            pacienteDTO.setDomicilio(datos.getDomicilio());

        }

        if (datos.getEmail() != null) {

            pacienteDTO.setEmail(datos.getEmail());

        }

        if (datos.getTelefono() != null) {

            pacienteDTO.setTelefono(datos.getTelefono());

        }

        if (datos.getEdad() != null) {

            pacienteDTO.setEdad(datos.getEdad());

        }

        if (datos.getLocalidad() != null) {

            pacienteDTO.setLocalidad(datos.getLocalidad());

        }

        if (datos.getDatosCompletos() != null) {

            pacienteDTO.setDatosCompletos(datos.getDatosCompletos());

        }

        if (datos.getDniFisio() != null) {

            pacienteDTO.setDniFisio(datos.getDniFisio());

        }

        String nuevoDni;

        nuevoDni = datos.getDniPaciente();

        if (nuevoDni == null || nuevoDni.trim().equals("")) {

            nuevoDni = dni;

        }

        nuevoDni = nuevoDni.trim();

        if (!nuevoDni.equals(dni) && repository.existsById(nuevoDni)) {

            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "Ya existe un paciente con el DNI: " + nuevoDni
            );

        }

        Paciente pacienteGuardado;

        if (!nuevoDni.equals(dni)) {

            pacienteDTO.setDniPaciente(nuevoDni);

            Paciente pacienteNuevo;

            pacienteNuevo = PacienteMapper.toEntity(pacienteDTO);

            /*
             * saveAndFlush es importante:
             * fuerza a MySQL a guardar el paciente nuevo antes de cambiar
             * las sesiones desde AUTO_DIEGO al DNI real.
             */
            pacienteGuardado = repository.saveAndFlush(pacienteNuevo);

            jdbcTemplate.update(
                    "UPDATE SESION SET DNI_PACIENTE = ? WHERE DNI_PACIENTE = ?",
                    nuevoDni,
                    dni
            );

            repository.deleteById(dni);

        } else {

            pacienteDTO.setDniPaciente(dni);

            Paciente pacienteModificado;

            pacienteModificado = PacienteMapper.toEntity(pacienteDTO);

            pacienteGuardado = repository.saveAndFlush(pacienteModificado);

        }

        return ResponseEntity.ok(PacienteMapper.toDTO(pacienteGuardado));

    }

    @DeleteMapping("/delete/{dni}")
    public Boolean deletePaciente(@PathVariable(value = "dni") String dni)
            throws PacienteNotFoundException {

        PacienteDTO paciente;

        paciente = repository.findById(dni)
                .map(PacienteMapper::toDTO)
                .orElseThrow(() -> new PacienteNotFoundException(dni));

        repository.delete(PacienteMapper.toEntity(paciente));

        return true;

    }

}