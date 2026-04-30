package lrsa.mac_backend.domain.trocas;

import java.util.List;
import java.util.UUID;

import org.springframework.stereotype.Service;

@Service
public class TrocasService {

	private final TrocasRepository trocasRepository;
	
	public TrocasService(TrocasRepository trocasRepository) {
		this.trocasRepository = trocasRepository;
	}
	
	public List<TrocasDTO> findTrocas(UUID idUsuario) {
		return trocasRepository.findTrocas(idUsuario);
	}
}
