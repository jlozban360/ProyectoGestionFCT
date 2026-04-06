package com.fct.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "empresas")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Empresa {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 20)
    private String cif;

    @Column(nullable = false)
    private String nombre;

    private String sector;

    @Enumerated(EnumType.STRING)
    private Modalidad modalidad;

    private String contactoPrincipal;
    private String cargoContacto;
    private String telefono;
    private String email;
    private String direccion;
    private Integer numTrabajadores;

    @ElementCollection
    @CollectionTable(name = "empresa_perfiles", joinColumns = @JoinColumn(name = "empresa_id"))
    @Column(name = "perfil")
    @Builder.Default
    private List<String> perfilesSolicitados = new ArrayList<>();

    @Column(columnDefinition = "TEXT")
    private String observaciones;

    @Column(nullable = false)
    @Builder.Default
    private boolean activa = true;

    @Column(updatable = false)
    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;

    @OneToMany(mappedBy = "empresa", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<Contacto> contactos = new ArrayList<>();

    @OneToMany(mappedBy = "empresa")
    @Builder.Default
    private List<Alumno> alumnos = new ArrayList<>();

    @PrePersist
    protected void onCreate() { createdAt = LocalDateTime.now(); updatedAt = LocalDateTime.now(); }

    @PreUpdate
    protected void onUpdate() { updatedAt = LocalDateTime.now(); }

    public enum Modalidad { FCT, DUAL, CONTRATACION, MIXTA }
}
