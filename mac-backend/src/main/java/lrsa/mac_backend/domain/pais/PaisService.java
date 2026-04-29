package lrsa.mac_backend.domain.pais;

import java.util.List;

import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;

import lrsa.mac_backend.exceptions.ItemNotFoundException;
import lrsa.mac_backend.utils.Messages;

@Service
public class PaisService {
	
	private final PaisRepository paisRepository;
	
	public PaisService(PaisRepository paisRepository) {
		this.paisRepository = paisRepository;
	}
	
	@Cacheable("paises")
	public List<Pais> findAll() {
		return paisRepository.findAll();
	}
	
	public Pais getPaisByCodigo(String codigo) {
		return paisRepository.findByCodigoPais(codigo).orElseThrow(() -> new ItemNotFoundException(Messages.ITEM_NOT_FOUND));
	}

}
