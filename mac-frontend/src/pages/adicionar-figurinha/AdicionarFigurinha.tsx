import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQueryClient } from '@tanstack/react-query'
import { useAllFigurinhas } from '../../hooks/useStaticData'
import { useFigurinhasUsuario } from '../../hooks/useFigurinhasUsuario'
import { apiPost } from '../../lib/api'
import type { Figurinha, FigurinhaUsuarioDTO } from '../../types'
import './AdicionarFigurinha.css'

const MAX_QTD = 99

function AdicionarFigurinha() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  const { data: figurinhas, isLoading } = useAllFigurinhas()
  const { data: figurinhasUsuario } = useFigurinhasUsuario()

  // Filtros
  const [busca, setBusca] = useState('')
  const [filtroTipo, setFiltroTipo] = useState<string>('todos')

  // Selecionadas: mapa { idFigurinha → { qty, addedAt } }
  const [selecionadas, setSelecionadas] = useState<Record<number, { qty: number; addedAt: number }>>({})

  // Submitting state
  const [submitting, setSubmitting] = useState(false)
  const [sucesso, setSucesso] = useState(false)
  const [erro, setErro] = useState('')

  // Tipos únicos para o dropdown
  const tiposUnicos = useMemo(() => {
    if (!figurinhas) return []
    const tipos = new Set(figurinhas.map(f => f.tipoFigurinha))
    return Array.from(tipos).sort()
  }, [figurinhas])

  // Filtra o catálogo por busca e tipo
  const figurinhasFiltradas = useMemo(() => {
    if (!figurinhas) return []
    return figurinhas.filter(f => {
      const matchBusca = busca === '' ||
        f.codigoFigurinha.toLowerCase().includes(busca.toLowerCase())
      const matchTipo = filtroTipo === 'todos' || f.tipoFigurinha === filtroTipo
      return matchBusca && matchTipo
    })
  }, [figurinhas, busca, filtroTipo])

  // Quantidade selecionada para adicionar
  const qtdSelecionada = (id: number) => selecionadas[id]?.qty ?? 0

  // Adiciona figurinha à seleção (ou incrementa)
  const adicionarFigurinha = (fig: Figurinha) => {
    setSelecionadas(prev => {
      const atual = prev[fig.id]?.qty ?? 0
      if (atual >= MAX_QTD) {
        return { ...prev, [fig.id]: { ...prev[fig.id], addedAt: Date.now() } }
      }
      return { ...prev, [fig.id]: { qty: atual + 1, addedAt: Date.now() } }
    })
  }

  // Incrementa quantidade
  const incrementar = (id: number) => {
    setSelecionadas(prev => {
      const atual = prev[id]?.qty ?? 0
      if (atual >= MAX_QTD) {
        return { ...prev, [id]: { ...prev[id], addedAt: Date.now() } }
      }
      return { ...prev, [id]: { qty: atual + 1, addedAt: Date.now() } }
    })
  }

  // Decrementa quantidade (remove se chegar a 0)
  const decrementar = (id: number) => {
    setSelecionadas(prev => {
      const atual = prev[id]?.qty ?? 0
      if (atual <= 1) {
        const next = { ...prev }
        delete next[id]
        return next
      }
      return { ...prev, [id]: { ...prev[id], qty: atual - 1 } }
    })
  }

  // Remove da seleção
  const remover = (id: number) => {
    setSelecionadas(prev => {
      const next = { ...prev }
      delete next[id]
      return next
    })
  }

  // Total de figurinhas selecionadas
  const totalSelecionadas = Object.values(selecionadas).reduce((a, data) => a + data.qty, 0)

  // Submit
  const handleSubmit = async () => {
    if (totalSelecionadas === 0) return

    setSubmitting(true)
    setErro('')
    setSucesso(false)

    const payload: FigurinhaUsuarioDTO[] = Object.entries(selecionadas).map(
      ([id, data]) => ({ idFigurinha: Number(id), quantidade: data.qty })
    )

    try {
      await apiPost('/figurinhas-usuario/adicionar', payload)
      // Invalida caches que dependem das figurinhas do usuário
      queryClient.invalidateQueries({ queryKey: ['figurinhas-usuario'] })
      setSelecionadas({})
      setSucesso(true)
      setTimeout(() => setSucesso(false), 3000)
    } catch (err: any) {
      setErro(err?.message || 'Erro ao adicionar figurinhas. Tente novamente.')
    } finally {
      setSubmitting(false)
    }
  }

  // Lookup de figurinha por ID (para o resumo)
  const figurinhaById = useMemo(() => {
    if (!figurinhas) return new Map<number, Figurinha>()
    return new Map(figurinhas.map(f => [f.id, f]))
  }, [figurinhas])

  const idsOrdenados = Object.entries(selecionadas)
    .sort(([, aData], [, bData]) => bData.addedAt - aData.addedAt)
    .map(([id]) => Number(id))

  return (
    <div className="af-container soccer-pattern">
      {/* Header */}
      <header className="af-header">
        <button className="af-back" onClick={() => navigate('/dashboard')} aria-label="Voltar">
          <span className="material-symbols-outlined">arrow_back</span>
        </button>
        <div className="af-header-info">
          <div className="af-header-icon">
            <span className="material-symbols-outlined">add_photo_alternate</span>
          </div>
          <div>
            <h1 className="af-title">Adicionar Figurinhas</h1>
            <p className="af-subtitle">Pesquise e selecione</p>
          </div>
        </div>
      </header>

      {/* Feedback messages */}
      {sucesso && (
        <div className="af-toast af-toast-success">
          <span className="material-symbols-outlined">check_circle</span>
          Figurinhas adicionadas com sucesso!
        </div>
      )}
      {erro && (
        <div className="af-toast af-toast-error">
          <span className="material-symbols-outlined">error</span>
          {erro}
        </div>
      )}

      <main className="af-main">
        {/* Filters */}
        <section className="af-filters">
          <div className="af-search-wrapper">
            <span className="material-symbols-outlined af-search-icon">search</span>
            <input
              id="af-search"
              type="text"
              className="af-search"
              placeholder="Pesquisar por código..."
              value={busca}
              onChange={e => setBusca(e.target.value)}
            />
            {busca && (
              <button className="af-search-clear" onClick={() => setBusca('')} aria-label="Limpar busca">
                <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>close</span>
              </button>
            )}
          </div>

          <div className="af-tipo-wrapper">
            <span className="material-symbols-outlined af-tipo-icon">filter_list</span>
            <select
              id="af-tipo-filter"
              className="af-tipo-select"
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
        <section className="af-catalog">
          {isLoading ? (
            <div className="af-loading">
              <span className="material-symbols-outlined af-loading-icon">sports_soccer</span>
              <p>Carregando catálogo...</p>
            </div>
          ) : busca === '' && filtroTipo === 'todos' ? (
            <div className="af-empty">
              <span className="material-symbols-outlined af-empty-icon">search</span>
              <p>Pesquise por código ou filtre por tipo</p>
            </div>
          ) : figurinhasFiltradas.length === 0 ? (
            <div className="af-empty">
              <span className="material-symbols-outlined af-empty-icon">search_off</span>
              <p>Nenhuma figurinha encontrada</p>
            </div>
          ) : (
            <div className="af-grid">
              {figurinhasFiltradas.map(fig => {
                const sel = qtdSelecionada(fig.id)
                const isSelected = sel > 0

                const qtdNoAlbum = figurinhasUsuario?.[fig.id] ?? 0
                const isNova = qtdNoAlbum === 0
                const isRepetida = qtdNoAlbum > 0

                return (
                  <button
                    key={fig.id}
                    className={`af-card ${isSelected ? 'is-selected' : ''} ${isNova ? 'is-nova' : ''} ${isRepetida ? 'is-repetida' : ''}`}
                    onClick={() => adicionarFigurinha(fig)}
                    title={`Adicionar ${fig.codigoFigurinha}`}
                  >
                    <span className="af-card-code">{fig.codigoFigurinha}</span>
                    {isSelected && (
                      <span className="af-card-badge">+{sel}</span>
                    )}
                  </button>
                )
              })}
            </div>
          )}
        </section>

        {/* Selection summary */}
        {idsOrdenados.length > 0 && (
          <section className="af-summary">
            <div className="af-summary-header">
              <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>shopping_cart</span>
              <h2>Selecionadas ({totalSelecionadas})</h2>
            </div>

            <div className="af-summary-list">
              {idsOrdenados.map(id => {
                const fig = figurinhaById.get(id)
                if (!fig) return null
                const sel = selecionadas[id]

                return (
                  <div key={id} className="af-summary-item">
                    <div className="af-summary-info">
                      <span className="af-summary-code">{fig.codigoFigurinha}</span>
                      {fig.nome && <span className="af-summary-name">{fig.nome}</span>}
                    </div>

                    <div className="af-summary-controls">
                      <button
                        className="af-qty-btn"
                        onClick={(e) => { e.stopPropagation(); decrementar(id) }}
                        aria-label="Diminuir quantidade"
                      >
                        <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>remove</span>
                      </button>
                      <span className="af-qty-value">{sel.qty}</span>
                      <button
                        className="af-qty-btn"
                        onClick={(e) => { e.stopPropagation(); incrementar(id) }}
                        disabled={sel.qty >= MAX_QTD}
                        aria-label="Aumentar quantidade"
                      >
                        <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>add</span>
                      </button>
                      <button
                        className="af-remove-btn"
                        onClick={(e) => { e.stopPropagation(); remover(id) }}
                        aria-label="Remover"
                      >
                        <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>delete</span>
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
      {totalSelecionadas > 0 && (
        <div className="af-bottom-bar">
          <button
            className="af-submit-btn"
            onClick={handleSubmit}
            disabled={submitting}
          >
            {submitting ? (
              <>
                <span className="material-symbols-outlined af-spin">sports_soccer</span>
                Adicionando...
              </>
            ) : (
              <>
                <span className="material-symbols-outlined">check</span>
                Adicionar {totalSelecionadas} figurinha{totalSelecionadas > 1 ? 's' : ''}
              </>
            )}
          </button>
        </div>
      )}
    </div>
  )
}

export default AdicionarFigurinha
