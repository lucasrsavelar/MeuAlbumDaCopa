package lrsa.mac_backend.domain.utils;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseCookie;
import org.springframework.stereotype.Component;

import jakarta.servlet.http.HttpServletResponse;

@Component
public class CookieUtils {
	
	@Value("${https.secure}")
    private boolean secure;
	
	@Value("${https.same-site}")
    private String sameSite;
	
	public void setarCookie(HttpServletResponse res, String name, String value, long maxAge) {
        ResponseCookie cookie = ResponseCookie.from(name, value)
            .httpOnly(true)
            .secure(secure)
            .path("/")
            .maxAge(maxAge)
            .sameSite(sameSite)
            .build();
        res.addHeader(HttpHeaders.SET_COOKIE, cookie.toString());
    }
    
	public void limparCookies(HttpServletResponse res) {
    	setarCookie(res, "access_token",  "", 0);
    	setarCookie(res, "refresh_token", "", 0);
    }

}
