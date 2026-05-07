package lrsa.mac_backend.domain.propostaTroca;

import java.util.List;
import java.util.UUID;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class PropostaTrocaRecebidaDTO {
	
    private UUID idProposta;
    private String usernameEnviou;
    private List<Integer> figurinhasOferecidas;
    private List<Integer> figurinhasDesejadas;

}
