package lrsa.mac_backend.domain.auth;

import java.util.Optional;
import java.util.UUID;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import io.micrometer.common.util.StringUtils;
import lrsa.mac_backend.auth.jwt.JwtService;
import lrsa.mac_backend.auth.refresh_token.RefreshToken;
import lrsa.mac_backend.auth.refresh_token.RefreshTokenService;
import lrsa.mac_backend.domain.usuario.MACUsuario;
import lrsa.mac_backend.domain.usuario.MACUsuarioRole;
import lrsa.mac_backend.domain.usuario.MACUsuarioService;
import lrsa.mac_backend.exceptions.RegisterException;
import lrsa.mac_backend.exceptions.UnauthorizedException;
import lrsa.mac_backend.utils.Messages;

@Service
public class AuthService {
	
	private final MACUsuarioService usuarioService;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final RefreshTokenService refreshTokenService;
    
    private static final String USERNAME_OBRIGATORIO = "Nome de usuário é obrigatório";
    private static final String TAMANHO_USERNAME = "Nome de usuário deve ter entre 2 e 32 caracteres";
    private static final String CARACTERES_USERNAME = "Nome de usuário pode conter apenas letras, números, underscore (_) e hífen (-)";
    private static final String USERNAME_USADO = "Este nome de usuário já está sendo utilizado";
    
    private static final String SENHA_OBRIGATORIA = "Senha é obrigatória";
    private static final String TAMANHO_SENHA = "Senha deve ter no mínimo 8 caracteres";
    
    private static final String SEM_REFRESH_TOKEN = "Sem refresh token";
    
    private static final String DOMINIO_EMAIL = "@mac.com";
    
    public AuthService(MACUsuarioService usuarioService, PasswordEncoder passwordEncoder, JwtService jwtService, RefreshTokenService refreshTokenService) {
    	this.usuarioService = usuarioService;
    	this.passwordEncoder = passwordEncoder;
    	this.jwtService = jwtService;
    	this.refreshTokenService = refreshTokenService;
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
	
	public Optional<MACUsuario> getSession(String accessToken) {
		
        if (accessToken == null || !jwtService.isTokenValid(accessToken))
            return Optional.empty();

        String userId = jwtService.extractUserId(accessToken);
        return usuarioService.findByIdUsuario(UUID.fromString(userId));
        
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
