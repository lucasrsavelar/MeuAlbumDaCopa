package lrsa.mac_backend.domain.pais;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.SequenceGenerator;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;

@Entity
@Table(name = "PAISES")
@Getter
@Setter
public class Pais {

    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "paises_seq")
    @SequenceGenerator(name = "paises_seq", sequenceName = "PAISES_SEQ", allocationSize = 1)
    @Column(name = "ID_PAIS")
    private Integer id;

    @Column(name = "CODIGO_PAIS", unique = true, nullable = false, length = 5)
    private String codigoPais;

    @Column(name = "NOME_PAIS", unique = true, nullable = false, length = 100)
    private String nomePais;

}
