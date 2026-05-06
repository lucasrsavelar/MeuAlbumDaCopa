package lrsa.mac_backend.domain.auth;

import java.util.Optional;
import java.util.UUID;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import io.micrometer.common.util.StringUtils;
import jakarta.servlet.http.HttpServletResponse;
import lrsa.mac_backend.auth.jwt.JwtService;
import lrsa.mac_backend.auth.refreshToken.RefreshToken;
import lrsa.mac_backend.auth.refreshToken.RefreshTokenService;
import lrsa.mac_backend.domain.macUsuario.MACUsuario;
import lrsa.mac_backend.domain.macUsuario.MACUsuarioRole;
import lrsa.mac_backend.domain.macUsuario.MACUsuarioService;
import lrsa.mac_backend.domain.utils.CookieUtils;
import lrsa.mac_backend.exceptions.InvalidTokenException;
import lrsa.mac_backend.exceptions.RegisterException;
import lrsa.mac_backend.exceptions.UnauthorizedException;
import lrsa.mac_backend.utils.Messages;

@Service
public class AuthService {
	
	private final MACUsuarioService usuarioService;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final RefreshTokenService refreshTokenService;
    private final CookieUtils cookieUtils;
    
    private static final String USERNAME_OBRIGATORIO = "Nome de usuário é obrigatório";
    private static final String TAMANHO_USERNAME = "Nome de usuário deve ter entre 2 e 32 caracteres";
    private static final String CARACTERES_USERNAME = "Nome de usuário pode conter apenas letras, números, underscore (_) e hífen (-)";
    private static final String USERNAME_USADO = "Este nome de usuário já está sendo utilizado";
    
    private static final String SENHA_OBRIGATORIA = "Senha é obrigatória";
    private static final String TAMANHO_SENHA = "Senha deve ter no mínimo 8 caracteres";
    
    private static final String SEM_REFRESH_TOKEN = "Sem refresh token";
    
    private static final String DOMINIO_EMAIL = "@mac.com";
    
    public AuthService(MACUsuarioService usuarioService, PasswordEncoder passwordEncoder, JwtService jwtService, RefreshTokenService refreshTokenService, CookieUtils cookieUtils) {
    	this.usuarioService = usuarioService;
    	this.passwordEncoder = passwordEncoder;
    	this.jwtService = jwtService;
    	this.refreshTokenService = refreshTokenService;
    	this.cookieUtils = cookieUtils;
    }
	
	public MACUsuario login(AuthDTO login) {
		
		MACUsuario usuario = usuarioService.findByUsername(login.getUsername()).orElseThrow(() -> new UnauthorizedException(Messages.INVALID_CREDENTIALS));
		
		if(!passwordEncoder.matches(login.getSenha(), usuario.getSenha()))
			throw new UnauthorizedException(Messages.INVALID_CREDENTIALS);
		
		return usuario;
		
	}
	
	public MACUsuario cadastro(AuthDTO cadastro) {
		
		String erro = this.erroCadastro(cadastro);
		if(erro != null)
			throw new RegisterException(erro);
		
		MACUsuario usuario = new MACUsuario();
		usuario.setUsername(cadastro.getUsername());
		usuario.setSenha(passwordEncoder.encode(cadastro.getSenha()));
		usuario.setEmail(cadastro.getUsername() + DOMINIO_EMAIL);
		usuario.setRole(MACUsuarioRole.USER);
		
		usuarioService.salvar(usuario);
		return usuario;
		
	}
	
	public MACUsuario refresh(String rawToken) {
		
        if (rawToken == null)
            throw new UnauthorizedException(SEM_REFRESH_TOKEN);

        RefreshToken old = jwtService.validateRefreshToken(rawToken);
        old.revogar();;

        return old.getUser();
        
    }
	
	public Optional<MACUsuario> getSession(String accessToken, String refreshToken, HttpServletResponse response) {

		// Access token válido
		if (accessToken != null && jwtService.isTokenValid(accessToken)) {
			String userId = jwtService.extractUserId(accessToken);
			return usuarioService.findByIdUsuario(UUID.fromString(userId));
		}

		// Access expirado mas refresh válido
		if (refreshToken != null) {
			try {
				RefreshToken old = jwtService.validateRefreshToken(refreshToken);
				old.revogar();

				MACUsuario user = old.getUser();

				String newAccessToken = jwtService.generateAccessToken(user);
				RefreshToken newRefreshToken = jwtService.generateRefreshToken(user);

				cookieUtils.setarCookie(response, "access_token",  newAccessToken,             60 * 30);
				cookieUtils.setarCookie(response, "refresh_token", newRefreshToken.getToken(), 60 * 60 * 24 * 7);

				return Optional.of(user);
			} catch (InvalidTokenException e) {
				return Optional.empty();
			}
		}

		// Sem tokens
		return Optional.empty();
	}
	
	public void logout(String rawToken) {
        if (rawToken != null) {
        	refreshTokenService.findByToken(rawToken)
                .ifPresent(RefreshToken::revogar);
        }
    }
	
	private String erroCadastro(AuthDTO cadastro) {

		String username = cadastro.getUsername();
		String senha = cadastro.getSenha();

		if (username == null || StringUtils.isBlank(username))
			return USERNAME_OBRIGATORIO;

		if (username.length() < 2 || username.length() > 32)
			return TAMANHO_USERNAME;

		if (!username.matches("^[a-zA-Z0-9_-]+$"))
			return CARACTERES_USERNAME;

		if (senha == null || StringUtils.isBlank(senha))
			return SENHA_OBRIGATORIA;

		if (senha.length() < 8)
			return TAMANHO_SENHA;

		if(usuarioService.usernameExiste(username))
			return USERNAME_USADO;

		return null;
	}
	
	

}
