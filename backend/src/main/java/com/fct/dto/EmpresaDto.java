package com.fct.dto;

import com.fct.entity.Empresa;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

public class EmpresaDto {

    @Data @NoArgsConstructor @AllArgsConstructor
    public static class Request {
        @NotBlank(message = "El CIF es obligatorio")
        private String cif;

        @NotBlank(message = "El nombre es obligatorio")
        private String nombre;

        private String sector;
        private Empresa.Modalidad modalidad;
        private String contactoPrincipal;
        private String cargoContacto;
        private String telefono;
        private String email;
        private String direccion;
        private Integer numTrabajadores;
        private List<String> perfilesSolicitados;
        private String observaciones;
        private boolean activa = true;
    }

    @Data @Builder @NoArgsConstructor @AllArgsConstructor
    public static class Response {
        private Long id;
        private String cif;
        private String nombre;
        private String sector;
        private Empresa.Modalidad modalidad;
        private String contactoPrincipal;
        private String cargoContacto;
        private String telefono;
        private String email;
        private String direccion;
        private Integer numTrabajadores;
        private List<String> perfilesSolicitados;
        private String observaciones;
        private boolean activa;
        private LocalDateTime createdAt;

        public static Response from(Empresa e) {
            return Response.builder()
                    .id(e.getId())
                    .cif(e.getCif())
                    .nombre(e.getNombre())
                    .sector(e.getSector())
                    .modalidad(e.getModalidad())
                    .contactoPrincipal(e.getContactoPrincipal())
                    .cargoContacto(e.getCargoContacto())
                    .telefono(e.getTelefono())
                    .email(e.getEmail())
                    .direccion(e.getDireccion())
                    .numTrabajadores(e.getNumTrabajadores())
                    .perfilesSolicitados(e.getPerfilesSolicitados())
                    .observaciones(e.getObservaciones())
                    .activa(e.isActiva())
                    .createdAt(e.getCreatedAt())
                    .build();
        }
    }
}
