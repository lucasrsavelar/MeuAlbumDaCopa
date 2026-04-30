package lrsa.mac_backend.domain.solicitacaoAmizade;

import java.util.UUID;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "SOLICITACAO_AMIZADE")
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class SolicitacaoAmizade {

	@Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID idSolicitacao;
	
	@Column(name = "ID_ENVIOU", nullable = false)
	private UUID idEnviou;
	
	@Column(name = "ID_RECEBEU", nullable = false)
	private UUID idRecebeu;
	
}
