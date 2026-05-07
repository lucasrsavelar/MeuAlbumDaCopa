package lrsa.mac_backend.domain.propostaTrocaFigurinha;

import java.util.UUID;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "PROPOSTA_TROCA_FIGURINHA",
    uniqueConstraints = @UniqueConstraint(columnNames = {"id_proposta", "id_figurinha", "id_envia"})
)
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class PropostaTrocaFigurinha {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "ID_PROP_TROCA_FIG")
    private UUID idPropostaTrocaFigurinha;

    @Column(name = "ID_PROPOSTA", nullable = false)
    private UUID idProposta;

    @Column(name = "ID_ENVIA", nullable = false)
    private UUID idEnvia;

    @Column(name = "ID_RECEBE", nullable = false)
    private UUID idRecebe;

    @Column(name = "ID_FIGURINHA", nullable = false)
    private Integer idFigurinha;

}
