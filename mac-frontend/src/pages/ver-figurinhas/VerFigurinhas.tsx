import { useState, useMemo } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useHeaderCollapse } from '../../hooks/useHeaderCollapse'
import { useAllFigurinhas } from '../../hooks/useStaticData'
import { useFigurinhasUsuario } from '../../hooks/useFigurinhasUsuario'
import type { Figurinha, FigurinhasUsuarioMap } from '../../types'
import './VerFigurinhas.css'

type SortOption = 'alfabetica' | 'album'
type Tab = 'geral' | 'pais'

interface CountryStats {
  codigoPais: string
  nomePais: string
  totalFigurinhas: number
  temEscudo: boolean
  temFotoEquipe: boolean
  jogadoresPossuidos: number
}

const FLAG_MAP: Record<string, string> = {
  ARG: 'ar', BRA: 'br', ESP: 'es', MEX: 'mx', RSA: 'za', KOR: 'kr', CZE: 'cz',
  CAN: 'ca', BIH: 'ba', QAT: 'qa', SUI: 'ch', MAR: 'ma', HAI: 'ht', SCO: 'gb-sct',
  USA: 'us', PAR: 'py', AUS: 'au', TUR: 'tr', GER: 'de', CUW: 'cw', CIV: 'ci',
  ECU: 'ec', NED: 'nl', JPN: 'jp', SWE: 'se', TUN: 'tn', BEL: 'be', EGY: 'eg',
  IRN: 'ir', NZL: 'nz', CPV: 'cv', KSA: 'sa', URU: 'uy', FRA: 'fr', SEN: 'sn',
  IRQ: 'iq', NOR: 'no', ALG: 'dz', AUT: 'at', JOR: 'jo', POR: 'pt', COD: 'cd',
  UZB: 'uz', COL: 'co', ENG: 'gb-eng', CRO: 'hr', GHA: 'gh', PAN: 'pa'
}

const ORDEM_PREFIXOS = [
  "00", "FWC_1_8", "MEX", "RSA", "KOR", "CZE", "CAN", "BIH", "QAT", "SUI", "BRA",
  "MAR", "HAI", "SCO", "USA", "PAR", "AUS", "TUR", "GER", "CUW", "CIV", "ECU",
  "NED", "JPN", "SWE", "TUN", "BEL", "EGY", "IRN", "NZL", "ESP", "CPV", "KSA",
  "URU", "FRA", "SEN", "IRQ", "NOR", "ARG", "ALG", "AUT", "JOR", "POR", "COD",
  "UZB", "COL", "ENG", "CRO", "GHA", "PAN", "FWC_9_19"
]

function getAlbumRank(codigo: string): number {
  if (codigo === "00") return 0;

  const match = codigo.match(/^([a-zA-Z]+)(\d+)$/);
  if (!match) return 999999;

  const prefix = match[1].toUpperCase();
  const num = parseInt(match[2], 10);

  let prefixKey = prefix;
  if (prefix === "FWC") {
    prefixKey = num <= 8 ? "FWC_1_8" : "FWC_9_19";
  }

  const prefixIndex = ORDEM_PREFIXOS.indexOf(prefixKey);
  if (prefixIndex === -1) return 999999;

  return (prefixIndex + 1) * 1000 + num;
}

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
  const [sortType, setSortType] = useState<SortOption>('alfabetica')
  const [tab, setTab] = useState<Tab>('geral')
  const { isHeaderCollapsed, setIsHeaderCollapsed, isAtTop } = useHeaderCollapse()

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

  // Filtra por busca e tipo, e ordena
  const listaFiltrada = useMemo(() => {
    const filtered = listaCategoria.filter(f => {
      const matchBusca = busca === '' ||
        f.codigoFigurinha.toLowerCase().includes(busca.toLowerCase())
      const matchTipo = filtroTipo === 'todos' || f.tipoFigurinha === filtroTipo
      return matchBusca && matchTipo
    })

    if (sortType === 'album') {
      return filtered.sort((a, b) => getAlbumRank(a.codigoFigurinha) - getAlbumRank(b.codigoFigurinha))
    }

    // Default alphabetical (preserva a ordem natural vinda do backend)
    return filtered
  }, [listaCategoria, busca, filtroTipo, sortType])

  const toggleExpand = (id: number) => {
    setExpandedId(prev => prev === id ? null : id)
  }

  // Estatísticas por país
  const statsPorPais = useMemo(() => {
    const statsMap = new Map<string, CountryStats>()
    let especiaisCount = 0

    listaCategoria.forEach(f => {
      const match = f.codigoFigurinha.match(/^([a-zA-Z]+)(\d+)$/)
      if (f.codigoFigurinha === "00" || (match && match[1].toUpperCase() === "FWC")) {
        especiaisCount++
      } else if (match && f.pais) {
        const prefix = match[1].toUpperCase()
        const num = parseInt(match[2], 10)

        let stats = statsMap.get(prefix)
        if (!stats) {
          stats = {
            codigoPais: prefix,
            nomePais: f.pais.nomePais,
            totalFigurinhas: 0,
            temEscudo: false,
            temFotoEquipe: false,
            jogadoresPossuidos: 0,
          }
          statsMap.set(prefix, stats)
        }

        stats.totalFigurinhas++
        if (num === 1) stats.temEscudo = true
        else if (num === 13) stats.temFotoEquipe = true
        else stats.jogadoresPossuidos++
      }
    })

    const sortedCountries = Array.from(statsMap.values()).sort((a, b) => {
      if (b.totalFigurinhas !== a.totalFigurinhas) return b.totalFigurinhas - a.totalFigurinhas
      if (a.temEscudo !== b.temEscudo) return a.temEscudo ? -1 : 1
      if (a.temFotoEquipe !== b.temFotoEquipe) return a.temFotoEquipe ? -1 : 1
      return a.nomePais.localeCompare(b.nomePais)
    })

    return {
      especiaisCount,
      countries: sortedCountries
    }
  }, [listaCategoria])

  return (
    <div className="vf-container soccer-pattern">
      {/* Header */}
      <header className={`vf-header ${isHeaderCollapsed ? 'is-collapsed' : ''}`}>
        <button className="vf-back" onClick={() => navigate('/dashboard')} aria-label="Voltar">
          <span className="material-symbols-outlined">arrow_back</span>
        </button>
        <div className="vf-header-info" style={{ flex: 1 }}>
          <div className={`vf-header-icon ${corClass}`}>
            <span className="material-symbols-outlined">{icone}</span>
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <h1 className="vf-title">{titulo}</h1>
              {!isAtTop && (
                <button 
                  className="vf-header-toggle" 
                  onClick={() => setIsHeaderCollapsed(!isHeaderCollapsed)}
                  aria-label={isHeaderCollapsed ? 'Expandir cabeçalho' : 'Reduzir cabeçalho'}
                >
                  <span className="material-symbols-outlined">
                    {isHeaderCollapsed ? 'expand_more' : 'expand_less'}
                  </span>
                </button>
              )}
            </div>
            <p className="vf-subtitle">
              {isLoading ? 'Carregando...' : `${listaFiltrada.length} figurinhas`}
            </p>
          </div>
        </div>
        {tipoFiltro === 'colecionadas' && (
          <div className="vf-tabs">
            <button
              className={`vf-tab ${tab === 'geral' ? 'is-active' : ''}`}
              onClick={() => setTab('geral')}
            >
              Visão Geral
            </button>
            <button
              className={`vf-tab ${tab === 'pais' ? 'is-active' : ''}`}
              onClick={() => setTab('pais')}
            >
              Visão por País
            </button>
          </div>
        )}
      </header>

      {/* Content */}
      <main className="vf-content">
        {tipoFiltro !== 'colecionadas' || tab === 'geral' ? (
          <>
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

                <div className="vf-sort-wrapper">
                  <span className="material-symbols-outlined vf-sort-icon">sort</span>
                  <select
                    className="vf-sort-select"
                    value={sortType}
                    onChange={e => setSortType(e.target.value as SortOption)}
                  >
                    <option value="alfabetica">Ordem alfabética</option>
                    <option value="album">Ordem do álbum</option>
                  </select>
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

                  const isRepetidas = tipoFiltro === 'repetidas'
                  const duplicates = qty !== undefined && qty > 1 ? qty - 1 : 0
                  const showQtyRow = isRepetidas ? duplicates > 0 : (qty !== undefined && qty > 1)
                  const qtyValueDisplay = isRepetidas ? duplicates : qty
                  const qtyLabel = isRepetidas ? 'Repetidas' : 'Quantidade'

                  return (
                    <div
                      key={figurinha.id}
                      className={`vf-card ${corClass} ${isExpanded ? 'is-expanded' : ''}`}
                      onClick={() => toggleExpand(figurinha.id)}
                      role="button"
                      tabIndex={0}
                      onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') toggleExpand(figurinha.id) }}
                    >
                      <div className={`vf-card-header ${isRepetidas && duplicates > 0 ? 'has-badge' : ''}`}>
                        <span className="vf-card-code">{figurinha.codigoFigurinha}</span>
                        {isRepetidas && duplicates > 0 && (
                          <span className="vf-card-badge">x{duplicates}</span>
                        )}
                        <div className="vf-card-header-actions">
                          <span className={`material-symbols-outlined vf-card-chevron ${isExpanded ? 'is-open' : ''}`}>
                            expand_more
                          </span>
                        </div>
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
                          {showQtyRow && (
                            <div className="vf-detail-row">
                              <span className="material-symbols-outlined vf-detail-icon">content_copy</span>
                              <span className="vf-detail-label">{qtyLabel}</span>
                              <span className="vf-detail-value vf-detail-qty">{qtyValueDisplay}×</span>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            )}
          </>
        ) : (
          /* Visão por País Tab */
          <div className="vf-country-view">
            {isLoading ? (
              <div className="vf-loading">
                <span className="material-symbols-outlined vf-loading-icon">sports_soccer</span>
                <p>Carregando figurinhas...</p>
              </div>
            ) : (
              <div className="vf-table-container">
                <table className="vf-country-table">
                  <thead>
                    <tr>
                      <th>País</th>
                      <th className="text-center">Escudo</th>
                      <th className="text-center">Equipe</th>
                      <th className="text-center">Jogadores</th>
                    </tr>
                  </thead>
                  <tbody>
                    {/* Especiais sempre no topo */}
                    <tr className="vf-row-especiais">
                      <td>
                        <div className="vf-country-name">
                          <span className="material-symbols-outlined vf-special-icon">star</span>
                          <span>ESPECIAIS</span>
                        </div>
                      </td>
                      <td className="text-center">-</td>
                      <td className="text-center">-</td>
                      <td className="text-center">
                        <span className="vf-players-count">{statsPorPais.especiaisCount}/20</span>
                      </td>
                    </tr>

                    {/* Lista de países */}
                    {statsPorPais.countries.map(country => (
                      <tr key={country.codigoPais}>
                        <td>
                          <div className="vf-country-name">
                            {FLAG_MAP[country.codigoPais] ? (
                              <span className={`fi fi-${FLAG_MAP[country.codigoPais]} vf-flag-icon`} />
                            ) : (
                              <span className="material-symbols-outlined vf-special-icon">flag</span>
                            )}
                            <span>{country.nomePais}</span>
                          </div>
                        </td>
                        <td className="text-center">
                          {country.temEscudo ? (
                            <span className="material-symbols-outlined is-check">check_circle</span>
                          ) : (
                            <span className="material-symbols-outlined is-missing">cancel</span>
                          )}
                        </td>
                        <td className="text-center">
                          {country.temFotoEquipe ? (
                            <span className="material-symbols-outlined is-check">check_circle</span>
                          ) : (
                            <span className="material-symbols-outlined is-missing">cancel</span>
                          )}
                        </td>
                        <td className="text-center">
                          <span className="vf-players-count">{country.jogadoresPossuidos}/18</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  )
}

export default VerFigurinhas
