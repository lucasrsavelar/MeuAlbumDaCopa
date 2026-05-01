package lrsa.mac_backend.domain.figurinha;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.SequenceGenerator;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lrsa.mac_backend.domain.pais.Pais;

@Entity
@Table(name = "FIGURINHAS")
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class Figurinha {

    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "figurinhas_seq")
    @SequenceGenerator(name = "figurinhas_seq", sequenceName = "FIGURINHAS_SEQ", allocationSize = 1)
    @Column(name = "ID_FIGURINHA")
    private Integer id;

    @Column(name = "CODIGO_FIGURINHA", unique = true, nullable = false, length = 10)
    private String codigoFigurinha;

    @Column(name = "TIPO_FIGURINHA", nullable = false, length = 20)
    private String tipoFigurinha;

    @Column(name = "NOME", length = 100)
    private String nome;

    @Column(name = "POSICAO", length = 50)
    private String posicao;

    // FK principal para PAISES
    @ManyToOne
    @JoinColumn(name = "CODIGO_PAIS", referencedColumnName = "CODIGO_PAIS")
    private Pais pais;

}
