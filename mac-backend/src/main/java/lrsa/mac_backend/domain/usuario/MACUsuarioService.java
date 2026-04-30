package lrsa.mac_backend.domain.usuario;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.stereotype.Service;

@Service
public class MACUsuarioService {
	
	private final MACUsuarioRepository usuarioRepository;
	
	public MACUsuarioService(MACUsuarioRepository usuarioRepository) {
		this.usuarioRepository = usuarioRepository;
	}
	
	public Optional<UUID> findIdByUsername(String username) {
	    return usuarioRepository.findIdByUsername(username);
	}
	
	public String findUsernameById(UUID idUsuario) {
		return usuarioRepository.findUsernameById(idUsuario);
	}
	
	public List<String> findUsernamesByIds(List<UUID> idsUsuarios) {
		return usuarioRepository.findUsernamesByIds(idsUsuarios);
	}
	
	public List<String> buscarPorUsername(String termo, UUID idUsuarioLogado) {
        return usuarioRepository.buscarPorUsername(termo, idUsuarioLogado);
    }

}
