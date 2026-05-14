package lrsa.mac_backend.domain.grupo;

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
@Table(name = "GRUPOS")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Grupo {
	
	@Id
	@Column(name = "ID_GRUPO")
	@GeneratedValue(strategy = GenerationType.UUID)
	private UUID idGrupo;
	
	@Column(name = "NOME", nullable = false, length = 50)
	private String nome;
	
	@Column(name = "ID_CRIADOR", nullable = false)
	private UUID idCriador;

}
