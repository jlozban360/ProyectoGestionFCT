package com.fct.controller;

import com.fct.entity.Alumno;
import com.fct.repository.AlumnoRepository;
import com.fct.repository.ContactoRepository;
import com.fct.repository.EmpresaRepository;
import com.fct.repository.ProfesorRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDate;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/dashboard")
@RequiredArgsConstructor
public class DashboardController {

    private final EmpresaRepository empresaRepository;
    private final ContactoRepository contactoRepository;
    private final AlumnoRepository alumnoRepository;
    private final ProfesorRepository profesorRepository;

    @GetMapping("/stats")
    public ResponseEntity<Map<String, Object>> getStats() {
        LocalDate now = LocalDate.now();
        LocalDate startOfMonth = now.withDayOfMonth(1);

        Map<String, Object> stats = new HashMap<>();
        stats.put("empresasActivas", empresaRepository.countByActivaTrue());
        stats.put("contactadosMes", contactoRepository.countByFechaBetween(startOfMonth, now));
        stats.put("alumnosDisponibles", alumnoRepository.countByEstado(Alumno.EstadoAlumno.DISPONIBLE));
        stats.put("profesoresActivos", profesorRepository.countByActivoTrue());
        return ResponseEntity.ok(stats);
    }

    @GetMapping("/contactos-mes")
    public ResponseEntity<List<Map<String, Object>>> getContactosPorMes(
            @RequestParam(required = false) Integer year) {
        String[] meses = {"Ene","Feb","Mar","Abr","May","Jun","Jul","Ago","Sep","Oct","Nov","Dic"};
        int targetYear = (year != null) ? year : LocalDate.now().getYear();
        List<Object[]> raw = contactoRepository.findContactosPorMes(targetYear);
        Map<Integer, Long> byMonth = new HashMap<>();
        for (Object[] row : raw) {
            byMonth.put(((Number) row[0]).intValue(), ((Number) row[1]).longValue());
        }
        List<Map<String, Object>> result = new java.util.ArrayList<>();
        for (int m = 1; m <= 12; m++) {
            Map<String, Object> entry = new HashMap<>();
            entry.put("mes", meses[m - 1]);
            entry.put("contactos", byMonth.getOrDefault(m, 0L));
            result.add(entry);
        }
        return ResponseEntity.ok(result);
    }

    @GetMapping("/profesores-activos")
    public ResponseEntity<List<Map<String, Object>>> getProfesoresActivos() {
        List<Object[]> raw = contactoRepository.findProfesoresActivos();
        List<Map<String, Object>> result = raw.stream().map(row -> {
            Map<String, Object> m = new HashMap<>();
            m.put("nombre", row[0]);
            m.put("contactos", row[1]);
            return m;
        }).toList();
        return ResponseEntity.ok(result);
    }

    @GetMapping("/necesidades")
    public ResponseEntity<List<Map<String, Object>>> getNecesidades() {
        List<Object[]> raw = alumnoRepository.countByCiclo();
        List<Map<String, Object>> result = raw.stream().map(row -> {
            Map<String, Object> m = new HashMap<>();
            m.put("type", row[0].toString());
            m.put("value", row[1]);
            return m;
        }).toList();
        return ResponseEntity.ok(result);
    }
}
