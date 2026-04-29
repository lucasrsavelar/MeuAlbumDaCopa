package lrsa.mac_backend.domain.figurinhaUsuario;

import jakarta.persistence.Column;
import jakarta.persistence.EmbeddedId;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;

@Entity
@Table(name = "FIGURINHAS_USUARIO")
@Getter
@Setter
public class FigurinhaUsuario {
	
	@EmbeddedId
	private FigurinhaUsuarioPK pk;
	
	@Column(name = "QUANTIDADE", nullable = false)
	private Integer quantidade;

}
