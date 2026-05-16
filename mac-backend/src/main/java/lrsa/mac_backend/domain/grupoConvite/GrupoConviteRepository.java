package lrsa.mac_backend.domain.grupoConvite;

import java.util.List;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface GrupoConviteRepository extends JpaRepository<GrupoConvite, UUID> {
	
	boolean existsByIdGrupoAndIdConvidado(UUID idGrupo, UUID idConvidado);
	
	@Query(value = """
			SELECT
				gc.ID_CONVITE, 
				mu.USERNAME, 
				g.NOME
			FROM 
				GRUPO_CONVITE gc 
					LEFT JOIN GRUPOS g ON gc.ID_GRUPO = g.ID_GRUPO
					LEFT JOIN MAC_USUARIO mu ON g.ID_CRIADOR = mu.ID_USUARIO
			WHERE
				gc.ID_CONVIDADO = :idUsuario
			""", nativeQuery = true)
	List<Object[]> findConvitesRecebidos(@Param("idUsuario") UUID idUsuario);
	
	void deleteByIdGrupo(UUID idGrupo);
		
}
