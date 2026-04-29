package lrsa.mac_backend.domain.amizade;

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
public class AmizadePK implements Serializable {

	private static final long serialVersionUID = -7933366218940435000L;
	
	private UUID idUsuario;
	private UUID idAmigo;

}
