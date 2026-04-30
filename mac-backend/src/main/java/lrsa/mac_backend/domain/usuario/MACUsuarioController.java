package lrsa.mac_backend.domain.usuario;

import java.util.UUID;

import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import lrsa.mac_backend.auth.CurrentUser;

@RestController
@RequestMapping("/mac-user")
public class MACUsuarioController {
	
	private final MACUsuarioService usuarioService;
	
	public MACUsuarioController(MACUsuarioService usuarioService) {
		this.usuarioService = usuarioService;
	}
	
	@GetMapping("/me")
	public ResponseEntity<?> me(@CurrentUser UUID idUsuario) {
		String username = usuarioService.findUsernameById(idUsuario);
	    return ResponseEntity.ok()
	        .contentType(MediaType.APPLICATION_JSON)
	        .body("\"" + username + "\"");
	}
	
	@GetMapping("/buscar")
	public ResponseEntity<?> buscar(@CurrentUser UUID idUsuario, @RequestParam String termo) {
		return ResponseEntity.ok(usuarioService.buscarPorUsername(termo, idUsuario));
	}

}
