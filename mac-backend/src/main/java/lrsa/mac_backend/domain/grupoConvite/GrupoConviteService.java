package lrsa.mac_backend.domain.grupoConvite;

import java.util.Optional;
import java.util.UUID;

import org.springframework.stereotype.Service;

@Service
public class GrupoConviteService {

	private final GrupoConviteRepository grupoConviteRepository;
	
	public GrupoConviteService(GrupoConviteRepository grupoConviteRepository) {
		this.grupoConviteRepository = grupoConviteRepository;
	}
	
	public void criarConvite(UUID idGrupo, UUID idConvidado) {
		
		GrupoConvite gc = new GrupoConvite();
		gc.setIdGrupo(idGrupo);
		gc.setIdConvidado(idConvidado);
		
		grupoConviteRepository.save(gc);
		
	}
	
	public Optional<GrupoConvite> buscarConviteById(UUID idConvite) {
		return grupoConviteRepository.findById(idConvite);
	}
}
