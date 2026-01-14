package com.prajeev.collabboard.service;

import com.prajeev.collabboard.domain.User;
import com.prajeev.collabboard.dto.AuthUserResponse;
import com.prajeev.collabboard.dto.LoginRequest;
import com.prajeev.collabboard.dto.LoginResponse;
import com.prajeev.collabboard.dto.RegisterRequest;
import com.prajeev.collabboard.exception.ConflictException;
import com.prajeev.collabboard.exception.UnauthorizedException;
import com.prajeev.collabboard.repository.UserRepository;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.OffsetDateTime;
import java.util.UUID;

@Service
public class AuthService {
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    public AuthService(UserRepository userRepository, PasswordEncoder passwordEncoder, JwtService jwtService) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
    }

    @Transactional
    public AuthUserResponse register(RegisterRequest request) {
        String email = request.email().trim().toLowerCase();

        if (userRepository.existsByEmailIgnoreCase(email)) {
            throw new ConflictException("EMAIL_EXISTS", "Email already registered!", null);
        }

        User user = new User(
                UUID.randomUUID(),
                email,
                passwordEncoder.encode(request.password()),
                (request.displayName() == null || request.displayName().isBlank() ? null : request.displayName().trim()), OffsetDateTime.now()
        );

        try {
        userRepository.save(user);
        }

        catch (DataIntegrityViolationException e) {
            throw new ConflictException("EMAIL_EXISTS", "Email already registered!", null);
        }

        return new AuthUserResponse(user.getId(), user.getEmail(), user.getDisplayName());
    }

    @Transactional
    public LoginResponse login(LoginRequest request) {
        String email = request.email().trim().toLowerCase();
        User u = userRepository.findByEmailIgnoreCase(email)
                .orElseThrow(() -> new UnauthorizedException("INVALID_CREDENTIALS", "Invalid credentials"));

        if (!passwordEncoder.matches(request.password(), u.getPasswordHash())) {
            throw new UnauthorizedException("INVALID_CREDENTIALS", "Invalid credentials");
        }

        String token = jwtService.issueToken(u.getId(), u.getEmail());
        return new LoginResponse(true, new AuthUserResponse(u.getId(), u.getEmail(), u.getDisplayName()), token);
    }
}
