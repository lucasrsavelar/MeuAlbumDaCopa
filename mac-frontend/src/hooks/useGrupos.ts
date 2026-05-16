import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { apiGet, apiPost, apiDelete } from '../lib/api'
import type { GrupoDTO } from '../types'

/**
 * Busca os grupos do usuário logado.
 * GET /grupo/byUsuario → List<GrupoDTO>
 * Cache infinito — refetch apenas via invalidateQueries().
 */
export function useGrupos() {
  return useQuery<GrupoDTO[]>({
    queryKey: ['grupos'],
    queryFn: () => apiGet('/grupo/byUsuario'),
  })
}

/**
 * Cria um novo grupo.
 * POST /grupo/criar?nomeGrupo=X
 */
export function useCriarGrupo() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (nomeGrupo: string) =>
      apiPost(`/grupo/criar?nomeGrupo=${encodeURIComponent(nomeGrupo)}`, null),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['grupos'] })
    },
  })
}

/**
 * Convida um usuário para o grupo.
 * POST /grupo/convidar?nomeGrupo=X&usernameConvidado=Y
 */
export function useConvidarParaGrupo() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ nomeGrupo, usernameConvidado }: { nomeGrupo: string; usernameConvidado: string }) =>
      apiPost(`/grupo/convidar?nomeGrupo=${encodeURIComponent(nomeGrupo)}&usernameConvidado=${encodeURIComponent(usernameConvidado)}`, null),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['grupos'] })
    },
  })
}

/**
 * Remove um membro do grupo (apenas admin).
 * POST /grupo/remover-membro?nomeGrupo=X&usernameRemovido=Y
 */
export function useRemoverMembro() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ nomeGrupo, usernameRemovido }: { nomeGrupo: string; usernameRemovido: string }) =>
      apiPost(`/grupo/remover-membro?nomeGrupo=${encodeURIComponent(nomeGrupo)}&usernameRemovido=${encodeURIComponent(usernameRemovido)}`, null),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['grupos'] })
    },
  })
}

/**
 * Sai do grupo.
 * POST /grupo/sair?nomeGrupo=X
 */
export function useSairDoGrupo() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (nomeGrupo: string) =>
      apiPost(`/grupo/sair?nomeGrupo=${encodeURIComponent(nomeGrupo)}`, null),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['grupos'] })
    },
  })
}

/**
 * Deleta o grupo (apenas admin).
 * DELETE /grupo/deletar?nomeGrupo=X
 */
export function useDeletarGrupo() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (nomeGrupo: string) =>
      apiDelete(`/grupo/deletar?nomeGrupo=${encodeURIComponent(nomeGrupo)}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['grupos'] })
    },
  })
}
