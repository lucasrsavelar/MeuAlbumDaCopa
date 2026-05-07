package lrsa.mac_backend.domain.figurinhaUsuario;

import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;

@Service
public class FigurinhaUsuarioService {
	
	private final FigurinhaUsuarioRepository figurinhaUsuarioRepository;
	
	public FigurinhaUsuarioService(FigurinhaUsuarioRepository figurinhaUsuarioRepository) {
		this.figurinhaUsuarioRepository = figurinhaUsuarioRepository;
	}
	
	public Map<Integer, Integer> findFigurinhasByUser(UUID idUsuario) {
		List<Object[]> figurinhasUsuario = figurinhaUsuarioRepository.findFigurinhasByUser(idUsuario).orElse(List.of());
		
		if(figurinhasUsuario.isEmpty())
			return Map.of();
		
		return figurinhasUsuario.stream()
		        .collect(Collectors.toMap(
		                row -> ((Number) row[0]).intValue(),
		                row -> ((Number) row[1]).intValue()
		            ));
		
		
	}
			
	public void adicionarFigurinhas(UUID idUsuario, List<FigurinhaUsuarioDTO> figurinhas) {
		for(FigurinhaUsuarioDTO figurinha : figurinhas)
			figurinhaUsuarioRepository.upsertSum(idUsuario, figurinha.getIdFigurinha(), figurinha.getQuantidade());
	}
	
	public void corrigirFigurinhas(UUID idUsuario, List<FigurinhaUsuarioDTO> figurinhas) {
		for(FigurinhaUsuarioDTO figurinha : figurinhas) {
			
			int quantidade = figurinha.getQuantidade();
			
			if(quantidade < 0)
				continue;
			
			else if(quantidade == 0)
				figurinhaUsuarioRepository.deletar(idUsuario, figurinha.getIdFigurinha());
			
			figurinhaUsuarioRepository.upsertSet(idUsuario, figurinha.getIdFigurinha(), figurinha.getQuantidade());
			
		}
	}
	
	public boolean usuarioPossuiFigurinhaDaLista(UUID idUsuario, List<Integer> idsFigurinhas) {
		return figurinhaUsuarioRepository.existsByPkIdUsuarioAndPkIdFigurinhaIn(idUsuario, idsFigurinhas);
	}
	
	public List<FigurinhaUsuario> findRepetidasDaLista(UUID idUsuario, List<Integer> idsFigurinhas, Integer quantidade) {
		return figurinhaUsuarioRepository.findByPkIdUsuarioAndPkIdFigurinhaInAndQuantidadeGreaterThanEqual(idUsuario, idsFigurinhas, quantidade);
	}

}
