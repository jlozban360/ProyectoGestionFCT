package com.fct.dto;

import com.fct.entity.Alumno;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

public class AlumnoDto {

    @Data @NoArgsConstructor @AllArgsConstructor
    public static class Request {
        @NotBlank private String nombre;
        @NotBlank private String apellidos;
        @Email   private String email;
        private String telefono;
        @NotNull private Alumno.CicloFormativo ciclo;
        @NotBlank private String curso;
        private Alumno.EstadoAlumno estado = Alumno.EstadoAlumno.DISPONIBLE;
        private String observaciones;
    }

    @Data @NoArgsConstructor @AllArgsConstructor
    public static class AsignarRequest {
        private Long empresaId;
        private Alumno.EstadoAlumno estado;
    }

    @Data @Builder @NoArgsConstructor @AllArgsConstructor
    public static class Response {
        private Long id;
        private String nombre;
        private String apellidos;
        private String email;
        private String telefono;
        private Alumno.CicloFormativo ciclo;
        private String curso;
        private Alumno.EstadoAlumno estado;
        private String empresa;
        private Long empresaId;
        private String observaciones;
        private LocalDateTime createdAt;

        public static Response from(Alumno a) {
            return Response.builder()
                    .id(a.getId())
                    .nombre(a.getNombre())
                    .apellidos(a.getApellidos())
                    .email(a.getEmail())
                    .telefono(a.getTelefono())
                    .ciclo(a.getCiclo())
                    .curso(a.getCurso())
                    .estado(a.getEstado())
                    .empresa(a.getEmpresa() != null ? a.getEmpresa().getNombre() : null)
                    .empresaId(a.getEmpresa() != null ? a.getEmpresa().getId() : null)
                    .observaciones(a.getObservaciones())
                    .createdAt(a.getCreatedAt())
                    .build();
        }
    }
}
