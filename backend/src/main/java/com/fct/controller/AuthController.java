package com.fct.controller;

import com.fct.dto.AuthDto;
import com.fct.dto.ProfesorDto;
import com.fct.entity.Profesor;
import com.fct.repository.ProfesorRepository;
import com.fct.security.JwtService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthenticationManager authenticationManager;
    private final JwtService jwtService;
    private final ProfesorRepository profesorRepository;

    @PostMapping("/login")
    public ResponseEntity<AuthDto.LoginResponse> login(@RequestBody AuthDto.LoginRequest request) {
        Authentication auth = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword())
        );
        Profesor profesor = (Profesor) auth.getPrincipal();
        String token = jwtService.generateToken(profesor);
        return ResponseEntity.ok(AuthDto.LoginResponse.builder()
                .token(token)
                .user(ProfesorDto.Response.from(profesor))
                .build());
    }

    @GetMapping("/me")
    public ResponseEntity<ProfesorDto.Response> me(@AuthenticationPrincipal Profesor profesor) {
        return ResponseEntity.ok(ProfesorDto.Response.from(profesor));
    }
}
