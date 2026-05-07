package lrsa.mac_backend.auth.refreshToken;

import java.time.Instant;
import java.time.LocalDateTime;
import java.util.Optional;

import org.springframework.stereotype.Service;

@Service
public class RefreshTokenService {

	private final RefreshTokenRepository refreshTokenRepository;
	
	public RefreshTokenService(RefreshTokenRepository refreshTokenRepository) {
		this.refreshTokenRepository = refreshTokenRepository;
	}
	
	public Optional<RefreshToken> findByToken(String token) {
		return refreshTokenRepository.findByToken(token);
	}
	
	public void deletarInvalidos() {
		refreshTokenRepository.deleteInvalidos(Instant.now());
	}
	
}
