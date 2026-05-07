package lrsa.mac_backend.auth.refreshToken;

import java.time.Instant;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.transaction.annotation.Transactional;

import lrsa.mac_backend.domain.macUsuario.MACUsuario;

public interface RefreshTokenRepository extends JpaRepository<RefreshToken, String> {
	
    Optional<RefreshToken> findByToken(String token);
    void deleteAllByUser(MACUsuario usuario);
    
    @Modifying
    @Transactional
    @Query("DELETE FROM RefreshToken r WHERE r.revogado = true OR r.expiracao < :dataCorte")
    void deleteInvalidos(@Param("dataCorte") Instant dataCorte);
    
}
