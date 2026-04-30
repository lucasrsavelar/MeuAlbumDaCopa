import { useQuery } from '@tanstack/react-query'
import { apiGet } from '../lib/api'

/**
 * Busca usuários pelo username (termo mínimo: 2 caracteres).
 * staleTime de 30s para não re-buscar o mesmo termo repetidamente.
 * enabled: false quando termo < 2 chars.
 */
export function useBuscarUsuarios(termo: string) {
  return useQuery<string[]>({
    queryKey: ['usuarios', 'busca', termo],
    queryFn: () => apiGet(`/mac-user/buscar?termo=${encodeURIComponent(termo)}`),
    enabled: termo.length >= 2,
    staleTime: 30_000,
  })
}
