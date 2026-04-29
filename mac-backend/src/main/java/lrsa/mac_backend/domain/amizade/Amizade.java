package lrsa.mac_backend.domain.amizade;

import jakarta.persistence.EmbeddedId;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;

@Entity
@Table(name = "AMIZADES")
@Getter
@Setter
public class Amizade {
	
	@EmbeddedId
	private AmizadePK pk;

}
