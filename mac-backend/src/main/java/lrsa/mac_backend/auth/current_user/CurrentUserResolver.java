package lrsa.mac_backend.auth.current_user;

import java.util.UUID;

import org.springframework.core.MethodParameter;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.bind.support.WebDataBinderFactory;
import org.springframework.web.context.request.NativeWebRequest;
import org.springframework.web.method.support.HandlerMethodArgumentResolver;
import org.springframework.web.method.support.ModelAndViewContainer;

import lrsa.mac_backend.domain.usuario.MACUsuario;
import lrsa.mac_backend.exceptions.UnauthorizedException;
import lrsa.mac_backend.utils.Messages;

@Component
public class CurrentUserResolver implements HandlerMethodArgumentResolver {

    @Override
    public boolean supportsParameter(MethodParameter parameter) {
        return parameter.hasParameterAnnotation(CurrentUser.class)
            && parameter.getParameterType().equals(UUID.class);
    }

    @Override
    public Object resolveArgument(MethodParameter parameter,
                                  ModelAndViewContainer mavContainer,
                                  NativeWebRequest webRequest,
                                  WebDataBinderFactory binderFactory) {

        var auth = SecurityContextHolder.getContext().getAuthentication();

        if (auth == null || !auth.isAuthenticated())
            throw new UnauthorizedException(Messages.UNAUTHORIZED_MESSAGE);

        // Principal é o User setado no JwtAuthFilter
        var user = (MACUsuario) auth.getPrincipal();
        return user.getIdUsuario();
        
    }
}
