package lrsa.mac_backend.domain.grupoConvite;

import java.util.UUID;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class GrupoConviteDTO {
	
	private UUID idConvite;
    private String usernameEnviou;
    private String nomeGrupo;

}
