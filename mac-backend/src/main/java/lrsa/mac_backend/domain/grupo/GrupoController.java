package lrsa.mac_backend.domain.grupo;

import java.util.UUID;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import lrsa.mac_backend.auth.currentUser.CurrentUser;

@RestController
@RequestMapping("/grupo")
public class GrupoController {

	private final GrupoService grupoService;
	
	public GrupoController(GrupoService grupoService) {
		this.grupoService = grupoService;
	}
	
	@PostMapping("/criar")
	public ResponseEntity<?> criar(@CurrentUser UUID idUsuario, @RequestParam String nome) {
		grupoService.criarGrupo(idUsuario, nome);
		return ResponseEntity.noContent().build();
	}
	
	@PostMapping("/convidar") 
	public ResponseEntity<?> convidar(@CurrentUser UUID idUsuario, @RequestParam String nomeGrupo, @RequestParam String usernameConvidado) {
		grupoService.convidarParaGrupo(idUsuario, nomeGrupo, usernameConvidado);
		return ResponseEntity.noContent().build();
	}
	
}