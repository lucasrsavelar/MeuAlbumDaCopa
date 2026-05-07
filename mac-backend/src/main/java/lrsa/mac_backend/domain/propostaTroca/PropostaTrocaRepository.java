package lrsa.mac_backend.domain.propostaTroca;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface PropostaTrocaRepository extends JpaRepository<PropostaTroca, UUID> {
	
	Optional<PropostaTroca> findByIdPropostaTroca(UUID idPropostaTroca);

	@Query(value = """
		    SELECT
		        p.id_proposta,
		        au.username AS username_enviou,
		        ptf.id_envia,
		        ptf.id_recebe,
		        ptf.id_figurinha
		    FROM proposta_troca p
		    JOIN mac_usuario au ON au.id_usuario = p.id_usuario_enviou
		    JOIN proposta_troca_figurinha ptf ON ptf.id_proposta = p.id_proposta
		    WHERE p.id_usuario_recebeu = :idUsuario
		    ORDER BY p.id_proposta
		    """, nativeQuery = true)
		List<Object[]> findPropostasRecebidasRaw(@Param("idUsuario") UUID idUsuario);

		@Query(value = """
		    SELECT
		        p.id_proposta,
		        au.username AS username_recebeu,
		        ptf.id_envia,
		        ptf.id_recebe,
		        ptf.id_figurinha
		    FROM proposta_troca p
		    JOIN mac_usuario au ON au.id_usuario = p.id_usuario_recebeu
		    JOIN proposta_troca_figurinha ptf ON ptf.id_proposta = p.id_proposta
		    WHERE p.id_usuario_enviou = :idUsuario
		    ORDER BY p.id_proposta
		    """, nativeQuery = true)
		List<Object[]> findPropostasEnviadasRaw(@Param("idUsuario") UUID idUsuario);
    
    boolean existsByidUsuarioEnviouAndidUsuarioRecebeu(UUID idUsuarioEnviou, UUID idUsuarioRecebeu);
    
    boolean existsByIdPropostaTroca(UUID idPropostaTroca);
    
}