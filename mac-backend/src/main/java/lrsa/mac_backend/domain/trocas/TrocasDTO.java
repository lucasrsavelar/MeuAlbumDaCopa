package lrsa.mac_backend.domain.trocas;

import java.util.List;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class TrocasDTO {
	private String usernameAmigo;
    private List<Integer> euOfereço;
    private List<Integer> amigoOferece;
}