package com.fct.controller;

import com.fct.dto.ProfesorDto;
import com.fct.entity.Profesor;
import com.fct.service.ProfesorService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/profesores")
@RequiredArgsConstructor
public class ProfesorController {

    private final ProfesorService profesorService;

    @GetMapping
    public ResponseEntity<List<ProfesorDto.Response>> findAll() {
        return ResponseEntity.ok(profesorService.findAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<ProfesorDto.Response> findById(@PathVariable Long id) {
        return ResponseEntity.ok(profesorService.findById(id));
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ProfesorDto.Response> create(@Valid @RequestBody ProfesorDto.Request req) {
        return ResponseEntity.status(HttpStatus.CREATED).body(profesorService.create(req));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ProfesorDto.Response> update(
            @PathVariable Long id,
            @Valid @RequestBody ProfesorDto.Request req,
            @AuthenticationPrincipal Profesor profesor
    ) {
        boolean isAdmin = profesor.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"));
        if (!isAdmin && !profesor.getId().equals(id)) {
            throw new AccessDeniedException("Solo puedes editar tu propio perfil");
        }
        return ResponseEntity.ok(profesorService.update(id, req));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        profesorService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
