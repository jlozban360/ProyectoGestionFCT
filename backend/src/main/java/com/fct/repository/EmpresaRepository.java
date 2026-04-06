package com.fct.repository;

import com.fct.entity.Empresa;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;

public interface EmpresaRepository extends JpaRepository<Empresa, Long> {

    @Query("SELECT e FROM Empresa e WHERE " +
           "(:search IS NULL OR LOWER(e.nombre) LIKE LOWER(CONCAT('%', :search, '%')) " +
           "OR LOWER(e.cif) LIKE LOWER(CONCAT('%', :search, '%'))) " +
           "AND (:sector IS NULL OR e.sector = :sector)")
    Page<Empresa> findWithFilters(@Param("search") String search,
                                  @Param("sector") String sector,
                                  Pageable pageable);

    Optional<Empresa> findByCif(String cif);

    long countByActivaTrue();
}
