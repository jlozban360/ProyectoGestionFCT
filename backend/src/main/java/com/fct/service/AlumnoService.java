package com.fct.service;

import com.fct.dto.AlumnoDto;
import com.fct.entity.Alumno;
import com.fct.entity.Empresa;
import com.fct.repository.AlumnoRepository;
import com.fct.repository.EmpresaRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class AlumnoService {

    private final AlumnoRepository alumnoRepository;
    private final EmpresaRepository empresaRepository;

    @Transactional(readOnly = true)
    public Page<AlumnoDto.Response> findAll(String search, String ciclo, Pageable pageable) {
        Page<Alumno> page;
        if (ciclo != null && !ciclo.isBlank()) {
            try {
                Alumno.CicloFormativo cicloEnum = Alumno.CicloFormativo.valueOf(ciclo.toUpperCase());
                // filter by search + ciclo in memory from a search-only page
                page = alumnoRepository.findBySearch(search, pageable);
                // apply ciclo filter post-fetch (simple approach for a school project)
                List<AlumnoDto.Response> filtered = page.getContent().stream()
                        .filter(a -> a.getCiclo() == cicloEnum)
                        .map(AlumnoDto.Response::from)
                        .toList();
                return new PageImpl<>(filtered, pageable, filtered.size());
            } catch (IllegalArgumentException e) {
                // unknown ciclo, ignore filter
            }
        }
        return alumnoRepository.findBySearch(search, pageable).map(AlumnoDto.Response::from);
    }

    @Transactional(readOnly = true)
    public List<AlumnoDto.Response> findByEmpresa(Long empresaId) {
        return alumnoRepository.findByEmpresaId(empresaId)
                .stream().map(AlumnoDto.Response::from).toList();
    }

    @Transactional(readOnly = true)
    public AlumnoDto.Response findById(Long id) {
        return alumnoRepository.findById(id)
                .map(AlumnoDto.Response::from)
                .orElseThrow(() -> new EntityNotFoundException("Alumno no encontrado: " + id));
    }

    public AlumnoDto.Response create(AlumnoDto.Request req) {
        Alumno alumno = Alumno.builder()
                .nombre(req.getNombre())
                .apellidos(req.getApellidos())
                .email(req.getEmail())
                .telefono(req.getTelefono())
                .ciclo(req.getCiclo())
                .curso(req.getCurso())
                .estado(req.getEstado() != null ? req.getEstado() : Alumno.EstadoAlumno.DISPONIBLE)
                .observaciones(req.getObservaciones())
                .build();
        return AlumnoDto.Response.from(alumnoRepository.save(alumno));
    }

    public AlumnoDto.Response update(Long id, AlumnoDto.Request req) {
        Alumno alumno = alumnoRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Alumno no encontrado: " + id));
        alumno.setNombre(req.getNombre());
        alumno.setApellidos(req.getApellidos());
        alumno.setEmail(req.getEmail());
        alumno.setTelefono(req.getTelefono());
        alumno.setCiclo(req.getCiclo());
        alumno.setCurso(req.getCurso());
        if (req.getEstado() != null) alumno.setEstado(req.getEstado());
        alumno.setObservaciones(req.getObservaciones());
        return AlumnoDto.Response.from(alumnoRepository.save(alumno));
    }

    public AlumnoDto.Response asignarEmpresa(Long alumnoId, AlumnoDto.AsignarRequest req) {
        Alumno alumno = alumnoRepository.findById(alumnoId)
                .orElseThrow(() -> new EntityNotFoundException("Alumno no encontrado: " + alumnoId));
        if (req.getEmpresaId() != null) {
            Empresa empresa = empresaRepository.findById(req.getEmpresaId())
                    .orElseThrow(() -> new EntityNotFoundException("Empresa no encontrada: " + req.getEmpresaId()));
            alumno.setEmpresa(empresa);
        } else {
            alumno.setEmpresa(null);
        }
        if (req.getEstado() != null) alumno.setEstado(req.getEstado());
        return AlumnoDto.Response.from(alumnoRepository.save(alumno));
    }

    public void delete(Long id) {
        if (!alumnoRepository.existsById(id)) {
            throw new EntityNotFoundException("Alumno no encontrado: " + id);
        }
        alumnoRepository.deleteById(id);
    }
}
