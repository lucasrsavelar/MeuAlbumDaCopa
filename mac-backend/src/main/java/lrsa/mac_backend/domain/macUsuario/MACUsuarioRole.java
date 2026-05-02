package lrsa.mac_backend.domain.macUsuario;

public enum MACUsuarioRole {
	
	USER("user"),
	ADMIN("admin");
	
	private String role;
	
	MACUsuarioRole(String role) {
		this.role = role;
	}
	
	public String getRole() {
		return this.role;
	}

}
