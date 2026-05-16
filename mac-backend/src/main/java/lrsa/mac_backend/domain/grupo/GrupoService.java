package lrsa.mac_backend.domain.grupo;

import java.util.ArrayList;
import java.util.Collections;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

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
	
	private static final long MAX_GRUPOS_CRIADOS = 3;
	private static final long MAX_TAMANHO_GRUPO = 5;
	private static final long MAX_GRUPOS_USUARIO_MEMBRO = 5;
	
	private static final String ALCANCOU_LIMITE_GRUPOS = "Você já atingiu o limite de 3 grupos criados";
	private static final String NOME_GRUPO_OBRIGATORIO = "O nome do grupo é obrigatório";
	private static final String CARACTERES_NOME_GRUPO = "Nome do grupo pode conter apenas letras, números, espaços, underscore (_) e hífen (-)";
	private static final String TAMANHO_NOME_GRUPO = "O nome do grupo deve ter no mínimo 2 e no máximo 50 caracteres";
	private static final String NOME_GRUPO_EXISTE_USUARIO = "Você já tem um grupo com este nome";
	
	private static final String ALCANCOU_LIMITE_MEMBROS = "Este grupo já atingiu o limite de 5 membros";
	private static final String USER_JA_NO_GRUPO = "O usuário já está no grupo";
	private static final String USER_JA_CONVIDADO = "O usuário já foi convidado para este grupo";
	
	private static final String GRUPO_NOT_FOUND_OU_PROIBIDO = "O grupo informado não existe ou você não tem autorização para modificá-lo";
	private static final String PROIBIDO_MODIFICAR_CONVITE = "Você não tem autorização para aceitar/recusar este convite";
	private static final String ALCANCOU_LIMITE_GRUPOS_MEMBRO = "Você já atingiu o limite de participação em 5 grupos";
	
	private static final String NOT_REMOVER_SELF = "Você não pode remover a si mesmo do grupo";
	
	private static final String NOT_MEMBRO_GRUPO_SAIR = "Você não é um membro do grupo informado";
	private static final String NOT_MEMBRO_GRUPO_REMOVER = "O usuário informado não é membro do grupo";
	
	@Transactional
	public void criarGrupo(UUID idCriador, String nome) {
		
		if(grupoRepository.countByIdCriador(idCriador) >= MAX_GRUPOS_CRIADOS)
			throw new ConflictException(ALCANCOU_LIMITE_GRUPOS);
		
		String erro = this.getErroGrupo(nome, idCriador);
		if(erro != null)
			throw new UnprocessableException(erro);
		
		Grupo grupo = new Grupo();
		grupo.setNome(nome);
		grupo.setIdCriador(idCriador);
		
		grupoRepository.save(grupo);
		grupoMembroService.salvarMembro(grupo.getIdGrupo(), idCriador);
		
	}
	
	@Transactional
	public void convidarParaGrupo(UUID idUsuario, String nomeGrupo, String usernameConvidado) {
		
		Grupo grupo = grupoRepository.findByNomeAndIdCriador(nomeGrupo, idUsuario)
				.orElseThrow(() -> new ConflictException(GRUPO_NOT_FOUND_OU_PROIBIDO));
		
		if(grupoMembroService.getNumeroMembrosGrupo(grupo.getIdGrupo()) >= MAX_TAMANHO_GRUPO)
			throw new ConflictException(ALCANCOU_LIMITE_MEMBROS);
		
		UUID idConvidado = usuarioService.findIdByUsername(usernameConvidado)
	            .orElseThrow(() -> new ConflictException(Messages.USER_NOT_FOUND));
		
		UUID idGrupo = grupo.getIdGrupo();
		
		if(grupoConviteService.isUsuarioConvidadoAoGrupo(idGrupo, idUsuario))
			throw new ConflictException(USER_JA_CONVIDADO);
		
		if(grupoMembroService.isUsuarioMembroDoGrupo(idGrupo, idConvidado))
			throw new ConflictException(USER_JA_NO_GRUPO);
		
		grupoConviteService.criarConvite(idGrupo, idConvidado);
		
	}
	
	@Transactional
	public void aceitarConvite(UUID idUsuario, UUID idConvite) {
		
		GrupoConvite convite = grupoConviteService.buscarConviteById(idConvite)
				.orElseThrow(() -> new UnprocessableException(Messages.REQUEST_NOT_FOUND));
		
		if(!convite.getIdConvidado().equals(idUsuario))
			throw new ForbiddenException(PROIBIDO_MODIFICAR_CONVITE);
		
		if(grupoMembroService.getNumeroGruposUsuario(idUsuario) >= MAX_GRUPOS_USUARIO_MEMBRO)
			throw new ConflictException(ALCANCOU_LIMITE_GRUPOS_MEMBRO);
		
		grupoMembroService.salvarMembro(convite.getIdGrupo(), idUsuario);
		
	}
	
	@Transactional
	public void recusarConvite(UUID idUsuario, UUID idConvite) {
		
		GrupoConvite convite = grupoConviteService.buscarConviteById(idConvite)
				.orElseThrow(() -> new UnprocessableException(Messages.REQUEST_NOT_FOUND));
		
		if(!convite.getIdConvidado().equals(idUsuario))
			throw new ForbiddenException(PROIBIDO_MODIFICAR_CONVITE);
		
		grupoConviteService.deletarConvite(convite);
		
	}
	
	@Transactional
	public void removerMembroDoGrupo(UUID idUsuario, String nomeGrupo, String usernameRemovido) {
		
		Grupo grupo = grupoRepository.findByNomeAndIdCriador(nomeGrupo, idUsuario)
				.orElseThrow(() -> new ConflictException(GRUPO_NOT_FOUND_OU_PROIBIDO));
		
		UUID idRemovido = usuarioService.findIdByUsername(usernameRemovido)
	            .orElseThrow(() -> new ConflictException(Messages.USER_NOT_FOUND));
		
		if(idUsuario.equals(idRemovido))
			throw new ConflictException(NOT_REMOVER_SELF);
		
		UUID idGrupo = grupo.getIdGrupo();
		
		if(!grupoMembroService.isUsuarioMembroDoGrupo(idGrupo, idUsuario))
			throw new ConflictException(NOT_MEMBRO_GRUPO_REMOVER);
		
		grupoMembroService.removerMembroDoGrupo(idGrupo, idRemovido);
		
	}
	
	@Transactional
	public void sairDoGrupo(UUID idUsuario, String nomeGrupo) {
		
		Grupo grupo = grupoRepository.findByNome(nomeGrupo)
				.orElseThrow(() -> new ConflictException(GRUPO_NOT_FOUND_OU_PROIBIDO));
		
		UUID idGrupo = grupo.getIdGrupo();
		
		if(!grupoMembroService.isUsuarioMembroDoGrupo(idGrupo, idUsuario))
			throw new ForbiddenException(NOT_MEMBRO_GRUPO_SAIR);
		
		if(idUsuario.equals(grupo.getIdCriador())) {
			this.deletarGrupo(idUsuario, nomeGrupo);
			return;
		}
		
		grupoMembroService.removerMembroDoGrupo(idGrupo, idUsuario);
		
	}
	
	@Transactional
	public void deletarGrupo(UUID idUsuario, String nomeGrupo) {
		
		Grupo grupo = grupoRepository.findByNomeAndIdCriador(nomeGrupo, idUsuario)
				.orElseThrow(() -> new ConflictException(GRUPO_NOT_FOUND_OU_PROIBIDO));
		
		UUID idGrupo = grupo.getIdGrupo();
		
		grupoConviteService.deletarTodosConvitesGrupo(idGrupo);
		grupoMembroService.removerTodosMembrosGrupo(idGrupo);
		grupoRepository.delete(grupo);
		
	}
	
	public List<GrupoDTO> buscarGruposByUsuario(UUID idUsuario) {
	    List<Object[]> rows = grupoRepository.findGruposComMembrosByUsuario(idUsuario);

	    if (rows.isEmpty()) return Collections.emptyList();

	    Map<UUID, GrupoDTO> agrupado = new LinkedHashMap<>();

	    for (Object[] row : rows) {
	        UUID idGrupo   = UUID.fromString(row[0].toString());
	        String nome    = row[1].toString();
	        UUID idCriador = UUID.fromString(row[2].toString());
	        UUID idMembro  = UUID.fromString(row[3].toString());
	        String username = row[4].toString();

	        GrupoDTO dto = agrupado.computeIfAbsent(idGrupo, id ->
	            new GrupoDTO(nome, new LinkedHashMap<>())
	        );

	        GrupoRole role = idMembro.equals(idCriador)
	            ? GrupoRole.CRIADOR
	            : GrupoRole.MEMBRO;

	        dto.getMembros().put(username, role);
	    }

	    return new ArrayList<>(agrupado.values());
	}
	
	private String getErroGrupo(String nome, UUID idCriador) {
		
		if(nome == null || StringUtils.isBlank(nome))
			return NOME_GRUPO_OBRIGATORIO;

		if(nome.length() < 2 || nome.length() > 50)
			return TAMANHO_NOME_GRUPO;
		
		if(!nome.matches("^[a-zA-Z0-9 _-]+$"))
			return CARACTERES_NOME_GRUPO;
		
		if(grupoRepository.existsByNomeAndIdCriador(nome, idCriador))
			return NOME_GRUPO_EXISTE_USUARIO;
		
		return null;
		
	}
	
}
