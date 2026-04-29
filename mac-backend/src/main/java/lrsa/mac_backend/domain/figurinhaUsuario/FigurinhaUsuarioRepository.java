package lrsa.mac_backend.domain.figurinhaUsuario;

import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.transaction.annotation.Transactional;

public interface FigurinhaUsuarioRepository extends JpaRepository<FigurinhaUsuario, FigurinhaUsuarioPK> {
	
	@Query(value = "SELECT ID_FIGURINHA, QUANTIDADE FROM FIGURINHAS_USUARIO WHERE ID_USUARIO = :idUsuario", nativeQuery = true)
	public Optional<Map<Integer, Integer>> findFigurinhasByUser(@Param("idUsuario") UUID idUsuario);
		
	@Query(value = "SELECT ID_FIGURINHA FROM FIGURINHAS_USUARIO WHERE ID_USUARIO = :idUsuario AND QUANTIDADE > 2", nativeQuery = true)
	public Optional<List<Integer>> findFigurinhasRepetidasByUser(@Param("idUsuario") UUID idUsuario);
	
	@Modifying
	@Transactional
	@Query(value = """
			    INSERT INTO FIGURINHAS_USUARIO (ID_USUARIO, ID_FIGURINHA, QUANTIDADE)
			    VALUES (:idUsuario, :idFigurinha, :quantidade)
			    ON CONFLICT (ID_USUARIO, ID_FIGURINHA)
			    DO UPDATE SET QUANTIDADE = FIGURINHAS_USUARIO.QUANTIDADE + EXCLUDED.QUANTIDADE
			""", nativeQuery = true)
	void upsert(
			@Param("idUsuario") UUID idUsuario,
			@Param("idFigurinha") Integer idFigurinha,
			@Param("quantidade") Integer quantidade
			);
	
}
