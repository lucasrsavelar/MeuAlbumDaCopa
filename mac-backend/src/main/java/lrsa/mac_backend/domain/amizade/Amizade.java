package lrsa.mac_backend.domain.amizade;

import jakarta.persistence.EmbeddedId;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "AMIZADES")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Amizade {
	
	@EmbeddedId
	private AmizadePK pk;

}
