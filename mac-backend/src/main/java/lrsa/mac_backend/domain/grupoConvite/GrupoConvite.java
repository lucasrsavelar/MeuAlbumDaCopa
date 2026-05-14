package lrsa.mac_backend.domain.grupoConvite;

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
@Table(name = "GRUPO_CONVITE")
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class GrupoConvite {

	@Id
	@Column(name = "ID_CONVITE")
	@GeneratedValue(strategy = GenerationType.UUID)
	private UUID idConvite;
	
	@Column(name = "ID_GRUPO", nullable = false)
	private UUID idGrupo;
	
	@Column(name = "ID_CONVIDADO", nullable = false)
	private UUID idConvidado;
	
}
