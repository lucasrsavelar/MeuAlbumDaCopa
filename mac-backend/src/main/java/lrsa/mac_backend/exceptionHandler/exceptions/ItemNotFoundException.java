package lrsa.mac_backend.exceptionHandler.exceptions;

public class ItemNotFoundException extends RuntimeException {

	private static final long serialVersionUID = -8944738887594599565L;
	
	public ItemNotFoundException(String message) { super(message); }

}
