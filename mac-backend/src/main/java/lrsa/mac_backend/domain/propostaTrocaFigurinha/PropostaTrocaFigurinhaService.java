package lrsa.mac_backend.domain.propostaTrocaFigurinha;

import java.util.List;
import java.util.UUID;

import org.springframework.stereotype.Service;

@Service
public class PropostaTrocaFigurinhaService {
	
	private final PropostaTrocaFigurinhaRepository propostaTrocaFigurinhaRepository;
	
	public PropostaTrocaFigurinhaService(PropostaTrocaFigurinhaRepository propostaTrocaFigurinhaRepository) {
		this.propostaTrocaFigurinhaRepository = propostaTrocaFigurinhaRepository;
	}
	
	public List<PropostaTrocaFigurinha> findByIdProposta(UUID idProposta) {
		return propostaTrocaFigurinhaRepository.findByIdProposta(idProposta).orElse(List.of());
	}
	
	public void salvarLista(List<PropostaTrocaFigurinha> lista) {
		propostaTrocaFigurinhaRepository.saveAll(lista);
	}
	
	public void deletarByIdProposta(UUID idProposta) {
		propostaTrocaFigurinhaRepository.deleteByIdProposta(idProposta);
	}

}
