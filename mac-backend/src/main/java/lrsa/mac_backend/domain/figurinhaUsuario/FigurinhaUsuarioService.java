package lrsa.mac_backend.domain.figurinhaUsuario;

import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.UUID;

import org.springframework.stereotype.Service;

import lrsa.mac_backend.domain.figurinha.FigurinhaService;

@Service
public class FigurinhaUsuarioService {
	
	private final FigurinhaUsuarioRepository figurinhaUsuarioRepository;
	private final FigurinhaService figurinhaService;
	
	public FigurinhaUsuarioService(FigurinhaUsuarioRepository figurinhaUsuarioRepository, FigurinhaService figurinhaService) {
		this.figurinhaUsuarioRepository = figurinhaUsuarioRepository;
		this.figurinhaService = figurinhaService;
	}
	
	public Map<Integer, Integer> findFigurinhasByUser(UUID idUsuario) {
		return figurinhaUsuarioRepository.findFigurinhasByUser(idUsuario).orElse(Map.of());
	}
	
	public List<Integer> findIdsFigurinhasByUser(UUID idUsuario) {
	    return findFigurinhasByUser(idUsuario)
	            .keySet()
	            .stream()
	            .toList();
	}
	
	public List<Integer> findFigurinhasFaltantesByUser(UUID idUsuario) {
	    List<Integer> allFigurinhas = figurinhaService.findAllIdsFigurinhas();

	    Set<Integer> figurinhasUsuario = new HashSet<>(
	    	    this.findIdsFigurinhasByUser(idUsuario)
	    	);

	    return allFigurinhas.stream()
	            .filter(id -> !figurinhasUsuario.contains(id))
	            .toList();
	}
	
	public List<Integer> findFigurinhasRepetidasByUser(UUID idUsuario) {
		return figurinhaUsuarioRepository.findFigurinhasRepetidasByUser(idUsuario).orElse(List.of());
	}
	
	public void adicionarFigurinhas(UUID idUsuario, List<FigurinhaUsuarioDTO> figurinhas) {
		for(FigurinhaUsuarioDTO figurinha : figurinhas)
			figurinhaUsuarioRepository.upsert(idUsuario, figurinha.getIdFigurinha(), figurinha.getQuantidade());
	}

}
