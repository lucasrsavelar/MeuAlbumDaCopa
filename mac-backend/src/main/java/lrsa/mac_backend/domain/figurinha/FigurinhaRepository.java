package lrsa.mac_backend.domain.figurinha;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

public interface FigurinhaRepository extends JpaRepository<Figurinha, Integer> {
	
	@Query(value = """
			SELECT *
			FROM figurinhas
			ORDER BY
			regexp_replace(codigo_figurinha, '\\d', '', 'g'),
			CAST(regexp_replace(codigo_figurinha, '\\D', '', 'g') AS INTEGER)
			""", nativeQuery = true)
	List<Figurinha> findAllOrdenadas();

}
