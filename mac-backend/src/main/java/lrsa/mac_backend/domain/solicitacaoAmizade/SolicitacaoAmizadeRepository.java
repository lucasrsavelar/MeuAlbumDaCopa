package lrsa.mac_backend.domain.solicitacaoAmizade;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface SolicitacaoAmizadeRepository extends JpaRepository<SolicitacaoAmizade, UUID> {
	
	boolean existsByIdEnviouAndIdRecebeu(UUID idEnviou, UUID idRecebeu);
    Optional<SolicitacaoAmizade> findByIdEnviouAndIdRecebeu(UUID idEnviou, UUID idRecebeu);
    
    @Query(value = """
    		SELECT r.id_solicitacao, au.username
    		FROM SOLICITACAO_AMIZADE r
    		JOIN mac_usuario au ON au.id_usuario = r.id_enviou
    		WHERE r.id_recebeu = :idUsuario
    		""", nativeQuery = true)
    List<Object[]> findSolicitacoesRecebidas(@Param("idUsuario") UUID idUsuario);

}
