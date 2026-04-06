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
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Stream;

@Service
@RequiredArgsConstructor
@Transactional
public class ContactoService {

    private final ContactoRepository contactoRepository;
    private final EmpresaRepository empresaRepository;

    @Transactional(readOnly = true)
    public Page<ContactoDto.Response> findAll(String search, String tipo, String resultado, Pageable pageable) {
        List<Contacto> all = contactoRepository.findAll();

        Stream<Contacto> stream = all.stream();

        if (search != null && !search.isBlank()) {
            String lc = search.toLowerCase();
            stream = stream.filter(c ->
                c.getEmpresa().getNombre().toLowerCase().contains(lc) ||
                c.getMotivo().toLowerCase().contains(lc));
        }
        if (tipo != null && !tipo.isBlank()) {
            try {
                Contacto.TipoContacto t = Contacto.TipoContacto.valueOf(tipo.toUpperCase());
                stream = stream.filter(c -> c.getTipo() == t);
            } catch (IllegalArgumentException ignored) {}
        }
        if (resultado != null && !resultado.isBlank()) {
            try {
                Contacto.ResultadoContacto r = Contacto.ResultadoContacto.valueOf(resultado.toUpperCase());
                stream = stream.filter(c -> c.getResultado() == r);
            } catch (IllegalArgumentException ignored) {}
        }

        List<ContactoDto.Response> filtered = stream
                .sorted((a, b) -> b.getFecha().compareTo(a.getFecha()))
                .map(ContactoDto.Response::from)
                .toList();

        int start = (int) pageable.getOffset();
        int end = Math.min(start + pageable.getPageSize(), filtered.size());
        List<ContactoDto.Response> pageContent = start < filtered.size()
                ? filtered.subList(start, end)
                : List.of();

        return new PageImpl<>(pageContent, pageable, filtered.size());
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

    public void delete(Long id) {
        if (!contactoRepository.existsById(id)) {
            throw new EntityNotFoundException("Contacto no encontrado: " + id);
        }
        contactoRepository.deleteById(id);
    }
}
