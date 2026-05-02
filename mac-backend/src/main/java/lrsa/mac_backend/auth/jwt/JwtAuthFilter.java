package lrsa.mac_backend.auth.jwt;

import java.io.IOException;
import java.util.Arrays;
import java.util.UUID;

import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lrsa.mac_backend.domain.usuario.MACUsuarioService;

@Component
public class JwtAuthFilter extends OncePerRequestFilter {
	
	private final JwtService jwtService;
    private final MACUsuarioService usuarioService;
	
	public JwtAuthFilter(JwtService jwtService, MACUsuarioService usuarioService) {
		this.jwtService = jwtService;
		this.usuarioService = usuarioService;
	}

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain chain) throws ServletException, IOException {

        String token = extractFromCookie(request, "access_token");

        if (token != null && jwtService.isTokenValid(token)) {
            String userId = jwtService.extractUserId(token);

            usuarioService.findByIdUsuario(UUID.fromString(userId)).ifPresent(user -> {
                UsernamePasswordAuthenticationToken auth =
                    new UsernamePasswordAuthenticationToken(
                        user,
                        null,
                        user.getAuthorities()   // ex: List.of(new SimpleGrantedAuthority("ROLE_USER"))
                    );
                auth.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                SecurityContextHolder.getContext().setAuthentication(auth);
            });
        }

        chain.doFilter(request, response);
    }

    private String extractFromCookie(HttpServletRequest req, String name) {
        if (req.getCookies() == null) return null;
        return Arrays.stream(req.getCookies())
            .filter(c -> name.equals(c.getName()))
            .map(Cookie::getValue)
            .findFirst()
            .orElse(null);
    }

    // Não filtra os endpoints de auth
    @Override
    protected boolean shouldNotFilter(HttpServletRequest request) {
        String path = request.getServletPath();
        return path.startsWith("/auth/");
    }
}
