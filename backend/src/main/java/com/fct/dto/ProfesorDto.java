package com.fct.dto;

import com.fct.entity.Profesor;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

public class ProfesorDto {

    @Data @NoArgsConstructor @AllArgsConstructor
    public static class Request {
        @NotBlank private String nombre;
        @Email @NotBlank private String email;
        @Size(min = 6) private String password;
        private String telefono;
        private Profesor.Rol rol = Profesor.Rol.COLABORADOR;
        private boolean activo = true;
        private String tema;
    }

    @Data @Builder @NoArgsConstructor @AllArgsConstructor
    public static class Response {
        private Long id;
        private String nombre;
        private String email;
        private String telefono;
        private Profesor.Rol rol;
        private boolean activo;
        private String tema;
        private LocalDateTime createdAt;
        private long totalContactos;

        public static Response from(Profesor p, long totalContactos) {
            return Response.builder()
                    .id(p.getId())
                    .nombre(p.getNombre())
                    .email(p.getEmail())
                    .telefono(p.getTelefono())
                    .rol(p.getRol())
                    .activo(p.isActivo())
                    .createdAt(p.getCreatedAt())
                    .tema(p.getTema())
                    .totalContactos(totalContactos)
                    .build();
        }

        public static Response from(Profesor p) {
            return from(p, 0L);
        }
    }

    @Data @Builder @NoArgsConstructor @AllArgsConstructor
    public static class Summary {
        private Long id;
        private String nombre;
        private String email;

        public static Summary from(Profesor p) {
            return Summary.builder()
                    .id(p.getId())
                    .nombre(p.getNombre())
                    .email(p.getEmail())
                    .build();
        }
    }
}
