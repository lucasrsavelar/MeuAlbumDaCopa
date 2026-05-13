package lrsa.mac_backend.domain.grupo;

import java.util.UUID;

import org.springframework.stereotype.Service;

import io.micrometer.common.util.StringUtils;
import lrsa.mac_backend.domain.grupoConvite.GrupoConvite;
import lrsa.mac_backend.domain.grupoConvite.GrupoConviteService;
import lrsa.mac_backend.domain.grupoMembro.GrupoMembroService;
import lrsa.mac_backend.domain.macUsuario.MACUsuarioService;
import lrsa.mac_backend.exceptionHandler.exceptions.ConflictException;
import lrsa.mac_backend.exceptionHandler.exceptions.ForbiddenException;
import lrsa.mac_backend.exceptionHandler.exceptions.UnprocessableException;
import lrsa.mac_backend.utils.Messages;

@Service
public class GrupoService {

	private final GrupoRepository grupoRepository;
	private final GrupoConviteService grupoConviteService;
	private final GrupoMembroService grupoMembroService;
	private final MACUsuarioService usuarioService;
	
	public GrupoService(GrupoRepository grupoRepository, GrupoConviteService grupoConviteService, GrupoMembroService grupoMembroService, MACUsuarioService usuarioService) {
		this.grupoRepository = grupoRepository;
		this.grupoConviteService = grupoConviteService;
		this.grupoMembroService = grupoMembroService;
		this.usuarioService = usuarioService;
	}
	
	private static final String NOME_GRUPO_OBRIGATORIO = "O nome do grupo é obrigatório";
	private static final String TAMANHO_NOME_GRUPO = "O nome do grupo deve ter no mínimo 2 e no máximo 50 caracteres";
	private static final String NOME_GRUPO_EXISTE_USUARIO = "Você já tem um grupo com este nome";
	
	private static final String USER_JA_CONVIDADO = "O usuário já foi convidado para este grupo";
	
	private static final String GRUPO_NOT_FOUND_OU_PROIBIDO = "O grupo informado não existe ou você não tem autorização para convidar usuários a ele";
	private static final String PROIBIDO_MODIFICAR_CONVITE = "Você não tem autorização para aceitar/recusar este convite";
	
	public void criarGrupo(UUID idCriador, String nome) {
		
		String erro = this.getErroGrupo(nome, idCriador);
		if(erro != null)
			throw new UnprocessableException(erro);
		
		Grupo grupo = new Grupo();
		grupo.setNome(nome);
		grupo.setIdCriador(idCriador);
		
		grupoRepository.save(grupo);
		
	}
	
	public void convidarParaGrupo(UUID idUsuario, String nomeGrupo, String usernameConvidado) {
		
		Grupo grupo = grupoRepository.findByNomeAndIdCriador(nomeGrupo, idUsuario)
				.orElseThrow(() -> new UnprocessableException(GRUPO_NOT_FOUND_OU_PROIBIDO));
		
		UUID idConvidado = usuarioService.findIdByUsername(usernameConvidado)
	            .orElseThrow(() -> new UnprocessableException(Messages.USER_NOT_FOUND));
		
		UUID idGrupo = grupo.getIdGrupo();
		
		if(grupoMembroService.isUsuarioMembroDoGrupo(idGrupo, idConvidado))
			throw new ConflictException(USER_JA_CONVIDADO);
		
		grupoConviteService.criarConvite(idGrupo, idConvidado);
		
	}
	
	public void aceitarConvite(UUID idUsuario, UUID idConvite) {
		
		GrupoConvite convite = grupoConviteService.buscarConviteById(idConvite)
				.orElseThrow(() -> new UnprocessableException(Messages.REQUEST_NOT_FOUND));
		
		if(convite.getIdConvidado() != idUsuario)
			throw new ForbiddenException(PROIBIDO_MODIFICAR_CONVITE);
		
		grupoMembroService.salvarMembro(convite.getIdGrupo(), idUsuario);
		
	}
	
	private String getErroGrupo(String nome, UUID idCriador) {
		
		if(nome == null || StringUtils.isBlank(nome))
			return NOME_GRUPO_OBRIGATORIO;

		if(nome.length() < 2 || nome.length() > 50)
			return TAMANHO_NOME_GRUPO;
		
		if(grupoRepository.existsByNomeAndIdCriador(nome, idCriador))
			return NOME_GRUPO_EXISTE_USUARIO;
		
		return null;
		
	}
	
}
