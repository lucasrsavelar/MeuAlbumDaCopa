package lrsa.mac_backend.auth.refreshToken;

import java.time.Instant;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lrsa.mac_backend.domain.macUsuario.MACUsuario;

@Entity
@Table(name = "REFRESH_TOKENS")
@Getter 
@Setter 
@NoArgsConstructor
public class RefreshToken {

    @Id
    @Column(name = "ID_REFRESH_TOKEN")
    @GeneratedValue(strategy = GenerationType.UUID)
    private String idRefreshToken;

    @Column(nullable = false, unique = true, length = 512)
    private String token;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "ID_USUARIO", nullable = false)
    private MACUsuario user;

    @Column(name = "EXPIRACAO", nullable = false)
    private Instant expiracao;

    @Column(name = "REVOGADO", nullable = false)
    private boolean revogado = false;

    public RefreshToken(MACUsuario user, String token, Instant expiracao) {
        this.user = user;
        this.token = token;
        this.expiracao = expiracao;
    }

    public boolean isExpirado() {
        return Instant.now().isAfter(this.expiracao);
    }
    
    public boolean isRevogado() {
    	return this.revogado;
    }

    public void revogar() {
        this.revogado = true;
    }
}
