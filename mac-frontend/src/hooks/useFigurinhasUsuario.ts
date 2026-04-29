import { useQuery } from '@tanstack/react-query'
import { apiGet } from '../lib/api'
import type { FigurinhasUsuarioMap } from '../types'

/**
 * Busca as figurinhas do usuário logado (mapa id → quantidade).
 * Refetch a cada 30s para manter atualizado, mas pode ser invalidado manualmente.
 */
export function useFigurinhasUsuario() {
  return useQuery<FigurinhasUsuarioMap>({
    queryKey: ['figurinhas-usuario'],
    queryFn: () => apiGet('/figurinhas-usuario/byUsuario'),
    staleTime: Infinity,
  })
}

/**
 * Busca IDs das figurinhas faltantes do usuário logado.
 */
export function useFigurinhasFaltantes() {
  return useQuery<number[]>({
    queryKey: ['figurinhas-usuario', 'faltantes'],
    queryFn: () => apiGet('/figurinha-usuario/faltantes'),
    staleTime: Infinity,
  })
}

/**
 * Busca IDs das figurinhas repetidas do usuário logado.
 */
export function useFigurinhasRepetidas() {
  return useQuery<number[]>({
    queryKey: ['figurinhas-usuario', 'repetidas'],
    queryFn: () => apiGet('/figurinha-usuario/repetidas'),
    staleTime: Infinity,
  })
}
