package lrsa.mac_backend.domain.trocas;

import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

@Repository
public class TrocasRepository {
	
	private static final String EU_OFERECO = "EU_OFERECO";
	
	private final JdbcTemplate jdbc;

    public TrocasRepository(JdbcTemplate jdbc) {
        this.jdbc = jdbc;
    }
    
    public List<TrocasDTO> findTrocas(UUID idUsuario) {
        String sql = """
        		SELECT 
        			split_part(au.email, '@', 1) AS username_amigo,
        			col_eu.id_figurinha,
        			'EU_OFEREÇO' AS tipo
        		FROM AMIZADES f
        		JOIN auth.users au ON au.id = f.id_amigo
        		JOIN FIGURINHAS_USUARIO col_eu ON col_eu.ID_USUARIO = :idUsuario AND col_eu.quantidade > 1
        		LEFT JOIN FIGURINHAS_USUARIO col_amigo ON col_amigo.ID_USUARIO = f.ID_USUARIO AND col_amigo.id_figurinha = col_eu.id_figurinha
        		WHERE f.ID_USUARIO = :idUsuario AND col_amigo.id_figurinha IS NULL

        		UNION ALL

        			SELECT 
        				split_part(au.email, '@', 1) AS username_amigo,
        				col_amigo.id_figurinha,
        				'AMIGO_OFERECE' AS tipo
        			FROM AMIZADES f
        			JOIN auth.users au ON au.id = f.id_amigo
        			JOIN FIGURINHAS_USUARIO col_amigo ON col_amigo.id_usuario = f.id_amigo AND col_amigo.quantidade > 1
        			LEFT JOIN FIGURINHAS_USUARIO col_eu ON col_eu.id_usuario = :idUsuario  AND col_eu.id_figurinha = col_amigo.id_figurinha
        			WHERE f.id_usuario = :idUsuario AND col_eu.id_figurinha IS NULL
        		""";

        Map<String, TrocasDTO> agrupado = new LinkedHashMap<>();

        jdbc.query(sql, new Object[]{idUsuario, idUsuario}, (rs) -> {
            String username = rs.getString("username_amigo");
            int idFigurinha = rs.getInt("id_figurinha");
            String tipo = rs.getString("tipo");

            TrocasDTO dto = agrupado.computeIfAbsent(username, u -> {
                TrocasDTO d = new TrocasDTO();
                d.setUsernameAmigo(u);
                d.setEuOfereço(new ArrayList<>());
                d.setAmigoOferece(new ArrayList<>());
                return d;
            });

            if (EU_OFERECO.equals(tipo)) dto.getEuOfereço().add(idFigurinha);
            else dto.getAmigoOferece().add(idFigurinha);
        });

        return new ArrayList<>(agrupado.values());
    }

}
