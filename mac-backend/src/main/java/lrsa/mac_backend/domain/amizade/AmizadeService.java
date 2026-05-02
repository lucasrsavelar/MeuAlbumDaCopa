package lrsa.mac_backend.domain.amizade;

import java.util.List;
import java.util.UUID;

import org.springframework.stereotype.Service;

import lrsa.mac_backend.domain.macUsuario.MACUsuarioService;

@Service
public class AmizadeService {
	
	private final AmizadeRepository amizadeRepository;
	private final MACUsuarioService usuarioService;
	
	public AmizadeService(AmizadeRepository amizadeRepository, MACUsuarioService usuarioService) {
		this.amizadeRepository = amizadeRepository;
		this.usuarioService = usuarioService;
	}
	
	public List<String> findAmizadesByUser(UUID idUsuario) {
		List<UUID> idsAmizades =  amizadeRepository.findByIdUsuario(idUsuario).orElse(List.of());
		return usuarioService.findUsernamesByIds(idsAmizades);
	}
	
	public void salvar(UUID idUsuario, UUID idAmigo) {
		AmizadePK pk = new AmizadePK(idUsuario, idAmigo);
		Amizade amizade = new Amizade(pk);
		amizadeRepository.save(amizade);
	}

}
