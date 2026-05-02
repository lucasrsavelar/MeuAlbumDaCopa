package lrsa.mac_backend.auth.refreshToken;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import lrsa.mac_backend.domain.macUsuario.MACUsuario;

public interface RefreshTokenRepository extends JpaRepository<RefreshToken, String> {
	
    Optional<RefreshToken> findByToken(String token);
    void deleteAllByUser(MACUsuario usuario);
    
}
