package lrsa.mac_backend.domain.grupoMembro;

import jakarta.persistence.EmbeddedId;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "GRUPO_MEMBRO")
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class GrupoMembro {
	
	@EmbeddedId
    private GrupoMembroPK pk;

}
