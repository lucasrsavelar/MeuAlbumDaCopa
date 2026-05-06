package lrsa.mac_backend.domain.utils;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseCookie;
import org.springframework.http.ResponseCookie.ResponseCookieBuilder;
import org.springframework.stereotype.Component;

import io.micrometer.common.util.StringUtils;
import jakarta.servlet.http.HttpServletResponse;

@Component
public class CookieUtils {
	
	@Value("${https.secure}")
    private boolean secure;
	
	@Value("${https.same-site}")
    private String sameSite;
	
	@Value("${https.domain}")
	private String domain;
	
	public void setarCookie(HttpServletResponse res, String name, String value, long maxAge) {
        ResponseCookieBuilder builder = ResponseCookie.from(name, value)
            .httpOnly(true)
            .secure(secure)
            .path("/")
            .maxAge(maxAge)
            .sameSite(sameSite);
        
        if(!StringUtils.isBlank(domain))
        	builder.domain(domain);
           
        ResponseCookie cookie = builder.build();
        res.addHeader(HttpHeaders.SET_COOKIE, cookie.toString());
    }
    
	public void limparCookies(HttpServletResponse res) {
    	setarCookie(res, "access_token",  "", 0);
    	setarCookie(res, "refresh_token", "", 0);
    }

}
