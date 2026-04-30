import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { apiGet, apiPost } from '../lib/api'
import type { SolicitacaoAmizadeDTO } from '../types'

/**
 * Busca solicitações de amizade recebidas pelo usuário logado.
 * Cache infinito — refetch apenas via invalidateQueries().
 */
export function useSolicitacoesRecebidas() {
  return useQuery<SolicitacaoAmizadeDTO[]>({
    queryKey: ['solicitacoes-amizade', 'recebidas'],
    queryFn: () => apiGet('/solicitacao-amizade/recebidas'),
  })
}

/**
 * Envia solicitação de amizade.
 * POST /solicitacao-amizade/enviar?usernameDestino=X
 */
export function useEnviarSolicitacao() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (usernameDestino: string) =>
      apiPost(`/solicitacao-amizade/enviar?usernameDestino=${encodeURIComponent(usernameDestino)}`, null),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['solicitacoes-amizade'] })
    },
  })
}

/**
 * Aceita uma solicitação de amizade.
 * POST /solicitacao-amizade/aceitar — body: UUID (idSolicitacao)
 */
export function useAceitarSolicitacao() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (idSolicitacao: string) =>
      apiPost('/solicitacao-amizade/aceitar', idSolicitacao),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['solicitacoes-amizade'] })
      queryClient.invalidateQueries({ queryKey: ['amizades'] })
    },
  })
}

/**
 * Recusa uma solicitação de amizade.
 * POST /solicitacao-amizade/recusar — body: UUID (idSolicitacao)
 */
export function useRecusarSolicitacao() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (idSolicitacao: string) =>
      apiPost('/solicitacao-amizade/recusar', idSolicitacao),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['solicitacoes-amizade'] })
    },
  })
}
