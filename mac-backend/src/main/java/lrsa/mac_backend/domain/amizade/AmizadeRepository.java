package lrsa.mac_backend.domain.amizade;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface AmizadeRepository extends JpaRepository<Amizade, AmizadePK> {
	
	@Query(value = "SELECT ID_AMIGO FROM AMIZADES WHERE ID_USUARIO = :idUsuario", nativeQuery = true)
	Optional<List<UUID>> findByIdUsuario(@Param("idUsuario") UUID idUsuario);
}
