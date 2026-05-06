package com.example.mmpi.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.example.mmpi.persistence.Dispositivo;

public interface DispositivoRepository extends JpaRepository<Dispositivo, Long> {

}