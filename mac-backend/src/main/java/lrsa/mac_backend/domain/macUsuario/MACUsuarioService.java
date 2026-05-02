package lrsa.mac_backend.domain.macUsuario;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.stereotype.Service;

@Service
public class MACUsuarioService {
	
	private static final String WILDCARD = "%";
	
	private final MACUsuarioRepository usuarioRepository;
	
	public MACUsuarioService(MACUsuarioRepository usuarioRepository) {
		this.usuarioRepository = usuarioRepository;
	}
	
	public Optional<MACUsuario> findByIdUsuario(UUID idUsuario) {
		return usuarioRepository.findByIdUsuario(idUsuario);
	}
	
	public Optional<MACUsuario> findByUsername(String username) {
		return usuarioRepository.findByUsername(username);
	}
	
	public Optional<UUID> findIdByUsername(String username) {
	    return usuarioRepository.findIdByUsername(username);
	}
	
	public String findUsernameById(UUID idUsuario) {
		return usuarioRepository.findUsernameByIdUsuario(idUsuario);
	}
	
	public List<String> findUsernamesByIds(List<UUID> idsUsuarios) {
		return usuarioRepository
				.findByIdUsuarioIn(idsUsuarios)
				.stream()
				.map(u -> u.getUsername())
				.toList();
	}
	
	public List<String> buscarPorUsername(String termo, UUID idUsuarioLogado) {
        return usuarioRepository
        		.buscarPorUsername(termo + WILDCARD, idUsuarioLogado)
        		.orElse(List.of());
    }
	
	public boolean usernameExiste(String username) {
		return usuarioRepository.existsByUsername(username);
	}
	
	public void salvar(MACUsuario usuario) {
		usuarioRepository.save(usuario);
	}

}
