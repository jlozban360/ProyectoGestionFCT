package com.fct.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "contactos")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Contacto {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "empresa_id", nullable = false)
    private Empresa empresa;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "profesor_id")
    private Profesor profesor;

    @Column(nullable = false)
    private LocalDate fecha;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private TipoContacto tipo;

    @Column(nullable = false)
    private String motivo;

    @Enumerated(EnumType.STRING)
    private ResultadoContacto resultado;

    @Column(columnDefinition = "TEXT")
    private String necesidades;

    private String proximaAccion;

    @Column(updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() { createdAt = LocalDateTime.now(); }

    public enum TipoContacto { LLAMADA, EMAIL, VISITA }

    public enum ResultadoContacto { INTERESADO, PENDIENTE, NO_INTERESADO, EN_PROCESO, HECHO, DESCARTADO }
}
