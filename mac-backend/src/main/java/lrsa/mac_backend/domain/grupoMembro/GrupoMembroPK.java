package lrsa.mac_backend.domain.grupoMembro;

import java.io.Serializable;
import java.util.UUID;

import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Embeddable
@Data
@AllArgsConstructor
@NoArgsConstructor
public class GrupoMembroPK implements Serializable {
	
	private static final long serialVersionUID = -2613132726312117414L;

	@Column(name = "ID_GRUPO", nullable = false)
    private UUID idGrupo;

    @Column(name = "ID_USUARIO", nullable = false)
    private UUID idUsuario;

}
