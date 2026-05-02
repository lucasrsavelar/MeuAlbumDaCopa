package lrsa.mac_backend.exceptions;

public class InvalidTokenException extends RuntimeException {

	private static final long serialVersionUID = 9100768640009946967L;

	public InvalidTokenException(String message) { super(message); }

}
