package com.fct.controller;

import com.fct.dto.AlumnoDto;
import com.fct.service.AlumnoService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/alumnos")
@RequiredArgsConstructor
public class AlumnoController {

    private final AlumnoService alumnoService;

    @GetMapping
    public ResponseEntity<Page<AlumnoDto.Response>> findAll(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String ciclo,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size
    ) {
        PageRequest pageable = PageRequest.of(page, size, Sort.by("apellidos").ascending());
        return ResponseEntity.ok(alumnoService.findAll(search, ciclo, pageable));
    }

    @GetMapping("/{id}")
    public ResponseEntity<AlumnoDto.Response> findById(@PathVariable Long id) {
        return ResponseEntity.ok(alumnoService.findById(id));
    }

    @PostMapping
    public ResponseEntity<AlumnoDto.Response> create(@Valid @RequestBody AlumnoDto.Request req) {
        return ResponseEntity.status(HttpStatus.CREATED).body(alumnoService.create(req));
    }

    @PutMapping("/{id}")
    public ResponseEntity<AlumnoDto.Response> update(
            @PathVariable Long id,
            @Valid @RequestBody AlumnoDto.Request req
    ) {
        return ResponseEntity.ok(alumnoService.update(id, req));
    }

    @PostMapping("/{id}/asignar")
    public ResponseEntity<AlumnoDto.Response> asignar(
            @PathVariable Long id,
            @RequestBody AlumnoDto.AsignarRequest req
    ) {
        return ResponseEntity.ok(alumnoService.asignarEmpresa(id, req));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        alumnoService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
