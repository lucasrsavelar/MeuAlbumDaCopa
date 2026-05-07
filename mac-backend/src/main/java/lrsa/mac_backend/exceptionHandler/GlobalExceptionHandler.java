package lrsa.mac_backend.exceptionHandler;

import java.util.LinkedHashMap;
import java.util.Map;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import lrsa.mac_backend.exceptionHandler.exceptions.BadRequestException;
import lrsa.mac_backend.exceptionHandler.exceptions.ConflictException;
import lrsa.mac_backend.exceptionHandler.exceptions.ForbiddenException;
import lrsa.mac_backend.exceptionHandler.exceptions.ItemNotFoundException;
import lrsa.mac_backend.exceptionHandler.exceptions.UnauthorizedException;
import lrsa.mac_backend.exceptionHandler.exceptions.UnprocessableException;

@RestControllerAdvice
public class GlobalExceptionHandler {
	
	private static final String MESSAGE = "message";
				
	@ExceptionHandler(ItemNotFoundException.class)
	public ResponseEntity<Object> handleItemNotFoundException(ItemNotFoundException ex) {
		Map<String, Object> body = new LinkedHashMap<>();
        body.put(MESSAGE, ex.getMessage());
        return new ResponseEntity<>(body, HttpStatus.OK);
	}
	
	@ExceptionHandler(ForbiddenException.class)
	public ResponseEntity<Object> handleForbiddenException(ForbiddenException ex) {
		Map<String, Object> body = new LinkedHashMap<>();
        body.put(MESSAGE, ex.getMessage());
        return new ResponseEntity<>(body, HttpStatus.FORBIDDEN);
	}
	
	@ExceptionHandler(BadRequestException.class)
	public ResponseEntity<Object> handleBadRequestException(BadRequestException ex) {
		Map<String, Object> body = new LinkedHashMap<>();
        body.put(MESSAGE, ex.getMessage());
        return new ResponseEntity<>(body, HttpStatus.BAD_REQUEST);
	}
	
	@ExceptionHandler(ConflictException.class)
	public ResponseEntity<Object> handleConflictException(ConflictException ex) {
		Map<String, Object> body = new LinkedHashMap<>();
        body.put(MESSAGE, ex.getMessage());
        return new ResponseEntity<>(body, HttpStatus.CONFLICT);
	}
	
	@ExceptionHandler(UnprocessableException.class)
	public ResponseEntity<Object> handleUnprocessableException(UnprocessableException ex) {
		Map<String, Object> body = new LinkedHashMap<>();
        body.put(MESSAGE, ex.getMessage());
        return new ResponseEntity<>(body, HttpStatus.UNPROCESSABLE_CONTENT);
	}
	
	@ExceptionHandler(UnauthorizedException.class)
	public ResponseEntity<Object> handleUnauthorizedException(UnauthorizedException ex) {
		Map<String, Object> body = new LinkedHashMap<>();
        body.put(MESSAGE, ex.getMessage());
        return new ResponseEntity<>(body, HttpStatus.UNAUTHORIZED);
	}
	
	@ExceptionHandler(Exception.class)
    public ResponseEntity<Object> handleGenericException(Exception ex) {
		Map<String, Object> body = new LinkedHashMap<>();
        body.put(MESSAGE, ex.getMessage());
        return new ResponseEntity<>(body, HttpStatus.INTERNAL_SERVER_ERROR);
    }

}
