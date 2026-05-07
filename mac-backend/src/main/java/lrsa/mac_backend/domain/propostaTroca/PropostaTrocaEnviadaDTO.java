package lrsa.mac_backend.domain.propostaTroca;

import java.util.List;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class PropostaTrocaEnviadaDTO {
	
    private String usernameDestino;
    private List<Integer> figurinhasOferecidas;
    private List<Integer> figurinhasDesejadas;
    
}
