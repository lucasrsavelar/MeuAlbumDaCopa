package lrsa.mac_backend.domain.grupoMembro;

import java.util.UUID;

import org.springframework.stereotype.Service;

@Service
public class GrupoMembroService {

	private final GrupoMembroRepository grupoMembroRepository;
	
	public GrupoMembroService(GrupoMembroRepository grupoMembroRepository) {
		this.grupoMembroRepository = grupoMembroRepository;
	}
	
	public void salvarMembro(UUID idGrupo, UUID idUsuario) {
		GrupoMembroPK pk = new GrupoMembroPK(idGrupo, idUsuario);
		GrupoMembro gm = new GrupoMembro(pk);
		grupoMembroRepository.save(gm);
	}
		
	public boolean isUsuarioMembroDoGrupo(UUID idGrupo, UUID idUsuario) {
		return grupoMembroRepository.existsByPkIdGrupoAndPkIdUsuario(idGrupo, idUsuario);
	}
	
	public long getNumeroMembrosGrupo(UUID idGrupo) {
		return grupoMembroRepository.countByPkIdGrupo(idGrupo);
	}
	
	public long getNumeroGruposUsuario(UUID idUsuario) {
		return grupoMembroRepository.countByPkIdUsuario(idUsuario);
	}
	
	public void removerMembroDoGrupo(UUID idGrupo, UUID idUsuario) {
		grupoMembroRepository.deleteByPkIdGrupoAndPkIdUsuario(idGrupo, idUsuario);
	}
	
	public void removerTodosMembrosGrupo(UUID idGrupo) {
		grupoMembroRepository.deleteByPkIdGrupo(idGrupo);
	}
	
}
