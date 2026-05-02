package lrsa.mac_backend.domain.solicitacaoAmizade;

import java.util.List;
import java.util.UUID;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import lrsa.mac_backend.domain.amizade.AmizadeService;
import lrsa.mac_backend.domain.macUsuario.MACUsuarioService;
import lrsa.mac_backend.exceptions.FriendshipRequestException;
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
    
    @Transactional
    public void enviarSolicitacao(UUID idEnviou, String usernameDestino) {
        UUID idRecebeu = usuarioService.findIdByUsername(usernameDestino)
            .orElseThrow(() -> new FriendshipRequestException(Messages.USER_NOT_FOUND));

        if (solicitacaoAmizadeRepository.existsByIdEnviouAndIdRecebeu(idEnviou, idRecebeu))
            throw new FriendshipRequestException(Messages.FRIENDSHIP_REQUEST_EXISTS);

        solicitacaoAmizadeRepository.findByIdEnviouAndIdRecebeu(idRecebeu, idEnviou)
            .ifPresentOrElse(
                request -> aceitarSolicitacao(request.getIdSolicitacao()),
                () -> {
                    SolicitacaoAmizade solicitacao = new SolicitacaoAmizade();
                    solicitacao.setIdEnviou(idEnviou);
                    solicitacao.setIdRecebeu(idRecebeu);
                    solicitacaoAmizadeRepository.save(solicitacao);
                }
            );
    }
    
    @Transactional
    public void aceitarSolicitacao(UUID idSolicitacao) {
    	SolicitacaoAmizade solicitacao = solicitacaoAmizadeRepository.findById(idSolicitacao)
            .orElseThrow(() -> new FriendshipRequestException(Messages.REQUEST_NOT_FOUND));

    	amizadeService.salvar(solicitacao.getIdEnviou(), solicitacao.getIdRecebeu());
    	amizadeService.salvar(solicitacao.getIdRecebeu(), solicitacao.getIdEnviou());
    	solicitacaoAmizadeRepository.delete(solicitacao);
    }
    
    @Transactional
    public void recusarSolicitacao(UUID idSolicitacao) {
    	SolicitacaoAmizade solicitacao = solicitacaoAmizadeRepository.findById(idSolicitacao)
            .orElseThrow(() -> new FriendshipRequestException(Messages.REQUEST_NOT_FOUND));

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
