package lrsa.mac_backend.auth.jwt;

import java.time.Instant;
import java.util.Date;
import java.util.UUID;

import javax.crypto.SecretKey;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import lrsa.mac_backend.auth.refresh_token.RefreshToken;
import lrsa.mac_backend.auth.refresh_token.RefreshTokenRepository;
import lrsa.mac_backend.domain.usuario.MACUsuario;
import lrsa.mac_backend.exceptions.InvalidTokenException;
import lrsa.mac_backend.utils.Messages;

@Service
public class JwtService {

    private final SecretKey secretKey;
    private final long accessExpiration;
    private final long refreshExpiration;
    private final RefreshTokenRepository refreshTokenRepository;

    public JwtService(
    		
        @Value("${app.jwt.secret}") 
        String secret,
        
        @Value("${app.jwt.access-token-expiration}") 
        long accessExpiration,
        
        @Value("${app.jwt.refresh-token-expiration}") 
        long refreshExpiration,
        
        RefreshTokenRepository refreshTokenRepository) {
        this.secretKey = Keys.hmacShaKeyFor(Decoders.BASE64.decode(secret));
        this.accessExpiration = accessExpiration;
        this.refreshExpiration = refreshExpiration;
        this.refreshTokenRepository = refreshTokenRepository;
    }

    // --- Access Token ---

    public String generateAccessToken(MACUsuario usuario) {
        return Jwts.builder()
            .subject(usuario.getIdUsuario().toString())
            .claim("email", usuario.getEmail())
            .issuedAt(new Date())
            .expiration(new Date(System.currentTimeMillis() + accessExpiration))
            .signWith(secretKey)
            .compact();
    }

    public Claims parseToken(String token) {
        return Jwts.parser()
            .verifyWith(secretKey)
            .build()
            .parseSignedClaims(token)
            .getPayload();
    }

    public String extractUserId(String token) {
        return parseToken(token).getSubject();
    }

    public boolean isTokenValid(String token) {
        try {
            parseToken(token);
            return true;
        } catch (JwtException | IllegalArgumentException e) {
            return false;
        }
    }

    // --- Refresh Token ---

    public RefreshToken generateRefreshToken(MACUsuario usuario) {
        String raw = UUID.randomUUID().toString();
        Instant expiresAt = Instant.now().plusMillis(refreshExpiration);
        RefreshToken rt = new RefreshToken(usuario, raw, expiresAt);
        return refreshTokenRepository.save(rt);
    }

    public RefreshToken validateRefreshToken(String raw) {
        RefreshToken rt = refreshTokenRepository.findByToken(raw)
            .orElseThrow(() -> new InvalidTokenException(Messages.INVALID_JWT_TOKEN));

        if (rt.isRevogado())  throw new InvalidTokenException(Messages.INVALID_JWT_TOKEN);
        if (rt.isExpirado())  throw new InvalidTokenException(Messages.INVALID_JWT_TOKEN);

        return rt;
    }

    public void revokeAll(MACUsuario usuario) {
        refreshTokenRepository.deleteAllByUser(usuario);
    }
}
