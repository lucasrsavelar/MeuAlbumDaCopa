package lrsa.mac_backend.domain.grupo;

import java.util.Map;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class GrupoDTO {
	
	private String nomeGrupo;
	private Map<String, GrupoRole> membros;

}
