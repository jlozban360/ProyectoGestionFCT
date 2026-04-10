package com.fct.repository;

import com.fct.entity.Contacto;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.util.List;
import org.springframework.lang.Nullable;

public interface ContactoRepository extends JpaRepository<Contacto, Long> {

    List<Contacto> findByEmpresaIdOrderByFechaDesc(Long empresaId);

    long countByProfesorId(Long profesorId);

    long countByFechaBetween(LocalDate start, LocalDate end);

    @Query("SELECT c FROM Contacto c WHERE " +
           "(:search IS NULL OR c.empresa.nombre ILIKE %:search% OR c.motivo ILIKE %:search%) " +
           "AND (:tipo IS NULL OR c.tipo = :tipo) " +
           "AND (:resultado IS NULL OR c.resultado = :resultado) " +
           "AND (:startDate IS NULL OR c.fecha >= :startDate) " +
           "AND (:endDate IS NULL OR c.fecha <= :endDate)")
    Page<Contacto> findWithFilters(
            @Param("search") @Nullable String search,
            @Param("tipo") @Nullable Contacto.TipoContacto tipo,
            @Param("resultado") @Nullable Contacto.ResultadoContacto resultado,
            @Param("startDate") @Nullable LocalDate startDate,
            @Param("endDate") @Nullable LocalDate endDate,
            Pageable pageable);

    @Query("SELECT c.profesor.nombre, COUNT(c) FROM Contacto c " +
           "WHERE c.profesor IS NOT NULL " +
           "GROUP BY c.profesor.nombre ORDER BY COUNT(c) DESC")
    List<Object[]> findProfesoresActivos();

    @Query(value = "SELECT EXTRACT(MONTH FROM fecha) as mes, COUNT(*) as total " +
                   "FROM contactos WHERE EXTRACT(YEAR FROM fecha) = :year " +
                   "GROUP BY EXTRACT(MONTH FROM fecha)", nativeQuery = true)
    List<Object[]> findContactosPorMes(@Param("year") int year);
}