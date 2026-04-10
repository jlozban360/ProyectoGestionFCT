package com.fct.service;

import com.fct.dto.ProfesorDto;
import com.fct.entity.Profesor;
import com.fct.repository.ContactoRepository;
import com.fct.repository.ProfesorRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class ProfesorService {

    private final ProfesorRepository profesorRepository;
    private final ContactoRepository contactoRepository;
    private final PasswordEncoder passwordEncoder;

    @Transactional(readOnly = true)
    public List<ProfesorDto.Response> findAll() {
        return profesorRepository.findAll().stream()
                .map(p -> ProfesorDto.Response.from(p, contactoRepository.countByProfesorId(p.getId())))
                .toList();
    }

    @Transactional(readOnly = true)
    public ProfesorDto.Response findById(Long id) {
        return profesorRepository.findById(id)
                .map(ProfesorDto.Response::from)
                .orElseThrow(() -> new EntityNotFoundException("Profesor no encontrado: " + id));
    }

    public ProfesorDto.Response create(ProfesorDto.Request req) {
        if (profesorRepository.existsByEmail(req.getEmail())) {
            throw new IllegalArgumentException("Ya existe un profesor con el email: " + req.getEmail());
        }
        Profesor profesor = Profesor.builder()
                .nombre(req.getNombre())
                .email(req.getEmail())
                .password(passwordEncoder.encode(req.getPassword()))
                .telefono(req.getTelefono())
                .rol(req.getRol() != null ? req.getRol() : Profesor.Rol.COLABORADOR)
                .activo(req.isActivo())
                .build();
        return ProfesorDto.Response.from(profesorRepository.save(profesor));
    }

    public ProfesorDto.Response update(Long id, ProfesorDto.Request req) {
        Profesor profesor = profesorRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Profesor no encontrado: " + id));
        profesor.setNombre(req.getNombre());
        profesor.setTelefono(req.getTelefono());
        if (req.getEmail() != null && !req.getEmail().equals(profesor.getEmail())) {
            if (profesorRepository.existsByEmail(req.getEmail())) {
                throw new IllegalArgumentException("Ya existe un profesor con el email: " + req.getEmail());
            }
            profesor.setEmail(req.getEmail());
        }
        if (req.getRol() != null) profesor.setRol(req.getRol());
        profesor.setActivo(req.isActivo());
        if (req.getPassword() != null && !req.getPassword().isBlank()) {
            profesor.setPassword(passwordEncoder.encode(req.getPassword()));
        }
        if (req.getTema() != null) profesor.setTema(req.getTema());
        return ProfesorDto.Response.from(profesorRepository.save(profesor));
    }

    public void delete(Long id) {
        if (!profesorRepository.existsById(id)) {
            throw new EntityNotFoundException("Profesor no encontrado: " + id);
        }
        profesorRepository.deleteById(id);
    }
}
