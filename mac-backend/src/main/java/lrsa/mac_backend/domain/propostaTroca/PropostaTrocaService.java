package lrsa.mac_backend.domain.propostaTroca;

import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import io.micrometer.common.util.StringUtils;
import lrsa.mac_backend.domain.figurinhaUsuario.FigurinhaUsuario;
import lrsa.mac_backend.domain.figurinhaUsuario.FigurinhaUsuarioDTO;
import lrsa.mac_backend.domain.figurinhaUsuario.FigurinhaUsuarioService;
import lrsa.mac_backend.domain.macUsuario.MACUsuario;
import lrsa.mac_backend.domain.macUsuario.MACUsuarioService;
import lrsa.mac_backend.domain.propostaTrocaFigurinha.PropostaTrocaFigurinha;
import lrsa.mac_backend.domain.propostaTrocaFigurinha.PropostaTrocaFigurinhaService;
import lrsa.mac_backend.exceptionHandler.exceptions.BadRequestException;
import lrsa.mac_backend.exceptionHandler.exceptions.ConflictException;
import lrsa.mac_backend.exceptionHandler.exceptions.ForbiddenException;
import lrsa.mac_backend.exceptionHandler.exceptions.UnprocessableException;
import lrsa.mac_backend.utils.Messages;

@Service
public class PropostaTrocaService {
	
	private final PropostaTrocaRepository propostaTrocaRepository;
	private final PropostaTrocaFigurinhaService propostaTrocaFigurinhaService;
	private final MACUsuarioService macUsuarioService;
	private final FigurinhaUsuarioService figurinhaUsuarioService;
	
	public PropostaTrocaService(PropostaTrocaRepository propostaTrocaRepository,
			PropostaTrocaFigurinhaService propostaTrocaFigurinhaService, MACUsuarioService macUsuarioService, FigurinhaUsuarioService figurinhaUsuarioService) {
		this.propostaTrocaRepository = propostaTrocaRepository;
		this.propostaTrocaFigurinhaService = propostaTrocaFigurinhaService;
		this.macUsuarioService = macUsuarioService;
		this.figurinhaUsuarioService = figurinhaUsuarioService;
	}
	
	@Transactional
	public void enviarPropostaTroca(UUID idUsuarioEnviou, PropostaTrocaEnviadaDTO propostaEnviada) {
		
		if(!this.isPropostaEnviadaValida(propostaEnviada))
			throw new BadRequestException(Messages.BAD_SWAP_PROPOSAL);
		
		MACUsuario usuarioRecebeu = macUsuarioService.findByUsername(propostaEnviada.getUsernameDestino()).orElseThrow(() -> new UnprocessableException(Messages.USER_NOT_FOUND));
		UUID idUsuarioRecebeu = usuarioRecebeu.getIdUsuario();
		
		if(this.existeTrocaEntreUsuarios(idUsuarioEnviou, idUsuarioRecebeu))
			throw new ConflictException(Messages.SWAP_ALREADY_EXISTS);
		
		UUID idProposta = UUID.randomUUID();
		propostaTrocaRepository.save(new PropostaTroca(idProposta, idUsuarioEnviou, idUsuarioRecebeu));
		
		List<PropostaTrocaFigurinha> figurinhasUsuarioEnviou = new ArrayList<PropostaTrocaFigurinha>();
		List<PropostaTrocaFigurinha> figurinhasUsuarioRecebe = new ArrayList<PropostaTrocaFigurinha>();
		
		for (Integer idFigurinha : propostaEnviada.getFigurinhasOferecidas()) {
            PropostaTrocaFigurinha f = new PropostaTrocaFigurinha();
            f.setIdProposta(idProposta);
            f.setIdEnvia(idUsuarioEnviou);
            f.setIdRecebe(idUsuarioRecebeu);
            f.setIdFigurinha(idFigurinha);
            
            figurinhasUsuarioEnviou.add(f);
        }
		
		for (Integer idFigurinha : propostaEnviada.getFigurinhasDesejadas()) {
            PropostaTrocaFigurinha f = new PropostaTrocaFigurinha();
            f.setIdProposta(idProposta);
            f.setIdEnvia(idUsuarioRecebeu);
            f.setIdRecebe(idUsuarioEnviou);
            f.setIdFigurinha(idFigurinha);
            
            figurinhasUsuarioRecebe.add(f);
        }
		
		propostaTrocaFigurinhaService.salvarLista(figurinhasUsuarioEnviou);
		propostaTrocaFigurinhaService.salvarLista(figurinhasUsuarioRecebe);
		
	}
	
	@Transactional
	public void aceitarPropostaTroca(UUID idUsuarioRecebeu, UUID idProposta) {
		
		PropostaTroca proposta = propostaTrocaRepository.findByIdPropostaTroca(idProposta).orElseThrow(() -> new UnprocessableException(Messages.SWAP_NOT_FOUND));
		
		if(!idUsuarioRecebeu.equals(proposta.getIdUsuarioRecebeu()))
			throw new ForbiddenException(Messages.CANT_MODIFY_SWAP);
		
		MACUsuario usuarioEnviou = macUsuarioService.findByIdUsuario(proposta.getIdUsuarioEnviou()).orElseThrow(() -> new UnprocessableException(Messages.USER_NOT_FOUND));
		UUID idUsuarioEnviou = usuarioEnviou.getIdUsuario();
		
		List<PropostaTrocaFigurinha> propostaFigurinhas = propostaTrocaFigurinhaService.findByIdProposta(idProposta);
		if(propostaFigurinhas.isEmpty())
			throw new ConflictException(Messages.SWAP_NOT_FOUND);
		
		// Figurinhas recebidas pelo usuário que recebeu a proposta (atual)
		List<Integer> idsRecebidas = propostaFigurinhas.stream()
				.filter(p -> p.getIdRecebe().equals(idUsuarioRecebeu))
				.map(PropostaTrocaFigurinha::getIdFigurinha)
				.toList();
		
		// Figurinhas enviadas pelo usuário que recebeu a proposta (atual)
		List<Integer> idsEnviadas = propostaFigurinhas.stream()
				.filter(p -> p.getIdEnvia().equals(idUsuarioRecebeu))
				.map(PropostaTrocaFigurinha::getIdFigurinha)
				.toList();
		
		if(figurinhaUsuarioService.usuarioPossuiFigurinhaDaLista(idUsuarioRecebeu, idsRecebidas) || figurinhaUsuarioService.usuarioPossuiFigurinhaDaLista(idUsuarioEnviou, idsEnviadas))
			throw new ConflictException(Messages.DUPLICATE_IN_SWAP);
		
		// Figurinhas recebidas pelo usuário atual - verificar se o usuário que mandou tem pelo menos 2 unidades de todas elas
		List<FigurinhaUsuario> recebidas = figurinhaUsuarioService.findRepetidasDaLista(idUsuarioEnviou, idsRecebidas, 2);
		if(recebidas.size() != idsRecebidas.size())
			throw new ConflictException(Messages.NOT_ENOUGH_DUPLICATES_SWAP);
		
		// Figurinhas enviadas pelo usuário atual - verificar se tem pelo menos duas unidades de todas elas
		List<FigurinhaUsuario> enviadas = figurinhaUsuarioService.findRepetidasDaLista(idUsuarioRecebeu, idsEnviadas, 2);
		if(enviadas.size() != idsEnviadas.size())
			throw new ConflictException(Messages.NOT_ENOUGH_DUPLICATES_SWAP);
		
		List<FigurinhaUsuarioDTO> novasUsuarioRecebeu = new ArrayList<FigurinhaUsuarioDTO>();
		List<FigurinhaUsuarioDTO> entreguesUsuarioEnviou = new ArrayList<FigurinhaUsuarioDTO>();
		
		for(FigurinhaUsuario figurinha : recebidas) {
			
			FigurinhaUsuarioDTO dtoRecebeu = new FigurinhaUsuarioDTO();
			dtoRecebeu.setIdFigurinha(figurinha.getPk().getIdFigurinha());
			dtoRecebeu.setQuantidade(1);
			
			novasUsuarioRecebeu.add(dtoRecebeu);
			
			FigurinhaUsuarioDTO dtoEnviou = new FigurinhaUsuarioDTO();
			dtoEnviou.setIdFigurinha(figurinha.getPk().getIdFigurinha());
			dtoEnviou.setQuantidade(figurinha.getQuantidade() - 1);
			
			entreguesUsuarioEnviou.add(dtoEnviou);
			
		}
		
		figurinhaUsuarioService.adicionarFigurinhas(idUsuarioRecebeu, novasUsuarioRecebeu);
		figurinhaUsuarioService.corrigirFigurinhas(idUsuarioEnviou, entreguesUsuarioEnviou);
		
		List<FigurinhaUsuarioDTO> entreguesUsuarioRecebeu = new ArrayList<FigurinhaUsuarioDTO>();
		List<FigurinhaUsuarioDTO> novasUsuarioEnviou = new ArrayList<FigurinhaUsuarioDTO>();
		
		for(FigurinhaUsuario figurinha : enviadas) {
			
			FigurinhaUsuarioDTO dtoEnviou = new FigurinhaUsuarioDTO();
			dtoEnviou.setIdFigurinha(figurinha.getPk().getIdFigurinha());
			dtoEnviou.setQuantidade(1);
			
			entreguesUsuarioRecebeu.add(dtoEnviou);
			
			FigurinhaUsuarioDTO dtoRecebeu = new FigurinhaUsuarioDTO();
			dtoRecebeu.setIdFigurinha(figurinha.getPk().getIdFigurinha());
			dtoRecebeu.setQuantidade(figurinha.getQuantidade() - 1);
			
			novasUsuarioEnviou.add(dtoRecebeu);
			
		}
		
		figurinhaUsuarioService.adicionarFigurinhas(idUsuarioEnviou, entreguesUsuarioRecebeu);
		figurinhaUsuarioService.corrigirFigurinhas(idUsuarioRecebeu, novasUsuarioEnviou);
			
	}
	
	@Transactional
	public void recusarPropostaTroca(UUID idUsuarioRecebeu, UUID idProposta) {
		
		PropostaTroca proposta = propostaTrocaRepository.findByIdPropostaTroca(idProposta).orElseThrow(() -> new UnprocessableException(Messages.SWAP_NOT_FOUND));
		
		if(!idUsuarioRecebeu.equals(proposta.getIdUsuarioRecebeu()))
			throw new ForbiddenException(Messages.CANT_MODIFY_SWAP);
		
		propostaTrocaFigurinhaService.deletarByIdProposta(idProposta);
		propostaTrocaRepository.delete(proposta);
		
	}
	
	@Transactional
	public void cancelarPropostaTroca(UUID idUsuarioEnviou, UUID idProposta) {
		
		PropostaTroca proposta = propostaTrocaRepository.findByIdPropostaTroca(idProposta).orElseThrow(() -> new UnprocessableException(Messages.SWAP_NOT_FOUND));
		
		if(!idUsuarioEnviou.equals(proposta.getIdUsuarioEnviou()))
			throw new ForbiddenException(Messages.CANT_MODIFY_SWAP);
		
		propostaTrocaFigurinhaService.deletarByIdProposta(idProposta);
		propostaTrocaRepository.delete(proposta);
	}
	
	public List<PropostaTrocaRecebidaDTO> findPropostasRecebidas(UUID idUsuario) {
	    return agrupar(propostaTrocaRepository.findPropostasRecebidasRaw(idUsuario), idUsuario);
	}

	public List<PropostaTrocaRecebidaDTO> findPropostasEnviadas(UUID idUsuario) {
	    return agrupar(propostaTrocaRepository.findPropostasEnviadasRaw(idUsuario), idUsuario);
	}
	
	private boolean existeTrocaEntreUsuarios(UUID idUsuarioEnviou, UUID idUsuarioRecebeu) {
		
		if(propostaTrocaRepository.existsByIdUsuarioEnviouAndIdUsuarioRecebeu(idUsuarioEnviou, idUsuarioRecebeu)
				|| propostaTrocaRepository.existsByIdUsuarioEnviouAndIdUsuarioRecebeu(idUsuarioRecebeu, idUsuarioEnviou))
			return true;
		
		return false;
		
	}
	
	private boolean isPropostaEnviadaValida(PropostaTrocaEnviadaDTO propostaEnviada) {
		
		if(StringUtils.isBlank(propostaEnviada.getUsernameDestino()))
				return false;
		
		if(propostaEnviada.getFigurinhasOferecidas() == null || propostaEnviada.getFigurinhasDesejadas() == null)
			return false;
		
		if(propostaEnviada.getFigurinhasOferecidas().isEmpty() || propostaEnviada.getFigurinhasDesejadas().isEmpty())
			return false;
		
		return true;
		
	}
	
	private List<PropostaTrocaRecebidaDTO> agrupar(List<Object[]> rows, UUID idUsuario) {
	    Map<UUID, PropostaTrocaRecebidaDTO> agrupado = new LinkedHashMap<>();

	    for (Object[] row : rows) {
	        UUID idProposta = UUID.fromString(row[0].toString());
	        String username = row[1].toString();
	        UUID idEnvia = UUID.fromString(row[2].toString());
	        Integer idFigurinha = ((Number) row[4]).intValue();

	        PropostaTrocaRecebidaDTO dto = agrupado.computeIfAbsent(idProposta, id ->
	            new PropostaTrocaRecebidaDTO(id, username, new ArrayList<>(), new ArrayList<>())
	        );

	        if (idEnvia.equals(idUsuario)) dto.getFigurinhasDesejadas().add(idFigurinha);
	        else dto.getFigurinhasOferecidas().add(idFigurinha);
	    }

	    return new ArrayList<>(agrupado.values());
	    
	}

}
