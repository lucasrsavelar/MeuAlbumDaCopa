package lrsa.mac_backend.domain.figurinhaUsuario;

import java.util.List;
import java.util.Map;
import java.util.UUID;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import lrsa.mac_backend.auth.CurrentUser;

@RestController
@RequestMapping("/figurinhas-usuario")
public class FigurinhaUsuarioController {
	
	private final FigurinhaUsuarioService figurinhaUsuarioService;
	
	public FigurinhaUsuarioController(FigurinhaUsuarioService figurinhaUsuarioService) {
		this.figurinhaUsuarioService = figurinhaUsuarioService;
	}
	
	@GetMapping("/byUsuario")
	public ResponseEntity<?> findFigurinhasByUser(@CurrentUser UUID idUsuario) {
		Map<Integer, Integer> figurinhas = figurinhaUsuarioService.findFigurinhasByUser(idUsuario);
		return new ResponseEntity<>(figurinhas, HttpStatus.OK);
	}
		
	@PostMapping("/adicionar")
	public ResponseEntity<?> adicionarFigurinhas(@CurrentUser UUID idUsuario, @RequestBody List<FigurinhaUsuarioDTO> data) {
		figurinhaUsuarioService.adicionarFigurinhas(idUsuario, data);
		return ResponseEntity.noContent().build();
	}

}
