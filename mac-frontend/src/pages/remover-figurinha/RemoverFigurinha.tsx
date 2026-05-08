import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQueryClient } from '@tanstack/react-query'
import { useAllFigurinhas } from '../../hooks/useStaticData'
import { useFigurinhasUsuario } from '../../hooks/useFigurinhasUsuario'
import { apiPost } from '../../lib/api'
import type { Figurinha, FigurinhaUsuarioDTO } from '../../types'
import './RemoverFigurinha.css'

function RemoverFigurinha() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  const { data: figurinhas, isLoading: loadingFigurinhas } = useAllFigurinhas()
  const { data: figurinhasUsuario, isLoading: loadingUsuario } = useFigurinhasUsuario()

  const isLoading = loadingFigurinhas || loadingUsuario

  // Filtros
  const [busca, setBusca] = useState('')
  const [filtroTipo, setFiltroTipo] = useState<string>('todos')

  // Alterações: mapa { idFigurinha → nova quantidade desejada }
  const [alteracoes, setAlteracoes] = useState<Record<number, number>>({})

  // Submitting state
  const [submitting, setSubmitting] = useState(false)
  const [sucesso, setSucesso] = useState(false)
  const [erro, setErro] = useState('')

  // Figurinhas que o usuário possui
  const figurinhasDoUsuario = useMemo(() => {
    if (!figurinhas || !figurinhasUsuario) return []
    return figurinhas.filter(f => f.id in figurinhasUsuario)
  }, [figurinhas, figurinhasUsuario])

  // Tipos únicos disponíveis
  const tiposUnicos = useMemo(() => {
    const tipos = new Set(figurinhasDoUsuario.map(f => f.tipoFigurinha))
    return Array.from(tipos).sort()
  }, [figurinhasDoUsuario])

  // Filtra por busca e tipo
  const figurinhasFiltradas = useMemo(() => {
    if (busca === '' && filtroTipo === 'todos') return []
    return figurinhasDoUsuario.filter(f => {
      const matchBusca = busca === '' ||
        f.codigoFigurinha.toLowerCase().includes(busca.toLowerCase())
      const matchTipo = filtroTipo === 'todos' || f.tipoFigurinha === filtroTipo
      return matchBusca && matchTipo
    })
  }, [figurinhasDoUsuario, busca, filtroTipo])

  // Quantidade original do usuário
  const qtdOriginal = (id: number) => figurinhasUsuario?.[id] ?? 0

  // Quantidade atual (original se não alterada)
  const qtdAtual = (id: number) =>
    id in alteracoes ? alteracoes[id] : qtdOriginal(id)

  // Selecionar uma figurinha para edição (coloca no mapa de alterações)
  const selecionarFigurinha = (fig: Figurinha) => {
    if (!(fig.id in alteracoes)) {
      setAlteracoes(prev => ({ ...prev, [fig.id]: qtdOriginal(fig.id) }))
    }
  }

  // Decrementar quantidade
  const decrementar = (id: number) => {
    setAlteracoes(prev => {
      const atual = prev[id] ?? qtdOriginal(id)
      if (atual <= 0) return prev
      return { ...prev, [id]: atual - 1 }
    })
  }

  // Cancelar alteração (remove do mapa)
  const cancelar = (id: number) => {
    setAlteracoes(prev => {
      const next = { ...prev }
      delete next[id]
      return next
    })
  }

  // Itens realmente alterados (quantidade diferente da original)
  const itensAlterados = useMemo(() => {
    return Object.entries(alteracoes)
      .filter(([id, qty]) => qty !== qtdOriginal(Number(id)))
      .map(([id, qty]) => ({ id: Number(id), qty }))
  }, [alteracoes, figurinhasUsuario])

  // Lookup de figurinha por ID
  const figurinhaById = useMemo(() => {
    if (!figurinhas) return new Map<number, Figurinha>()
    return new Map(figurinhas.map(f => [f.id, f]))
  }, [figurinhas])

  // Submit
  const handleSubmit = async () => {
    if (itensAlterados.length === 0) return

    setSubmitting(true)
    setErro('')
    setSucesso(false)

    const payload: FigurinhaUsuarioDTO[] = itensAlterados.map(
      ({ id, qty }) => ({ idFigurinha: id, quantidade: qty })
    )

    try {
      await apiPost('/figurinhas-usuario/corrigir', payload)
      queryClient.invalidateQueries({ queryKey: ['figurinhas-usuario'] })
      setAlteracoes({})
      setSucesso(true)
      setTimeout(() => setSucesso(false), 3000)
    } catch (err: any) {
      setErro(err?.message || 'Erro ao corrigir figurinhas. Tente novamente.')
    } finally {
      setSubmitting(false)
    }
  }

  const idsOrdenados = Object.keys(alteracoes)
    .map(Number)
    .sort((a, b) => {
      const fa = figurinhaById.get(a)
      const fb = figurinhaById.get(b)
      return (fa?.codigoFigurinha ?? '').localeCompare(fb?.codigoFigurinha ?? '')
    })

  return (
    <div className="rf-container soccer-pattern">
      {/* Header */}
      <header className="rf-header">
        <button className="rf-back" onClick={() => navigate('/dashboard')} aria-label="Voltar">
          <span className="material-symbols-outlined">arrow_back</span>
        </button>
        <div className="rf-header-info">
          <div className="rf-header-icon">
            <span className="material-symbols-outlined">delete</span>
          </div>
          <div>
            <h1 className="rf-title">Remover Figurinhas</h1>
            <p className="rf-subtitle">Corrija seu álbum</p>
          </div>
        </div>
      </header>

      {/* Feedback */}
      {sucesso && (
        <div className="rf-toast rf-toast-success">
          <span className="material-symbols-outlined">check_circle</span>
          Figurinhas corrigidas com sucesso!
        </div>
      )}
      {erro && (
        <div className="rf-toast rf-toast-error">
          <span className="material-symbols-outlined">error</span>
          {erro}
        </div>
      )}

      <main className="rf-main">
        {/* Filters */}
        <section className="rf-filters">
          <div className="rf-search-wrapper">
            <span className="material-symbols-outlined rf-search-icon">search</span>
            <input
              type="text"
              className="rf-search"
              placeholder="Pesquisar por código..."
              value={busca}
              onChange={e => setBusca(e.target.value)}
            />
            {busca && (
              <button className="rf-search-clear" onClick={() => setBusca('')} aria-label="Limpar busca">
                <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>close</span>
              </button>
            )}
          </div>

          <div className="rf-tipo-wrapper">
            <span className="material-symbols-outlined rf-tipo-icon">filter_list</span>
            <select
              className="rf-tipo-select"
              value={filtroTipo}
              onChange={e => setFiltroTipo(e.target.value)}
            >
              <option value="todos">Todos os tipos</option>
              {tiposUnicos.map(tipo => (
                <option key={tipo} value={tipo}>{tipo}</option>
              ))}
            </select>
          </div>
        </section>

        {/* Catalog grid */}
        <section className="rf-catalog">
          {isLoading ? (
            <div className="rf-loading">
              <span className="material-symbols-outlined rf-loading-icon">sports_soccer</span>
              <p>Carregando figurinhas...</p>
            </div>
          ) : busca === '' && filtroTipo === 'todos' ? (
            <div className="rf-empty">
              <span className="material-symbols-outlined rf-empty-icon">search</span>
              <p>Pesquise por código ou filtre por tipo</p>
            </div>
          ) : figurinhasFiltradas.length === 0 ? (
            <div className="rf-empty">
              <span className="material-symbols-outlined rf-empty-icon">search_off</span>
              <p>Nenhuma figurinha encontrada</p>
            </div>
          ) : (
            <div className="rf-grid">
              {figurinhasFiltradas.map(fig => {
                const isSelected = fig.id in alteracoes
                const qty = qtdAtual(fig.id)
                const original = qtdOriginal(fig.id)
                const changed = isSelected && qty !== original
                const isNova = qty === 1
                const isRepetida = qty >= 2

                return (
                  <button
                    key={fig.id}
                    className={`rf-card ${isSelected ? 'is-selected' : ''} ${changed ? 'is-changed' : ''} ${isNova ? 'is-nova' : ''} ${isRepetida ? 'is-repetida' : ''}`}
                    onClick={() => selecionarFigurinha(fig)}
                    title={`${fig.codigoFigurinha} — ${original}×`}
                  >
                    <span className="rf-card-code">{fig.codigoFigurinha}</span>
                    <span className="rf-card-qty">{qty}×</span>
                    {changed && <span className="rf-card-original">era {original}×</span>}
                  </button>
                )
              })}
            </div>
          )}
        </section>

        {/* Selection summary */}
        {idsOrdenados.length > 0 && (
          <section className="rf-summary">
            <div className="rf-summary-header">
              <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>edit_note</span>
              <h2>Alterações ({itensAlterados.length})</h2>
            </div>

            <div className="rf-summary-list">
              {idsOrdenados.map(id => {
                const fig = figurinhaById.get(id)
                if (!fig) return null
                const original = qtdOriginal(id)
                const atual = alteracoes[id]
                const changed = atual !== original

                return (
                  <div key={id} className={`rf-summary-item ${changed ? 'is-changed' : ''}`}>
                    <div className="rf-summary-info">
                      <span className="rf-summary-code">{fig.codigoFigurinha}</span>
                      {fig.nome && <span className="rf-summary-name">{fig.nome}</span>}
                    </div>

                    <div className="rf-summary-controls">
                      <span className="rf-summary-original">{original}×</span>
                      <span className="material-symbols-outlined rf-summary-arrow">arrow_forward</span>

                      <button
                        className="rf-qty-btn"
                        onClick={() => decrementar(id)}
                        disabled={atual <= 0}
                        aria-label="Diminuir quantidade"
                      >
                        <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>remove</span>
                      </button>

                      <span className={`rf-qty-value ${changed ? 'is-changed' : ''}`}>{atual}×</span>

                      <button
                        className="rf-cancel-btn"
                        onClick={() => cancelar(id)}
                        aria-label="Cancelar alteração"
                        title="Cancelar"
                      >
                        <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>undo</span>
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          </section>
        )}
      </main>

      {/* Fixed bottom submit bar */}
      {itensAlterados.length > 0 && (
        <div className="rf-bottom-bar">
          <button
            className="rf-submit-btn"
            onClick={handleSubmit}
            disabled={submitting}
          >
            {submitting ? (
              <>
                <span className="material-symbols-outlined rf-spin">sports_soccer</span>
                Corrigindo...
              </>
            ) : (
              <>
                <span className="material-symbols-outlined">check</span>
                Confirmar {itensAlterados.length} alteração{itensAlterados.length > 1 ? 'ões' : ''}
              </>
            )}
          </button>
        </div>
      )}
    </div>
  )
}

export default RemoverFigurinha
