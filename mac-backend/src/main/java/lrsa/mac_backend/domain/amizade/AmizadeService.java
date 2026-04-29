package lrsa.mac_backend.domain.amizade;

import java.util.List;
import java.util.UUID;

import org.springframework.stereotype.Service;

@Service
public class AmizadeService {
	
	private final AmizadeRepository amizadeRepository;
	
	public AmizadeService(AmizadeRepository amizadeRepository) {
		this.amizadeRepository = amizadeRepository;
	}
	
	public List<UUID> findAmizadesByUser(UUID idUsuario) {
		return amizadeRepository.findByIdUsuario(idUsuario).orElse(List.of());
	}

}
