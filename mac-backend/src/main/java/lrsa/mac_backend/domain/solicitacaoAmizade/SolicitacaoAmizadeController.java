package lrsa.mac_backend.domain.solicitacaoAmizade;

import java.util.List;
import java.util.UUID;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import lrsa.mac_backend.auth.currentUser.CurrentUser;

@RestController
@RequestMapping("/solicitacao-amizade")
public class SolicitacaoAmizadeController {

	private final SolicitacaoAmizadeService solicitacaoAmizadeService;
	
	public SolicitacaoAmizadeController(SolicitacaoAmizadeService solicitacaoAmizadeService) {
		this.solicitacaoAmizadeService = solicitacaoAmizadeService;
	}
	
	@PostMapping("/enviar")
    public ResponseEntity<?> enviar(@CurrentUser UUID idUsuario, @RequestParam String usernameDestino) {
		solicitacaoAmizadeService.enviarSolicitacao(idUsuario, usernameDestino);
        return ResponseEntity.noContent().build();
    }
	
	@GetMapping("/recebidas")
    public ResponseEntity<List<SolicitacaoAmizadeDTO>> recebidas(@CurrentUser UUID idUsuario) {
        return ResponseEntity.ok(solicitacaoAmizadeService.findSolicitacoesRecebidas(idUsuario));
    }
	
	@PostMapping("/aceitar")
    public ResponseEntity<?> aceitar(@CurrentUser UUID idUsuario, @RequestBody UUID idSolicitacao) {
		solicitacaoAmizadeService.aceitarSolicitacao(idUsuario, idSolicitacao);
        return ResponseEntity.noContent().build();
    }
	
	@PostMapping("/recusar")
    public ResponseEntity<?> recusar(@CurrentUser UUID idUsuario, @RequestBody UUID idSolicitacao) {
		solicitacaoAmizadeService.recusarSolicitacao(idUsuario, idSolicitacao);
        return ResponseEntity.noContent().build();
    }
	
}
