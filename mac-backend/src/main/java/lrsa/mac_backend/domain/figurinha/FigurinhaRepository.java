package lrsa.mac_backend.domain.figurinha;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

public interface FigurinhaRepository extends JpaRepository<Figurinha, Integer> {
	
	@Query(value = 
			"""
			SELECT f FROM FIGURINHAS f WHERE f.nome_pais IS NULL AND f.tipo_figurinha <> 'ESPECIAL' 
			""", nativeQuery = true)
	public List<Figurinha> figsCorrecao();

}
