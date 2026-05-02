package lrsa.mac_backend.domain.trocas;

import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

import org.springframework.jdbc.core.namedparam.MapSqlParameterSource;
import org.springframework.jdbc.core.namedparam.NamedParameterJdbcTemplate;
import org.springframework.stereotype.Repository;

@Repository
public class TrocasRepository {

    private static final String EU_OFERECO = "EU_OFERECO";

    private final NamedParameterJdbcTemplate namedJdbc;

    public TrocasRepository(NamedParameterJdbcTemplate namedJdbc) {
        this.namedJdbc = namedJdbc;
    }

    public List<TrocasDTO> findTrocas(UUID idUsuario) {
        String sql = """
                SELECT
                    au.username AS username_amigo,
                    col_eu.id_figurinha,
                    'EU_OFERECO' AS tipo
                FROM AMIZADES f
                JOIN mac_usuario au ON au.id_usuario = f.id_amigo
                JOIN FIGURINHAS_USUARIO col_eu ON col_eu.ID_USUARIO = :idUsuario AND col_eu.quantidade > 1
                LEFT JOIN FIGURINHAS_USUARIO col_amigo ON col_amigo.ID_USUARIO = f.id_amigo AND col_amigo.id_figurinha = col_eu.id_figurinha
                WHERE f.ID_USUARIO = :idUsuario AND col_amigo.id_figurinha IS NULL

                UNION ALL

                SELECT
                    au.username AS username_amigo,
                    col_amigo.id_figurinha,
                    'AMIGO_OFERECE' AS tipo
                FROM AMIZADES f
                JOIN mac_usuario au ON au.id_usuario = f.id_amigo
                JOIN FIGURINHAS_USUARIO col_amigo ON col_amigo.id_usuario = f.id_amigo AND col_amigo.quantidade > 1
                LEFT JOIN FIGURINHAS_USUARIO col_eu ON col_eu.id_usuario = :idUsuario AND col_eu.id_figurinha = col_amigo.id_figurinha
                WHERE f.id_usuario = :idUsuario AND col_eu.id_figurinha IS NULL
                """;

        MapSqlParameterSource params = new MapSqlParameterSource()
                .addValue("idUsuario", idUsuario);

        Map<String, TrocasDTO> agrupado = new LinkedHashMap<>();

        namedJdbc.query(sql, params, (rs) -> {
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