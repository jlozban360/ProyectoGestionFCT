package com.fct.repository;

import com.fct.entity.Profesor;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface ProfesorRepository extends JpaRepository<Profesor, Long> {
    Optional<Profesor> findByEmail(String email);
    boolean existsByEmail(String email);
    long countByActivoTrue();
}
