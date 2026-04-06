package com.fct.dto;

import com.fct.entity.Contacto;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;

public class ContactoDto {

    @Data @NoArgsConstructor @AllArgsConstructor
    public static class Request {
        @NotNull private Long empresaId;
        @NotNull private LocalDate fecha;
        @NotNull private Contacto.TipoContacto tipo;
        @NotBlank private String motivo;
        private Contacto.ResultadoContacto resultado;
        private String necesidades;
        private String proximaAccion;
    }

    @Data @Builder @NoArgsConstructor @AllArgsConstructor
    public static class Response {
        private Long id;
        private Long empresaId;
        private String empresaNombre;
        private ProfesorDto.Summary profesor;
        private LocalDate fecha;
        private Contacto.TipoContacto tipo;
        private String motivo;
        private Contacto.ResultadoContacto resultado;
        private String necesidades;
        private String proximaAccion;
        private LocalDateTime createdAt;

        public static Response from(Contacto c) {
            return Response.builder()
                    .id(c.getId())
                    .empresaId(c.getEmpresa().getId())
                    .empresaNombre(c.getEmpresa().getNombre())
                    .profesor(c.getProfesor() != null ? ProfesorDto.Summary.from(c.getProfesor()) : null)
                    .fecha(c.getFecha())
                    .tipo(c.getTipo())
                    .motivo(c.getMotivo())
                    .resultado(c.getResultado())
                    .necesidades(c.getNecesidades())
                    .proximaAccion(c.getProximaAccion())
                    .createdAt(c.getCreatedAt())
                    .build();
        }
    }
}
