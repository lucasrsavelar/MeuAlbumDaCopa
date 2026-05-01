// Entidades do backend

export interface Pais {
  id: number
  codigoPais: string
  nomePais: string
}

export interface Figurinha {
  id: number
  codigoFigurinha: string
  tipoFigurinha: string
  nome: string | null
  posicao: string | null
  pais: Pais
}

/**
 * Mapa retornado por GET /figurinha-usuario/byUsuario
 * Chave: id da figurinha, Valor: quantidade que o usuário possui
 */
export type FigurinhasUsuarioMap = Record<number, number>

/**
 * DTO enviado no POST /figurinhas-usuario/adicionar
 */
export interface FigurinhaUsuarioDTO {
  idFigurinha: number
  quantidade: number
}

/**
 * DTO de solicitação de amizade recebida
 */
export interface SolicitacaoAmizadeDTO {
  idSolicitacao: string
  usernameEnviou: string
}

/**
 * DTO de trocas possíveis com um amigo
 * euOfereço: IDs das figurinhas que eu posso dar
 * amigoOferece: IDs das figurinhas que o amigo pode dar
 */
export interface TrocasDTO {
  usernameAmigo: string
  euOfereço: number[]
  amigoOferece: number[]
}
