package com.prajeev.collabboard.service;

//import com.prajeev.collabboard.security.AuthPrincipal;
import com.prajeev.collabboard.security.AuthPrincipal;
import org.springframework.security.core.Authentication;

import java.util.UUID;

public class SecurityUtil {
    private SecurityUtil() {

    }

    public static UUID userId(Authentication authentication) {
        return ((AuthPrincipal) authentication.getPrincipal()).userId();
    }
}
