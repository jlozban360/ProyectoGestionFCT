package com.fct.service;

import com.fct.dto.EmpresaDto;
import com.fct.entity.Empresa;
import com.fct.repository.EmpresaRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional
public class EmpresaService {

    private final EmpresaRepository empresaRepository;

    @Transactional(readOnly = true)
    public Page<EmpresaDto.Response> findAll(String search, String sector, Pageable pageable) {
        return empresaRepository.findWithFilters(search, sector, pageable)
                .map(EmpresaDto.Response::from);
    }

    @Transactional(readOnly = true)
    public EmpresaDto.Response findById(Long id) {
        return empresaRepository.findById(id)
                .map(EmpresaDto.Response::from)
                .orElseThrow(() -> new EntityNotFoundException("Empresa no encontrada: " + id));
    }

    public EmpresaDto.Response create(EmpresaDto.Request req) {
        if (empresaRepository.findByCif(req.getCif()).isPresent()) {
            throw new IllegalArgumentException("Ya existe una empresa con el CIF: " + req.getCif());
        }
        Empresa empresa = mapToEntity(new Empresa(), req);
        return EmpresaDto.Response.from(empresaRepository.save(empresa));
    }

    public EmpresaDto.Response update(Long id, EmpresaDto.Request req) {
        Empresa empresa = empresaRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Empresa no encontrada: " + id));
        empresaRepository.findByCif(req.getCif())
                .filter(e -> !e.getId().equals(id))
                .ifPresent(e -> { throw new IllegalArgumentException("Ya existe otra empresa con el CIF: " + req.getCif()); });
        mapToEntity(empresa, req);
        return EmpresaDto.Response.from(empresaRepository.save(empresa));
    }

    public void delete(Long id) {
        if (!empresaRepository.existsById(id)) {
            throw new EntityNotFoundException("Empresa no encontrada: " + id);
        }
        empresaRepository.deleteById(id);
    }

    private Empresa mapToEntity(Empresa e, EmpresaDto.Request req) {
        e.setCif(req.getCif());
        e.setNombre(req.getNombre());
        e.setSector(req.getSector());
        e.setModalidad(req.getModalidad());
        e.setContactoPrincipal(req.getContactoPrincipal());
        e.setCargoContacto(req.getCargoContacto());
        e.setTelefono(req.getTelefono());
        e.setEmail(req.getEmail());
        e.setDireccion(req.getDireccion());
        e.setNumTrabajadores(req.getNumTrabajadores());
        e.setPerfilesSolicitados(req.getPerfilesSolicitados());
        e.setObservaciones(req.getObservaciones());
        e.setActiva(req.isActiva());
        return e;
    }
}
