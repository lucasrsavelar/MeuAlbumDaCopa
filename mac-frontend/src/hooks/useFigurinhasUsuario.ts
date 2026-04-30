import { useQuery } from '@tanstack/react-query'
import { apiGet } from '../lib/api'
import type { FigurinhasUsuarioMap } from '../types'

/**
 * Busca as figurinhas do usuário logado (mapa id → quantidade).
 * Cache infinito — refetch apenas via invalidateQueries().
 */
export function useFigurinhasUsuario() {
  return useQuery<FigurinhasUsuarioMap>({
    queryKey: ['figurinhas-usuario'],
    queryFn: () => apiGet('/figurinhas-usuario/byUsuario'),
  })
}