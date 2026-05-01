import { useQuery } from '@tanstack/react-query'
import { apiGet } from '../lib/api'
import type { TrocasDTO } from '../types'

/**
 * Busca trocas possíveis entre o usuário logado e seus amigos.
 * GET /trocas/procurar → List<TrocasDTO>
 */
export function useTrocas() {
  return useQuery<TrocasDTO[]>({
    queryKey: ['trocas'],
    queryFn: () => apiGet('/trocas/procurar'),
  })
}
