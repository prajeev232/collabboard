package com.prajeev.collabboard.security;

import com.prajeev.collabboard.service.BoardAuthService;
import com.prajeev.collabboard.service.JwtService;
import io.jsonwebtoken.Claims;
import org.springframework.http.HttpHeaders;
import org.springframework.lang.Nullable;
import org.springframework.messaging.Message;
import org.springframework.messaging.MessageChannel;
import org.springframework.messaging.simp.stomp.StompCommand;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.messaging.support.ChannelInterceptor;
import org.springframework.messaging.support.MessageHeaderAccessor;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.UUID;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

/**
 * Secures STOMP over WebSocket by:
 *  - Authenticating the CONNECT frame using a JWT in the native "Authorization" header.
 *  - Authorizing SUBSCRIBE to /topic/boards/{boardId} only for board members.
 */
@Component
public class StompAuthChannelInterceptor implements ChannelInterceptor {
    private static final Pattern BOARD_TOPIC = Pattern.compile("^/topic/boards/([0-9a-fA-F-]{36})$");

    private final JwtService jwtService;
    private final BoardAuthService boardAuthService;

    public StompAuthChannelInterceptor(JwtService jwtService, BoardAuthService boardAuthService) {
        this.jwtService = jwtService;
        this.boardAuthService = boardAuthService;
    }

    @Override
    public Message<?> preSend(Message<?> message, MessageChannel channel) {
        StompHeaderAccessor accessor = MessageHeaderAccessor.getAccessor(message, StompHeaderAccessor.class);
        if (accessor == null) return message;

        if (StompCommand.CONNECT.equals(accessor.getCommand())) {
            String token = extractBearerToken(accessor);
            if (token == null) {
                throw new AccessDeniedException("Missing Authorization header in STOMP CONNECT");
            }

            Claims claims = jwtService.parse(token);
            UUID userId = UUID.fromString(claims.getSubject());
            String email = claims.get("email", String.class);

            var principal = new AuthPrincipal(userId, email);
            var auth = new UsernamePasswordAuthenticationToken(
                    principal,
                    null,
                    List.of(new SimpleGrantedAuthority("ROLE_USER"))
            );
            accessor.setUser(auth);
            return message;
        }

        if (StompCommand.SUBSCRIBE.equals(accessor.getCommand())) {
            var user = accessor.getUser();
            if (!(user instanceof UsernamePasswordAuthenticationToken upat)) {
                throw new AccessDeniedException("Unauthenticated STOMP session");
            }
            if (!(upat.getPrincipal() instanceof AuthPrincipal p)) {
                throw new AccessDeniedException("Invalid principal");
            }

            String dest = accessor.getDestination();
            if (dest == null) {
                throw new AccessDeniedException("Missing destination");
            }

            Matcher m = BOARD_TOPIC.matcher(dest);
            if (m.matches()) {
                UUID boardId = UUID.fromString(m.group(1));
                // Throws ForbiddenException if not a member
                boardAuthService.requireMember(boardId, p.userId());
                return message;
            }

            // By default, deny subscriptions to unknown destinations.
            throw new AccessDeniedException("Subscription destination not allowed: " + dest);
        }

        return message;
    }

    private @Nullable String extractBearerToken(StompHeaderAccessor accessor) {
        // STOMP native headers are case-sensitive by convention, but clients vary.
        String auth = firstNativeHeader(accessor, HttpHeaders.AUTHORIZATION);
        if (auth == null) auth = firstNativeHeader(accessor, "authorization");
        if (auth == null) return null;

        if (auth.startsWith("Bearer ")) {
            return auth.substring("Bearer ".length());
        }
        return null;
    }

    private @Nullable String firstNativeHeader(StompHeaderAccessor accessor, String name) {
        List<String> values = accessor.getNativeHeader(name);
        if (values == null || values.isEmpty()) return null;
        return values.get(0);
    }
}
