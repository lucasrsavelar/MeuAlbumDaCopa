package lrsa.mac_backend.domain.auth;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CookieValue;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import jakarta.servlet.http.HttpServletResponse;
import lrsa.mac_backend.auth.jwt.JwtService;
import lrsa.mac_backend.auth.refreshToken.RefreshToken;
import lrsa.mac_backend.domain.macUsuario.MACUsuario;
import lrsa.mac_backend.domain.utils.CookieUtils;

@RestController
@RequestMapping("/auth")
public class AuthController {
	
	private final AuthService authService;
    private final JwtService jwtService;
    private final CookieUtils cookieUtils;
    
    public AuthController(AuthService authService, JwtService jwtService, CookieUtils cookieUtils) {
    	this.authService = authService;
    	this.jwtService = jwtService;
    	this.cookieUtils = cookieUtils;
    }

    @PostMapping("/login")
    public ResponseEntity<?> logar(@RequestBody AuthDTO req, HttpServletResponse response) {
    	MACUsuario usuario = authService.login(req);
    	return gerarTokens(usuario, response);
    }
    
    @PostMapping("/cadastro")
    public ResponseEntity<?> cadastro(@RequestBody AuthDTO req, HttpServletResponse response) {
    	MACUsuario usuario = authService.cadastro(req);
        return gerarTokens(usuario, response);
    }
    
    @PostMapping("/refresh")
    public ResponseEntity<?> refresh(@CookieValue(name = "refresh_token", required = false) String rawToken, HttpServletResponse response) {
    	MACUsuario usuario = authService.refresh(rawToken);
        return gerarTokens(usuario, response);
    }
    
    @GetMapping("/session")
    public ResponseEntity<?> session(
        @CookieValue(name = "access_token", required = false) String accessToken,
        @CookieValue(name = "refresh_token", required = false) String refreshToken,
        HttpServletResponse response
    ) {
        return authService.getSession(accessToken, refreshToken, response)
            .map(user -> ResponseEntity.ok(new AuthResponseDTO(user.getUsername(), user.getEmail())))
            .orElse(ResponseEntity.status(HttpStatus.UNAUTHORIZED).build());
    }

    @PostMapping("/logout")
    public ResponseEntity<?> logout(
        @CookieValue(name = "refresh_token", required = false) String rawToken,
        HttpServletResponse response
    ) {
        authService.logout(rawToken);
        cookieUtils.limparCookies(response);
        return ResponseEntity.ok().build();
    }
    
    private ResponseEntity<?> gerarTokens(MACUsuario usuario, HttpServletResponse response) {
        String accessToken = jwtService.generateAccessToken(usuario);
        RefreshToken refreshToken = jwtService.generateRefreshToken(usuario);

        cookieUtils.setarCookie(response, "access_token",  accessToken,             60 * 30);
        cookieUtils.setarCookie(response, "refresh_token", refreshToken.getToken(), 60 * 60 * 24 * 7);

        return ResponseEntity.ok(new AuthResponseDTO(usuario.getUsername(), usuario.getEmail()));
    }
  
}
