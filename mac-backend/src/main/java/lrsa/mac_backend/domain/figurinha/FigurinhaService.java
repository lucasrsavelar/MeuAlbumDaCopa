package lrsa.mac_backend.domain.figurinha;

import java.util.List;

import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;

@Service
public class FigurinhaService {

	private final FigurinhaRepository figurinhaRepository;
	
	public FigurinhaService(FigurinhaRepository figurinhaRepository) {
		this.figurinhaRepository = figurinhaRepository;
	}
	
	@Cacheable("figurinhas")
	public List<Figurinha> findAll() {
		return figurinhaRepository.findAllOrdenadas();
	}
	
	public void salvar(Figurinha figurinha) {
		figurinhaRepository.save(figurinha);
	}
	
	public void salvarLista(List<Figurinha> figurinhas) {
		figurinhaRepository.saveAll(figurinhas);
	}
	
	@CacheEvict(value = "figurinhas", allEntries = true)
	public void limpaCache() {}
		
}