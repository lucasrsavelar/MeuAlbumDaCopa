package lrsa.mac_backend.domain.figurinha;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/figurinha")
public class FigurinhaController {

	private final FigurinhaService figurinhaService;
	
	public FigurinhaController(FigurinhaService figurinhaService) {
		this.figurinhaService = figurinhaService;
	}
	
	@GetMapping("/all")
	public ResponseEntity<?> findAll() {
		List<Figurinha> allFigurinhas = figurinhaService.findAll();
        return new ResponseEntity<>(allFigurinhas, HttpStatus.OK);
	}
	
	@GetMapping("/limpar-cache")
	@PreAuthorize("hasRole('ADMIN')")
	public ResponseEntity<?> limparCache() {
		figurinhaService.limpaCache();
		return ResponseEntity.noContent().build();
	}
	
}
