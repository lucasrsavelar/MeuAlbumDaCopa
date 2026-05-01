package lrsa.mac_backend.domain.usuario;

import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

import org.springframework.dao.EmptyResultDataAccessException;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

@Repository
public class MACUsuarioRepository {
	
	private static final String DOMINIO_EMAIL = "@mac.com";

    private final JdbcTemplate jdbc;

    public MACUsuarioRepository(JdbcTemplate jdbc) {
        this.jdbc = jdbc;
    }

    public String findUsernameById(UUID idUsuario) {
        String email = jdbc.queryForObject(
            "SELECT email FROM auth.users WHERE id = ?",
            String.class,
            idUsuario
        );

        return email != null ? email.split("@")[0] : null;
    }
    
    public List<String> findUsernamesByIds(List<UUID> idsUsuarios) {
        if (idsUsuarios.isEmpty()) return List.of();

        String placeholders = idsUsuarios.stream()
            .map(id -> "?")
            .collect(Collectors.joining(", "));

        return jdbc.query(
            "SELECT email FROM auth.users WHERE id IN (" + placeholders + ")",
            idsUsuarios.toArray(),
            (rs, _) -> rs.getString("email").split("@")[0]
        );
    }
    
    public Optional<UUID> findIdByUsername(String username) {
        String email = username + DOMINIO_EMAIL;
        try {
            UUID id = jdbc.queryForObject(
                "SELECT id FROM auth.users WHERE email = ?",
                UUID.class,
                email
            );
            return Optional.ofNullable(id);
        } catch (EmptyResultDataAccessException e) {
            return Optional.empty();
        }
    }
    
    public List<String> buscarPorUsername(String termo, UUID idUsuario) {
        return jdbc.query(
            """
            SELECT split_part(email, '@', 1) AS username
            FROM auth.users
            WHERE split_part(email, '@', 1) ILIKE ?
              AND id != ?
            LIMIT 10
            """,
            new Object[]{ termo + "%", idUsuario },
            (rs, _) -> rs.getString("username")
        );
    }
    
}
