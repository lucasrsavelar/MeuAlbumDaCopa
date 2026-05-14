package lrsa.mac_backend.domain.grupo;

import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;

public interface GrupoRepository extends JpaRepository<Grupo, UUID> {
	
	boolean existsByNomeAndIdCriador(String nome, UUID idCriador);
	
	Optional<Grupo> findByNomeAndIdCriador(String nome, UUID idCriador);

}
