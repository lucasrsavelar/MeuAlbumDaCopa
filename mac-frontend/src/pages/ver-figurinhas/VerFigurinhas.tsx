import { useState, useMemo } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useAllFigurinhas } from '../../hooks/useStaticData'
import { useFigurinhasUsuario } from '../../hooks/useFigurinhasUsuario'
import type { Figurinha, FigurinhasUsuarioMap } from '../../types'
import './VerFigurinhas.css'

type TipoFiltro = 'colecionadas' | 'faltando' | 'repetidas'

const TITULOS: Record<TipoFiltro, string> = {
  colecionadas: 'Colecionadas',
  faltando: 'Faltando',
  repetidas: 'Repetidas',
}

const ICONES: Record<TipoFiltro, string> = {
  colecionadas: 'check_circle',
  faltando: 'search',
  repetidas: 'content_copy',
}

const CORES: Record<TipoFiltro, string> = {
  colecionadas: 'is-collected',
  faltando: 'is-missing',
  repetidas: 'is-repeated',
}

function filtrarFigurinhas(
  tipo: TipoFiltro,
  figurinhas: Figurinha[],
  figurinhasUsuario: FigurinhasUsuarioMap
): Figurinha[] {
  switch (tipo) {
    case 'colecionadas':
      return figurinhas.filter(f => f.id in figurinhasUsuario)
    case 'faltando':
      return figurinhas.filter(f => !(f.id in figurinhasUsuario))
    case 'repetidas':
      return figurinhas.filter(f => (figurinhasUsuario[f.id] ?? 0) > 1)
  }
}

function VerFigurinhas() {
  const navigate = useNavigate()
  const { tipo } = useParams<{ tipo: string }>()
  const [expandedId, setExpandedId] = useState<number | null>(null)
  const [busca, setBusca] = useState('')
  const [filtroTipo, setFiltroTipo] = useState<string>('todos')

  const { data: figurinhas, isLoading: loadingFigurinhas } = useAllFigurinhas()
  const { data: figurinhasUsuario, isLoading: loadingUsuario } = useFigurinhasUsuario()

  const isLoading = loadingFigurinhas || loadingUsuario

  // Valida o tipo da URL
  const tipoFiltro = (tipo && tipo in TITULOS ? tipo : 'colecionadas') as TipoFiltro
  const titulo = TITULOS[tipoFiltro]
  const icone = ICONES[tipoFiltro]
  const corClass = CORES[tipoFiltro]

  // Filtra por categoria (colecionadas/faltando/repetidas)
  const listaCategoria = figurinhas && figurinhasUsuario
    ? filtrarFigurinhas(tipoFiltro, figurinhas, figurinhasUsuario)
    : []

  // Tipos únicos disponíveis nesta categoria
  const tiposUnicos = useMemo(() => {
    const tipos = new Set(listaCategoria.map(f => f.tipoFigurinha))
    return Array.from(tipos).sort()
  }, [listaCategoria])

  // Filtra por busca e tipo
  const listaFiltrada = useMemo(() => {
    return listaCategoria.filter(f => {
      const matchBusca = busca === '' ||
        f.codigoFigurinha.toLowerCase().includes(busca.toLowerCase())
      const matchTipo = filtroTipo === 'todos' || f.tipoFigurinha === filtroTipo
      return matchBusca && matchTipo
    })
  }, [listaCategoria, busca, filtroTipo])

  const toggleExpand = (id: number) => {
    setExpandedId(prev => prev === id ? null : id)
  }

  return (
    <div className="vf-container soccer-pattern">
      {/* Header */}
      <header className="vf-header">
        <button className="vf-back" onClick={() => navigate('/dashboard')} aria-label="Voltar">
          <span className="material-symbols-outlined">arrow_back</span>
        </button>
        <div className="vf-header-info">
          <div className={`vf-header-icon ${corClass}`}>
            <span className="material-symbols-outlined">{icone}</span>
          </div>
          <div>
            <h1 className="vf-title">{titulo}</h1>
            <p className="vf-subtitle">
              {isLoading ? 'Carregando...' : `${listaFiltrada.length} figurinhas`}
            </p>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="vf-content">
        {/* Filters */}
        {!isLoading && (
          <section className="vf-filters">
            <div className="vf-search-wrapper">
              <span className="material-symbols-outlined vf-search-icon">search</span>
              <input
                type="text"
                className="vf-search"
                placeholder="Pesquisar por código..."
                value={busca}
                onChange={e => setBusca(e.target.value)}
              />
              {busca && (
                <button className="vf-search-clear" onClick={() => setBusca('')} aria-label="Limpar busca">
                  <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>close</span>
                </button>
              )}
            </div>

            <div className="vf-tipo-wrapper">
              <span className="material-symbols-outlined vf-tipo-icon">filter_list</span>
              <select
                className="vf-tipo-select"
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
        )}
        {isLoading ? (
          <div className="vf-loading">
            <span className="material-symbols-outlined vf-loading-icon">sports_soccer</span>
            <p>Carregando figurinhas...</p>
          </div>
        ) : listaFiltrada.length === 0 ? (
          <div className="vf-empty">
            <span className="material-symbols-outlined vf-empty-icon">inventory_2</span>
            <p>Nenhuma figurinha nesta categoria</p>
          </div>
        ) : (
          <div className="vf-grid">
            {listaFiltrada.map(figurinha => {
              const isExpanded = expandedId === figurinha.id
              const qty = figurinhasUsuario ? figurinhasUsuario[figurinha.id] : undefined

              return (
                <div
                  key={figurinha.id}
                  className={`vf-card ${corClass} ${isExpanded ? 'is-expanded' : ''}`}
                  onClick={() => toggleExpand(figurinha.id)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') toggleExpand(figurinha.id) }}
                >
                  <div className="vf-card-header">
                    <span className="vf-card-code">{figurinha.codigoFigurinha}</span>
                    <span className={`material-symbols-outlined vf-card-chevron ${isExpanded ? 'is-open' : ''}`}>
                      expand_more
                    </span>
                  </div>

                  {isExpanded && (
                    <div className="vf-card-details">
                      {figurinha.nome && (
                        <div className="vf-detail-row">
                          <span className="material-symbols-outlined vf-detail-icon">person</span>
                          <span className="vf-detail-label">Nome</span>
                          <span className="vf-detail-value">{figurinha.nome}</span>
                        </div>
                      )}
                      {figurinha.posicao && (
                        <div className="vf-detail-row">
                          <span className="material-symbols-outlined vf-detail-icon">sports_soccer</span>
                          <span className="vf-detail-label">Posição</span>
                          <span className="vf-detail-value">{figurinha.posicao}</span>
                        </div>
                      )}
                      {figurinha.pais?.nomePais && (
                        <div className="vf-detail-row">
                          <span className="material-symbols-outlined vf-detail-icon">flag</span>
                          <span className="vf-detail-label">País</span>
                          <span className="vf-detail-value">{figurinha.pais.nomePais}</span>
                        </div>
                      )}
                      {figurinha.tipoFigurinha && (
                        <div className="vf-detail-row">
                          <span className="material-symbols-outlined vf-detail-icon">style</span>
                          <span className="vf-detail-label">Tipo</span>
                          <span className="vf-detail-value">{figurinha.tipoFigurinha}</span>
                        </div>
                      )}
                      {qty !== undefined && qty > 1 && (
                        <div className="vf-detail-row">
                          <span className="material-symbols-outlined vf-detail-icon">content_copy</span>
                          <span className="vf-detail-label">Quantidade</span>
                          <span className="vf-detail-value vf-detail-qty">{qty}×</span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </main>
    </div>
  )
}

export default VerFigurinhas
