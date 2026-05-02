package lrsa.mac_backend.auth.refresh_token;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import lrsa.mac_backend.domain.usuario.MACUsuario;

public interface RefreshTokenRepository extends JpaRepository<RefreshToken, String> {
	
    Optional<RefreshToken> findByToken(String token);
    void deleteAllByUser(MACUsuario usuario);
    
}
