package lrsa.mac_backend.domain.pais;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

public interface PaisRepository extends JpaRepository<Pais, Integer> {
	
	Optional<Pais> findByCodigoPais(String codigoPais);
}
