package lrsa.mac_backend.domain.trocas;

import java.util.List;
import java.util.UUID;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import lrsa.mac_backend.auth.current_user.CurrentUser;

@RestController
@RequestMapping("/trocas")
public class TrocasController {

	private final TrocasService trocasService;
	
	public TrocasController(TrocasService trocasService) {
		this.trocasService = trocasService;
	}
	
	@GetMapping("/procurar")
	public ResponseEntity<?> findTrocas(@CurrentUser UUID idUsuario) {
		List<TrocasDTO> trocas = trocasService.findTrocas(idUsuario);
		return new ResponseEntity<>(trocas, HttpStatus.OK);
	}
}
