package lrsa.mac_backend.utils;

public class Messages {
	
	public static final String UNAUTHORIZED_MESSAGE = "Você não tem autenticação para realizar esta ação";
	public static final String ITEM_NOT_FOUND = "Não foi encontrado nenhum item correspondente aos parâmetros informados";
	public static final String USER_NOT_FOUND = "Não foi encontrado nenhum usuário correspondente aos parâmetros informados";
	public static final String REQUEST_NOT_FOUND = "Não foi encontrada nenhuma solicitação correspondente aos parâmetros informados";
	public static final String FRIENDSHIP_REQUEST_EXISTS = "Já foi enviada uma solicitação de amizade ao usuário";
	public static final String INVALID_JWT_TOKEN = "O token enviado não existe ou é inválido";
	public static final String INVALID_CREDENTIALS = "Credenciais inválidas";
	public static final String BAD_SWAP_PROPOSAL = "Um ou mais campos da proposta de troca são inválidos";
	public static final String SWAP_ALREADY_EXISTS = "Já existe uma proposta de troca entre você e o usuário informado. Aceite/recuse a proposta recebida ou cancele a proposta enviada";
	public static final String SWAP_NOT_FOUND = "A troca informada não existe ou já foi tratada";
	public static final String CANT_MODIFY_SWAP = "Você não tem autorização para aceitar/recusar/cancelar esta troca";
	public static final String DUPLICATE_IN_SWAP = "Alguma das figurinhas envolvidas na troca já está no álbum de algum dos colecionadores. Rejeite a troca e envie nova proposta";
	public static final String NOT_ENOUGH_DUPLICATES_SWAP = "Alguma das figurinhas envolvidas na troca não é repetida para o usuário que está enviando";

}
