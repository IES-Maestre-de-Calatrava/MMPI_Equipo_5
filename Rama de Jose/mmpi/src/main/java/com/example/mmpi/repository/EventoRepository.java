package com.example.mmpi.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.example.mmpi.persistence.Evento;

public interface EventoRepository extends JpaRepository<Evento, Long> {

}