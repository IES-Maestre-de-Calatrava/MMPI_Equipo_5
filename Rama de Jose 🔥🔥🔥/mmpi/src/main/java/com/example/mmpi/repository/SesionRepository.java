package com.example.mmpi.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.example.mmpi.persistence.Sesion;

public interface SesionRepository extends JpaRepository<Sesion, String> {

}