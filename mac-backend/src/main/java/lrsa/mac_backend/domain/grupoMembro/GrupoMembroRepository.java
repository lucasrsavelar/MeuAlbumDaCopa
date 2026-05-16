package lrsa.mac_backend.domain.grupoMembro;

import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;

public interface GrupoMembroRepository extends JpaRepository<GrupoMembro, GrupoMembroPK> {
	
	boolean existsByPkIdGrupoAndPkIdUsuario(UUID idGrupo, UUID idUsuario);
	
	long countByPkIdGrupo(UUID idGrupo);
	
	long countByPkIdUsuario(UUID idUsuario);
	
	void deleteByPkIdGrupo(UUID idGrupo);
	
	void deleteByPkIdGrupoAndPkIdUsuario(UUID idGrupo, UUID idUsuario);
	
}
