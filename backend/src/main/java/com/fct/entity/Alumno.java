package com.fct.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "alumnos")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Alumno {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String nombre;

    @Column(nullable = false)
    private String apellidos;

    @Column(unique = true)
    private String email;

    private String telefono;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private CicloFormativo ciclo;

    @Column(nullable = false, length = 1)
    private String curso;

    @Enumerated(EnumType.STRING)
    @Builder.Default
    private EstadoAlumno estado = EstadoAlumno.DISPONIBLE;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "empresa_id")
    private Empresa empresa;

    @Column(columnDefinition = "TEXT")
    private String observaciones;

    @Column(updatable = false)
    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() { createdAt = LocalDateTime.now(); updatedAt = LocalDateTime.now(); }

    @PreUpdate
    protected void onUpdate() { updatedAt = LocalDateTime.now(); }

    public enum CicloFormativo { DAM, DAW, SMR, ASIR }

    public enum EstadoAlumno { DISPONIBLE, ENVIADO, ACEPTADO, RECHAZADO, EN_PRACTICAS }
}
