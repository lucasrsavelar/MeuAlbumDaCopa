package lrsa.mac_backend.domain.grupo;

import java.util.UUID;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import lrsa.mac_backend.auth.currentUser.CurrentUser;
import lrsa.mac_backend.domain.grupoConvite.GrupoConviteService;

@RestController
@RequestMapping("/grupo")
public class GrupoController {

	private final GrupoService grupoService;
	private final GrupoConviteService grupoConviteService;
	
	public GrupoController(GrupoService grupoService, GrupoConviteService grupoConviteService) {
		this.grupoService = grupoService;
		this.grupoConviteService = grupoConviteService;
	}
	
	@PostMapping("/criar")
	public ResponseEntity<?> criar(@CurrentUser UUID idUsuario, @RequestParam String nomeGrupo) {
		grupoService.criarGrupo(idUsuario, nomeGrupo);
		return ResponseEntity.noContent().build();
	}
	
	@PostMapping("/convidar") 
	public ResponseEntity<?> convidar(@CurrentUser UUID idUsuario, @RequestParam String nomeGrupo, @RequestParam String usernameConvidado) {
		grupoService.convidarParaGrupo(idUsuario, nomeGrupo, usernameConvidado);
		return ResponseEntity.noContent().build();
	}
	
	@PostMapping("/aceitar-convite")
	public ResponseEntity<?> aceitarConvite(@CurrentUser UUID idUsuario, @RequestParam UUID idConvite) {
		grupoService.aceitarConvite(idUsuario, idConvite);
		return ResponseEntity.noContent().build();
	}
	
	@PostMapping("/recusar-convite")
	public ResponseEntity<?> recusarConvite(@CurrentUser UUID idUsuario, @RequestParam UUID idConvite) {
		grupoService.recusarConvite(idUsuario, idConvite);
		return ResponseEntity.noContent().build();
	}
	
	@PostMapping("/remover-membro")
	public ResponseEntity<?> removerMembroDoGrupo(@CurrentUser UUID idUsuario, @RequestParam String nomeGrupo, @RequestParam String usernameRemovido) {
		grupoService.removerMembroDoGrupo(idUsuario, nomeGrupo, usernameRemovido);
		return ResponseEntity.noContent().build();
	}
	
	@PostMapping("/sair")
	public ResponseEntity<?> sairDoGrupo(@CurrentUser UUID idUsuario, @RequestParam String nomeGrupo) {
		grupoService.sairDoGrupo(idUsuario, nomeGrupo);
		return ResponseEntity.noContent().build();
	}
	
	@GetMapping("/convites")
	public ResponseEntity<?> convites(@CurrentUser UUID idUsuario) {
		return ResponseEntity.ok(grupoConviteService.findConvitesRecebidos(idUsuario));
	}
	
}