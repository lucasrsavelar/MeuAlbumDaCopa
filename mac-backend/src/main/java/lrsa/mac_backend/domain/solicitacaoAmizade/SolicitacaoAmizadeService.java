package lrsa.mac_backend.domain.solicitacaoAmizade;

import java.util.List;
import java.util.UUID;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import lrsa.mac_backend.domain.amizade.AmizadeService;
import lrsa.mac_backend.domain.macUsuario.MACUsuarioService;
import lrsa.mac_backend.exceptionHandler.exceptions.ConflictException;
import lrsa.mac_backend.exceptionHandler.exceptions.ForbiddenException;
import lrsa.mac_backend.exceptionHandler.exceptions.UnprocessableException;
import lrsa.mac_backend.utils.Messages;

@Service
public class SolicitacaoAmizadeService {

	private final SolicitacaoAmizadeRepository solicitacaoAmizadeRepository;
    private final AmizadeService amizadeService;
    private final MACUsuarioService usuarioService;
    
    public SolicitacaoAmizadeService(SolicitacaoAmizadeRepository solicitacaoAmizadeRepository, AmizadeService amizadeService, MACUsuarioService usuarioService) {
    	this.solicitacaoAmizadeRepository = solicitacaoAmizadeRepository;
    	this.amizadeService = amizadeService;
    	this.usuarioService = usuarioService;
    }
    
    private static final String PROBIDO_ALTERAR_SOLICITACAO = "Você não tem autorização para aceitar/recusar esta solicitação de amizade";
    
    @Transactional
    public void enviarSolicitacao(UUID idEnviou, String usernameDestino) {
        UUID idRecebeu = usuarioService.findIdByUsername(usernameDestino)
            .orElseThrow(() -> new UnprocessableException(Messages.USER_NOT_FOUND));

        if (solicitacaoAmizadeRepository.existsByIdEnviouAndIdRecebeu(idEnviou, idRecebeu))
            throw new ConflictException(Messages.FRIENDSHIP_REQUEST_EXISTS);

        solicitacaoAmizadeRepository.findByIdEnviouAndIdRecebeu(idRecebeu, idEnviou)
            .ifPresentOrElse(
                request -> aceitarSolicitacao(idRecebeu, request.getIdSolicitacao()),
                () -> {
                    SolicitacaoAmizade solicitacao = new SolicitacaoAmizade();
                    solicitacao.setIdEnviou(idEnviou);
                    solicitacao.setIdRecebeu(idRecebeu);
                    solicitacaoAmizadeRepository.save(solicitacao);
                }
            );
    }
    
    @Transactional
    public void aceitarSolicitacao(UUID idUsuario, UUID idSolicitacao) {
    	SolicitacaoAmizade solicitacao = solicitacaoAmizadeRepository.findById(idSolicitacao)
            .orElseThrow(() -> new UnprocessableException(Messages.REQUEST_NOT_FOUND));
    	
    	if(!solicitacao.getIdRecebeu().equals(idUsuario))
    		throw new ForbiddenException(PROBIDO_ALTERAR_SOLICITACAO);

    	amizadeService.salvar(solicitacao.getIdEnviou(), solicitacao.getIdRecebeu());
    	amizadeService.salvar(solicitacao.getIdRecebeu(), solicitacao.getIdEnviou());
    	solicitacaoAmizadeRepository.delete(solicitacao);
    }
    
    @Transactional
    public void recusarSolicitacao(UUID idUsuario, UUID idSolicitacao) {
    	SolicitacaoAmizade solicitacao = solicitacaoAmizadeRepository.findById(idSolicitacao)
            .orElseThrow(() -> new UnprocessableException(Messages.REQUEST_NOT_FOUND));
    	
    	if(!solicitacao.getIdRecebeu().equals(idUsuario))
    		throw new ForbiddenException(PROBIDO_ALTERAR_SOLICITACAO);

    	solicitacaoAmizadeRepository.delete(solicitacao);
    }
    
    public List<SolicitacaoAmizadeDTO> findSolicitacoesRecebidas(UUID idUsuario) {
        return solicitacaoAmizadeRepository.findSolicitacoesRecebidas(idUsuario)
            .stream()
            .map(row -> new SolicitacaoAmizadeDTO(
                UUID.fromString(row[0].toString()),
                row[1].toString()
            ))
            .toList();
    }
    
}
