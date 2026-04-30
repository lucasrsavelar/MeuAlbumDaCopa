import { useQuery } from '@tanstack/react-query'
import { apiGet } from '../lib/api'
import type { Figurinha, Pais } from '../types'

/**
 * Busca informações do usuário atual.
 * Cache infinito — refetch apenas via invalidateQueries().
 */
export function useUsuarioLogado() {
  return useQuery<string>({
    queryKey: ['usuario', 'logado'],
    queryFn: () => apiGet('/mac-user/me'),
  })
}

/**
 * Busca todas as figurinhas do catálogo.
 * Cache infinito — refetch apenas via invalidateQueries().
 */
export function useAllFigurinhas() {
  return useQuery<Figurinha[]>({
    queryKey: ['figurinhas', 'all'],
    queryFn: () => apiGet('/figurinha/all'),
  })
}

/**
 * Busca todos os países.
 * Cache infinito — refetch apenas via invalidateQueries().
 */
export function useAllPaises() {
  return useQuery<Pais[]>({
    queryKey: ['paises', 'all'],
    queryFn: () => apiGet('/pais/all'),
  })
}
