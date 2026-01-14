package com.prajeev.collabboard.controller;

import com.prajeev.collabboard.dto.AuthUserResponse;
import com.prajeev.collabboard.dto.LoginRequest;
import com.prajeev.collabboard.dto.LoginResponse;
import com.prajeev.collabboard.dto.RegisterRequest;
import com.prajeev.collabboard.service.AuthService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/auth")
public class AuthController {
    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/register")
    @ResponseStatus(HttpStatus.CREATED)
    public AuthUserResponse register(@Valid @RequestBody RegisterRequest request) {
        return authService.register(request);
    }

    @PostMapping("/login")
    public LoginResponse login(@Valid @RequestBody LoginRequest request) {
        return authService.login(request);
    }
}
