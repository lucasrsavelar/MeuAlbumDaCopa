package lrsa.mac_backend.auth.refreshToken;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/refresh-token")
public class RefreshTokenController {
	
	private final RefreshTokenService refreshTokenService;
	
	public RefreshTokenController(RefreshTokenService refreshTokenService) {
		this.refreshTokenService = refreshTokenService;
	}

	@DeleteMapping("/deletar-invalidos")
	@PreAuthorize("hasRole('ADMIN')")
	public ResponseEntity<?> deletarInvalidos() {
		refreshTokenService.deletarInvalidos();
		return ResponseEntity.noContent().build();
	}
	
}