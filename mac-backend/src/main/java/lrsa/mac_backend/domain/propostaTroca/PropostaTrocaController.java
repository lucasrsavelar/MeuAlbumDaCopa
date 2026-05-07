package lrsa.mac_backend.domain.propostaTroca;

import java.util.List;
import java.util.UUID;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import lrsa.mac_backend.auth.currentUser.CurrentUser;

@RestController
@RequestMapping("/proposta-troca")
public class PropostaTrocaController {
	
	private final PropostaTrocaService propostaTrocaService;
	
	public PropostaTrocaController(PropostaTrocaService propostaTrocaService) {
		this.propostaTrocaService = propostaTrocaService;
	}
	
	@PostMapping("/enviar")
	public ResponseEntity<?> enviarPropostaTroca(@CurrentUser UUID idUsuario, PropostaTrocaEnviadaDTO proposta) {
		propostaTrocaService.enviarPropostaTroca(idUsuario, proposta);
		return ResponseEntity.noContent().build();
	}
	
	@PostMapping("/aceitar")
	public ResponseEntity<?> aceitarPropostaTroca(@CurrentUser UUID idUsuario, UUID idProposta) {
		propostaTrocaService.aceitarPropostaTroca(idUsuario, idProposta);
		return ResponseEntity.noContent().build();
	}
	
	@GetMapping("/recebidas")
	public ResponseEntity<List<PropostaTrocaRecebidaDTO>> recebidas(@CurrentUser UUID idUsuario) {
	    return ResponseEntity.ok(propostaTrocaService.findPropostasRecebidas(idUsuario));
	}

	@GetMapping("/enviadas")
	public ResponseEntity<List<PropostaTrocaRecebidaDTO>> enviadas(@CurrentUser UUID idUsuario) {
	    return ResponseEntity.ok(propostaTrocaService.findPropostasEnviadas(idUsuario));
	}
	
	@PostMapping("/recusar")
	public ResponseEntity<?> recusarPropostaTroca(@CurrentUser UUID idUsuario, UUID idProposta) {
		propostaTrocaService.recusarPropostaTroca(idUsuario, idProposta);
		return ResponseEntity.noContent().build();
	}
	
	@DeleteMapping("/cancelar")
	public ResponseEntity<?> cancelarPropostaTroca(@CurrentUser UUID idUsuario, UUID idProposta) {
		propostaTrocaService.cancelarPropostaTroca(idUsuario, idProposta);
		return ResponseEntity.noContent().build();
	}

}
