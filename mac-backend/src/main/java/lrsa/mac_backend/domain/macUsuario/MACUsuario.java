package lrsa.mac_backend.domain.macUsuario;

import java.util.Collection;
import java.util.List;
import java.util.UUID;

import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "MAC_USUARIO")
@Getter
@Setter
@NoArgsConstructor
public class MACUsuario implements UserDetails {
	
	private static final long serialVersionUID = 4401380199080962279L;

	@Id
    @GeneratedValue(strategy = GenerationType.UUID)
	@Column(name = "ID_USUARIO")
    private UUID idUsuario;
	
	@Column(name = "USERNAME", nullable = false, unique = true, length = 32)
	private String username;
	
	@Column(name = "SENHA", nullable = false)
    private String senha;
	
	@Column(name = "EMAIL", nullable = false, unique = true, length = 150)
    private String email;
	
	@Enumerated(EnumType.STRING)
    @Column(name = "ROLE", nullable = false, length = 20)
    private MACUsuarioRole role;
	
	@Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return List.of(new SimpleGrantedAuthority("ROLE_" + role.name()));
    }
	
	@Override
    public String getUsername() {
        return username;
    }

    @Override
    public String getPassword() {
        return senha;
    }

	@Override public boolean isAccountNonExpired()  { return true; }
    @Override public boolean isAccountNonLocked()   { return true; }
    @Override public boolean isCredentialsNonExpired() { return true; }
    @Override public boolean isEnabled()            { return true; }

}
