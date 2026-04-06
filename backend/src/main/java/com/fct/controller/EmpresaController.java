package com.fct.controller;

import com.fct.dto.AlumnoDto;
import com.fct.dto.ContactoDto;
import com.fct.dto.EmpresaDto;
import com.fct.service.AlumnoService;
import com.fct.service.ContactoService;
import com.fct.service.EmpresaService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/empresas")
@RequiredArgsConstructor
public class EmpresaController {

    private final EmpresaService empresaService;
    private final ContactoService contactoService;
    private final AlumnoService alumnoService;

    @GetMapping
    public ResponseEntity<Page<EmpresaDto.Response>> findAll(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String sector,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        PageRequest pageable = PageRequest.of(page, size, Sort.by("nombre").ascending());
        return ResponseEntity.ok(empresaService.findAll(search, sector, pageable));
    }

    @GetMapping("/{id}")
    public ResponseEntity<EmpresaDto.Response> findById(@PathVariable Long id) {
        return ResponseEntity.ok(empresaService.findById(id));
    }

    @PostMapping
    public ResponseEntity<EmpresaDto.Response> create(@Valid @RequestBody EmpresaDto.Request req) {
        return ResponseEntity.status(HttpStatus.CREATED).body(empresaService.create(req));
    }

    @PutMapping("/{id}")
    public ResponseEntity<EmpresaDto.Response> update(
            @PathVariable Long id,
            @Valid @RequestBody EmpresaDto.Request req
    ) {
        return ResponseEntity.ok(empresaService.update(id, req));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        empresaService.delete(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/{id}/contactos")
    public ResponseEntity<List<ContactoDto.Response>> getContactos(@PathVariable Long id) {
        return ResponseEntity.ok(contactoService.findByEmpresa(id));
    }

    @GetMapping("/{id}/alumnos")
    public ResponseEntity<List<AlumnoDto.Response>> getAlumnos(@PathVariable Long id) {
        return ResponseEntity.ok(alumnoService.findByEmpresa(id));
    }
}
