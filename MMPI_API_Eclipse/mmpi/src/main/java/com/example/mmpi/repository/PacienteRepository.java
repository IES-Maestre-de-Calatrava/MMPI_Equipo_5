package com.example.mmpi.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.example.mmpi.persistence.Paciente;

public interface PacienteRepository extends JpaRepository<Paciente, String> {

}