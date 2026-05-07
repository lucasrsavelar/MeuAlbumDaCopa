package lrsa.mac_backend.exceptionHandler.exceptions;

public class ForbiddenException extends RuntimeException {

	private static final long serialVersionUID = 2609316243011223598L;
	
	public ForbiddenException(String message) { super(message); }

}
