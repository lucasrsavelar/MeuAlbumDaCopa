package lrsa.mac_backend.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfigurationSource;

import lrsa.mac_backend.auth.jwt.JwtAuthFilter;
import lrsa.mac_backend.domain.macUsuario.MACUsuarioService;
import lrsa.mac_backend.exceptionHandler.exceptions.UnauthorizedException;
import lrsa.mac_backend.utils.Messages;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity
public class SecurityConfig {
	
	private final JwtAuthFilter jwtAuthFilter;
	private final CorsConfigurationSource corsConfigurationSource;
	private final MACUsuarioService macUsuarioService;
	
	private static final String AUTH_ROUTES = "/auth/**";
	
	public SecurityConfig(JwtAuthFilter jwtAuthFilter, CorsConfigurationSource corsConfigurationSource, MACUsuarioService macUsuarioService) {
		this.jwtAuthFilter = jwtAuthFilter;
		this.corsConfigurationSource = corsConfigurationSource;
		this.macUsuarioService = macUsuarioService;
	}

	@Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        return http
            .csrf(csrf -> csrf.disable())
            .cors(cors -> cors.configurationSource(corsConfigurationSource))
            .sessionManagement(s -> s
                .sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .authorizeHttpRequests(auth -> auth
                .requestMatchers(AUTH_ROUTES).permitAll()
                .anyRequest().authenticated())
            .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class)
            .build();
    }
	
	@Bean
	public UserDetailsService userDetailsService() {
	    return username -> macUsuarioService.findByUsername(username)
	        .orElseThrow(() -> new UnauthorizedException(Messages.INVALID_CREDENTIALS));
	}
    
    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }
    
}