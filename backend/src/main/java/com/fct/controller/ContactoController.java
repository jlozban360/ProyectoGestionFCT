package com.fct.controller;

import com.fct.dto.ContactoDto;
import com.fct.entity.Profesor;
import com.fct.service.ContactoService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/contactos")
@RequiredArgsConstructor
public class ContactoController {

    private final ContactoService contactoService;

    @GetMapping
    public ResponseEntity<Page<ContactoDto.Response>> findAll(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String tipo,
            @RequestParam(required = false) String resultado,
            @RequestParam(required = false) Integer mes,
            @RequestParam(required = false) Integer year,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size
    ) {
        PageRequest pageable = PageRequest.of(page, size, Sort.by("fecha").descending());
        return ResponseEntity.ok(contactoService.findAll(search, tipo, resultado, mes, year, pageable));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ContactoDto.Response> findById(@PathVariable Long id) {
        return ResponseEntity.ok(contactoService.findById(id));
    }

    @PostMapping
    public ResponseEntity<ContactoDto.Response> create(
            @Valid @RequestBody ContactoDto.Request req,
            @AuthenticationPrincipal Profesor profesor
    ) {
        return ResponseEntity.status(HttpStatus.CREATED).body(contactoService.create(req, profesor));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ContactoDto.Response> update(
            @PathVariable Long id,
            @Valid @RequestBody ContactoDto.Request req
    ) {
        return ResponseEntity.ok(contactoService.update(id, req));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        contactoService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
