package lrsa.mac_backend.domain.pais;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/pais")
public class PaisController {
	
	private final PaisService paisService;
	
	public PaisController(PaisService paisService) {
		this.paisService = paisService;
	}
	
	@GetMapping("/all")
	public ResponseEntity<?> findAll() {
		List<Pais> allPaises = paisService.findAll();
		return new ResponseEntity<>(allPaises, HttpStatus.OK);
	}
	
	@GetMapping("/byCodigo")
	public ResponseEntity<?> getPaisByCodigo(@RequestParam String codigoPais) {
		Pais pais = paisService.getPaisByCodigo(codigoPais);
		return new ResponseEntity<>(pais, HttpStatus.OK);
	}

}
