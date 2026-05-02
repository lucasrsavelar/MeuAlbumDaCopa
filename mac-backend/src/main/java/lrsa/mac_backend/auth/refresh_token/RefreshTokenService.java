package lrsa.mac_backend.auth.refresh_token;

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
	
}
