package lrsa.mac_backend.domain.solicitacaoAmizade;

import java.util.UUID;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class SolicitacaoAmizadeDTO {
	
	private UUID idSolicitacao;
    private String usernameEnviou;

}
