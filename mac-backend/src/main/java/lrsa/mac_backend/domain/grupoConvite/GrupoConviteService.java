package lrsa.mac_backend.domain.grupoConvite;

import java.util.List;
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
	
	public boolean isUsuarioConvidadoAoGrupo(UUID idGrupo, UUID idConvidado) {
		return grupoConviteRepository.existsByIdGrupoAndIdConvidado(idGrupo, idConvidado);
	}
	
	public void deletarConvite(GrupoConvite convite) {
		grupoConviteRepository.delete(convite);
	}
	
	public List<GrupoConviteDTO> findConvitesRecebidos(UUID idUsuario) {
        return grupoConviteRepository.findConvitesRecebidos(idUsuario)
            .stream()
            .map(row -> new GrupoConviteDTO(
                UUID.fromString(row[0].toString()),
                row[1].toString(),
                row[2].toString()
            ))
            .toList();
    }
	
	public void deletarTodosConvitesGrupo(UUID idGrupo) {
		grupoConviteRepository.deleteByIdGrupo(idGrupo);
	}
}
