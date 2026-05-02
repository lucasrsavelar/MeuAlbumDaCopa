package lrsa.mac_backend.domain.amizade;

import java.util.List;
import java.util.UUID;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import lrsa.mac_backend.auth.currentUser.CurrentUser;

@RestController
@RequestMapping("/amizade")
public class AmizadeController {
	
	private final AmizadeService amizadeService;
	
	public AmizadeController(AmizadeService amizadeService) {
		this.amizadeService = amizadeService;
	}
	
	@GetMapping("/byUsuario")
	public ResponseEntity<?> findAmizadesByUser(@CurrentUser UUID idUsuario) {
		List<String> amizades = amizadeService.findAmizadesByUser(idUsuario);
		return new ResponseEntity<>(amizades, HttpStatus.OK); 
	}

}
