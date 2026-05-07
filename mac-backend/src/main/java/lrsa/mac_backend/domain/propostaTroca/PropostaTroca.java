package lrsa.mac_backend.domain.propostaTroca;

import java.util.UUID;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "PROPOSTA_TROCA")
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class PropostaTroca {
	
	@Id
	@Column(name = "ID_PROPOSTA_TROCA")
	private UUID idPropostaTroca;
	
	@Column(name = "ID_USUARIO_ENVIOU", nullable = false)
	private UUID idUsuarioEnviou;
	
	@Column(name = "ID_USUARIO_RECEBEU", nullable = false)
	private UUID idUsuarioRecebeu;

}
