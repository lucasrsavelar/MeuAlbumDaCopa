package lrsa.mac_backend.domain.propostaTrocaFigurinha;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface PropostaTrocaFigurinhaRepository extends JpaRepository<PropostaTrocaFigurinha, UUID>{
	
	Optional<List<PropostaTrocaFigurinha>> findByIdProposta(UUID idProposta);
	
	@Modifying
    @Query(value = "DELETE FROM PROPOSTA_TROCA_FIGURINHA WHERE ID_PROPOSTA = :idProposta", nativeQuery = true)
    void deleteByIdProposta(@Param("idProposta") UUID idProposta);

}
