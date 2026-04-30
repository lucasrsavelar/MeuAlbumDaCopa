import { useQuery } from '@tanstack/react-query'
import { apiGet } from '../lib/api'

/**
 * Busca a lista de amigos (usernames) do usuário logado.
 * Cache infinito — refetch apenas via invalidateQueries().
 */
export function useAmizades() {
  return useQuery<string[]>({
    queryKey: ['amizades'],
    queryFn: () => apiGet('/amizade/byUsuario'),
  })
}
