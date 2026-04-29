package lrsa.mac_backend.domain.figurinhaUsuario;

import java.io.Serializable;
import java.util.UUID;

import jakarta.persistence.Embeddable;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Embeddable
@Data
@AllArgsConstructor
@NoArgsConstructor
public class FigurinhaUsuarioPK implements Serializable {

	private static final long serialVersionUID = 6317858943833780779L;
	
	private UUID idUsuario;
	private Integer idFigurinha;

}
