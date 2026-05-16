package lrsa.mac_backend.domain.macUsuario;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface MACUsuarioRepository extends JpaRepository<MACUsuario, UUID> {
		
	@Query(value = "SELECT USERNAME FROM MAC_USUARIO WHERE ID_USUARIO = :idUsuario", nativeQuery = true)
	String findUsernameByIdUsuario(@Param("idUsuario") UUID idUsuario);
	
	Optional<MACUsuario> findByIdUsuario(UUID idUsuario);
	
	Optional<MACUsuario> findByUsername(String username);
	
	List<MACUsuario> findByIdUsuarioIn(List<UUID> idsUsuarios);
	
	@Query(value = "SELECT ID_USUARIO FROM MAC_USUARIO WHERE USERNAME = :username", nativeQuery = true)
	Optional<UUID> findIdByUsername(@Param("username") String username);
	
	@Query(value = "SELECT USERNAME FROM MAC_USUARIO WHERE USERNAME ILIKE :termo AND ID_USUARIO <> :idUsuarioLogado LIMIT 10", nativeQuery = true)
	Optional<List<String>> buscarPorUsername(@Param("termo") String termo, @Param("idUsuarioLogado") UUID idUsuarioLogado);
	
	boolean existsByUsername(String username);

}
