package com.fct.service;

import com.fct.dto.ContactoDto;
import com.fct.entity.Contacto;
import com.fct.entity.Empresa;
import com.fct.entity.Profesor;
import com.fct.repository.ContactoRepository;
import com.fct.repository.EmpresaRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class ContactoService {

    private final ContactoRepository contactoRepository;
    private final EmpresaRepository empresaRepository;

    @Transactional(readOnly = true)
    public Page<ContactoDto.Response> findAll(String search, String tipo, String resultado,
                                               Integer mes, Integer year, Pageable pageable) {
        Contacto.TipoContacto tipoEnum = null;
        if (tipo != null && !tipo.isBlank()) {
            try { tipoEnum = Contacto.TipoContacto.valueOf(tipo.toUpperCase()); }
            catch (IllegalArgumentException ignored) {}
        }
        Contacto.ResultadoContacto resultadoEnum = null;
        if (resultado != null && !resultado.isBlank()) {
            try { resultadoEnum = Contacto.ResultadoContacto.valueOf(resultado.toUpperCase()); }
            catch (IllegalArgumentException ignored) {}
        }
        String searchParam = (search != null && !search.isBlank()) ? search : null;

        java.time.LocalDate startDate = null;
        java.time.LocalDate endDate = null;
        if (year != null && mes != null) {
            startDate = java.time.LocalDate.of(year, mes, 1);
            endDate = startDate.withDayOfMonth(startDate.lengthOfMonth());
        } else if (year != null) {
            startDate = java.time.LocalDate.of(year, 1, 1);
            endDate = java.time.LocalDate.of(year, 12, 31);
        }

        return contactoRepository.findWithFilters(searchParam, tipoEnum, resultadoEnum, startDate, endDate, pageable)
                .map(ContactoDto.Response::from);
    }

    @Transactional(readOnly = true)
    public List<ContactoDto.Response> findByEmpresa(Long empresaId) {
        return contactoRepository.findByEmpresaIdOrderByFechaDesc(empresaId)
                .stream().map(ContactoDto.Response::from).toList();
    }

    @Transactional(readOnly = true)
    public ContactoDto.Response findById(Long id) {
        return contactoRepository.findById(id)
                .map(ContactoDto.Response::from)
                .orElseThrow(() -> new EntityNotFoundException("Contacto no encontrado: " + id));
    }

    public ContactoDto.Response create(ContactoDto.Request req, Profesor profesor) {
        Empresa empresa = empresaRepository.findById(req.getEmpresaId())
                .orElseThrow(() -> new EntityNotFoundException("Empresa no encontrada: " + req.getEmpresaId()));
        Contacto contacto = Contacto.builder()
                .empresa(empresa)
                .profesor(profesor)
                .fecha(req.getFecha())
                .tipo(req.getTipo())
                .motivo(req.getMotivo())
                .resultado(req.getResultado())
                .necesidades(req.getNecesidades())
                .proximaAccion(req.getProximaAccion())
                .build();
        return ContactoDto.Response.from(contactoRepository.save(contacto));
    }

    public ContactoDto.Response update(Long id, ContactoDto.Request req) {
        Contacto contacto = contactoRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Contacto no encontrado: " + id));
        contacto.setFecha(req.getFecha());
        contacto.setTipo(req.getTipo());
        contacto.setMotivo(req.getMotivo());
        contacto.setResultado(req.getResultado());
        contacto.setNecesidades(req.getNecesidades());
        contacto.setProximaAccion(req.getProximaAccion());
        return ContactoDto.Response.from(contactoRepository.save(contacto));
    }

    public ContactoDto.Response patchResultado(Long id, Contacto.ResultadoContacto resultado) {
        Contacto contacto = contactoRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Contacto no encontrado: " + id));
        contacto.setResultado(resultado);
        return ContactoDto.Response.from(contactoRepository.save(contacto));
    }

    public void delete(Long id) {
        if (!contactoRepository.existsById(id)) {
            throw new EntityNotFoundException("Contacto no encontrado: " + id);
        }
        contactoRepository.deleteById(id);
    }
}
