package lrsa.mac_backend.domain.figurinha;

import java.util.List;

import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.context.annotation.Lazy;
import org.springframework.stereotype.Service;

@Service
public class FigurinhaService {

	private final FigurinhaService self;
	private final FigurinhaRepository figurinhaRepository;
	
	public FigurinhaService(@Lazy FigurinhaService self, FigurinhaRepository figurinhaRepository) {
		this.self = self;
		this.figurinhaRepository = figurinhaRepository;
	}
	
	@Cacheable("figurinhas")
	public List<Figurinha> findAll() {
		return figurinhaRepository.findAll();
	}
	
	public List<Integer> findAllIdsFigurinhas() {
        return self.findAll()
                   .stream()
                   .map(Figurinha::getId)
                   .toList();
    }
	
	@CacheEvict(value = "figurinhas", allEntries = true)
	public void limpaCache() {}
		
}