import { useQuery } from '@tanstack/react-query'
import { apiGet } from '../lib/api'
import type { Figurinha, Pais } from '../types'

/**
 * Busca todas as figurinhas do catálogo.
 * staleTime: Infinity → só busca uma vez, mantém em memória para sempre.
 */
export function useAllFigurinhas() {
  return useQuery<Figurinha[]>({
    queryKey: ['figurinhas', 'all'],
    queryFn: () => apiGet('/figurinha/all'),
    staleTime: Infinity,
  })
}

/**
 * Busca todos os países.
 * staleTime: Infinity → só busca uma vez, mantém em memória para sempre.
 */
export function useAllPaises() {
  return useQuery<Pais[]>({
    queryKey: ['paises', 'all'],
    queryFn: () => apiGet('/pais/all'),
    staleTime: Infinity,
  })
}
