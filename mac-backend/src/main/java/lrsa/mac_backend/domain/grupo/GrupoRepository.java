package lrsa.mac_backend.domain.grupo;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface GrupoRepository extends JpaRepository<Grupo, UUID> {
		
	boolean existsByNome(String nome);
	
	Optional<Grupo> findByNome(String nome);
	
	Optional<Grupo> findByNomeAndIdCriador(String nome, UUID idCriador);
	
	long countByIdCriador(UUID idCriador);
	
	@Query(value = """
		    SELECT
		        g.id_grupo,
		        g.nome,
		        g.id_criador,
		        gm.id_usuario,
		        au.username
		    FROM grupos g
		    JOIN grupo_membro gm ON gm.id_grupo = g.id_grupo
		    JOIN mac_usuario au ON au.id_usuario = gm.id_usuario
		    WHERE g.id_grupo IN (
		        SELECT id_grupo FROM grupo_membro WHERE id_usuario = :idUsuario
		    )
		    ORDER BY g.id_grupo
		    """, nativeQuery = true)
		List<Object[]> findGruposComMembrosByUsuario(@Param("idUsuario") UUID idUsuario);

}
