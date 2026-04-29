package lrsa.mac_backend.exceptions;

public class UnauthorizedException extends RuntimeException {

	private static final long serialVersionUID = -1030543444792885120L;

	public UnauthorizedException(String message) { super(message); }

}
