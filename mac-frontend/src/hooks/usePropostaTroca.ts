import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { apiGet, apiPost, apiDelete } from '../lib/api'
import type { PropostaTrocaRecebidaDTO } from '../types'

/**
 * Busca propostas de troca recebidas pelo usuário logado.
 * GET /proposta-troca/recebidas → List<PropostaTrocaRecebidaDTO>
 */
export function usePropostasRecebidas() {
  return useQuery<PropostaTrocaRecebidaDTO[]>({
    queryKey: ['propostas-troca', 'recebidas'],
    queryFn: () => apiGet('/proposta-troca/recebidas'),
  })
}

/**
 * Busca propostas de troca enviadas pelo usuário logado.
 * GET /proposta-troca/enviadas → List<PropostaTrocaRecebidaDTO>
 */
export function usePropostasEnviadas() {
  return useQuery<PropostaTrocaRecebidaDTO[]>({
    queryKey: ['propostas-troca', 'enviadas'],
    queryFn: () => apiGet('/proposta-troca/enviadas'),
  })
}

/**
 * Aceita uma proposta de troca recebida.
 * POST /proposta-troca/aceitar?idProposta=UUID
 */
export function useAceitarProposta() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (idProposta: string) =>
      apiPost(`/proposta-troca/aceitar?idProposta=${encodeURIComponent(idProposta)}`, null),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['propostas-troca'] })
      queryClient.invalidateQueries({ queryKey: ['figurinhas-usuario'] })
      queryClient.invalidateQueries({ queryKey: ['trocas'] })
    },
  })
}

/**
 * Recusa uma proposta de troca recebida.
 * POST /proposta-troca/recusar?idProposta=UUID
 */
export function useRecusarProposta() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (idProposta: string) =>
      apiPost(`/proposta-troca/recusar?idProposta=${encodeURIComponent(idProposta)}`, null),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['propostas-troca'] })
    },
  })
}

/**
 * Cancela uma proposta de troca enviada.
 * DELETE /proposta-troca/cancelar?idProposta=UUID
 */
export function useCancelarProposta() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (idProposta: string) =>
      apiDelete(`/proposta-troca/cancelar?idProposta=${encodeURIComponent(idProposta)}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['propostas-troca'] })
    },
  })
}
