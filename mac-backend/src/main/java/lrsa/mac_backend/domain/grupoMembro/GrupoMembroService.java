package lrsa.mac_backend.domain.grupoMembro;

import java.util.UUID;

import org.springframework.stereotype.Service;

@Service
public class GrupoMembroService {

	private final GrupoMembroRepository grupoMembroRepository;
	
	public GrupoMembroService(GrupoMembroRepository grupoMembroRepository) {
		this.grupoMembroRepository = grupoMembroRepository;
	}
	
	public void salvarMembro(UUID idGrupo, UUID idMembro) {
		GrupoMembroPK pk = new GrupoMembroPK(idGrupo, idMembro);
		GrupoMembro gm = new GrupoMembro(pk);
		grupoMembroRepository.save(gm);
	}
	
	public boolean isUsuarioMembroDoGrupo(UUID idGrupo, UUID idUsuario) {
		return grupoMembroRepository.existsByPkIdGrupoAndPkIdUsuario(idGrupo, idUsuario);
	}
	
}
