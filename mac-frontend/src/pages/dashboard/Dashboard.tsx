import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAllFigurinhas } from '../../hooks/useStaticData'
import { useUsuarioLogado } from '../../hooks/useStaticData'
import { useFigurinhasUsuario } from '../../hooks/useFigurinhasUsuario'
import { useAmizades } from '../../hooks/useAmizades'
import { useBuscarUsuarios } from '../../hooks/useBuscarUsuarios'
import { useDebounce } from '../../hooks/useDebounce'
import {
  useSolicitacoesRecebidas,
  useEnviarSolicitacao,
  useAceitarSolicitacao,
  useRecusarSolicitacao,
} from '../../hooks/useSolicitacaoAmizade'
import './Dashboard.css'
import { useAuth } from '../../context/AuthContext'

function Dashboard() {
  const navigate = useNavigate()

  const { logout } = useAuth()

  // Dados estáticos (catálogo) — cache infinito
  const { data: figurinhas, isLoading: loadingFigurinhas } = useAllFigurinhas()

  // Dados do usuário — mapa { idFigurinha: quantidade }
  const { data: figurinhasUsuario, isLoading: loadingUsuario } = useFigurinhasUsuario()

  const { data: usuarioLogado, isLoading: loadingUsuarioLogado } = useUsuarioLogado()
  const username = usuarioLogado ?? ''

  // Lista de amigos
  const { data: amigos, isLoading: loadingAmigos } = useAmizades()

  // Solicitações de amizade recebidas
  const { data: solicitacoes, isLoading: loadingSolicitacoes } = useSolicitacoesRecebidas()
  const enviarSolicitacao = useEnviarSolicitacao()
  const aceitarSolicitacao = useAceitarSolicitacao()
  const recusarSolicitacao = useRecusarSolicitacao()

  // Busca de usuários
  const [termoBusca, setTermoBusca] = useState('')
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const termoDebouncado = useDebounce(termoBusca, 300)
  const { data: resultadosBusca, isLoading: loadingBusca } = useBuscarUsuarios(termoDebouncado)
  const mostrarResultados = termoDebouncado.length >= 2
  const amigosSet = new Set(amigos ?? [])
  const resultadosFiltrados = resultadosBusca?.filter(u => !amigosSet.has(u))

  // Track usernames we've already sent requests to (this session)
  const [enviadas, setEnviadas] = useState<Set<string>>(new Set())

  const handleEnviarSolicitacao = (usernameDestino: string) => {
    enviarSolicitacao.mutate(usernameDestino, {
      onSuccess: () => {
        setEnviadas(prev => new Set(prev).add(usernameDestino))
      },
    })
  }

  const handleLogout = async () => {
    try {
      await logout()
    } catch (err) {
      console.error('Erro ao fazer logout', err)
    }
  }

  const isLoading = loadingFigurinhas || loadingUsuario || loadingUsuarioLogado

  // Calcula stats a partir dos dados reais
  const totalFigurinhas = figurinhas?.length ?? 0

  // Figurinhas que o usuário possui (ao menos 1 unidade)
  const colecionadas = figurinhasUsuario
    ? Object.keys(figurinhasUsuario).length
    : 0

  const faltando = totalFigurinhas - colecionadas

  // Repetidas = soma de (quantidade - 1) para cada figurinha com quantidade > 1
  const repetidas = figurinhasUsuario
    ? Object.values(figurinhasUsuario).reduce(
      (acc, qty) => acc + Math.max(0, qty - 1),
      0
    )
    : 0

  const progresso = totalFigurinhas > 0
    ? Math.round((colecionadas / totalFigurinhas) * 100)
    : 0

  return (
    <div className="dash-container soccer-pattern">
      {/* Mobile Backdrop */}
      <div
        className={`dash-sidebar-backdrop ${isSidebarOpen ? 'is-open' : ''}`}
        onClick={() => setIsSidebarOpen(false)}
      />

      {/* Sidebar */}
      <aside className={`dash-sidebar ${isSidebarOpen ? 'is-open' : ''}`}>
        <div className="dash-sidebar-brand">
          <button
            className="dash-sidebar-close-mobile"
            onClick={() => setIsSidebarOpen(false)}
            aria-label="Voltar"
          >
            <span className="material-symbols-outlined">arrow_back</span>
          </button>
          <div className="dash-sidebar-logo">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20" />
              <path d="M2 12h20" />
            </svg>
          </div>
          <span className="dash-sidebar-title">Meu Álbum da Copa</span>
        </div>

        <nav className="dash-sidebar-nav">
          {/* Buscar usuários */}
          <div className="dash-search-section">
            <div className="dash-search-wrapper">
              <span className="material-symbols-outlined dash-search-icon">search</span>
              <input
                type="text"
                className="dash-search-input"
                placeholder="Buscar usuário..."
                value={termoBusca}
                onChange={e => setTermoBusca(e.target.value.toLowerCase())}
              />
              {termoBusca && (
                <button
                  className="dash-search-clear"
                  onClick={() => setTermoBusca('')}
                  aria-label="Limpar busca"
                >
                  <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>close</span>
                </button>
              )}
            </div>

            {mostrarResultados && (
              <div className="dash-search-results">
                {loadingBusca ? (
                  <div className="dash-search-status">
                    <span className="material-symbols-outlined dash-friends-spin" style={{ fontSize: '16px' }}>sports_soccer</span>
                    <span>Buscando...</span>
                  </div>
                ) : !resultadosFiltrados || resultadosFiltrados.length === 0 ? (
                  <div className="dash-search-status">
                    <span className="material-symbols-outlined" style={{ fontSize: '16px', opacity: 0.4 }}>person_off</span>
                    <span>Nenhum usuário encontrado</span>
                  </div>
                ) : (
                  resultadosFiltrados.map(user => {
                    const jaEnviou = enviadas.has(user)
                    return (
                      <div key={user} className="dash-search-result-item">
                        <div className="dash-friend-avatar">
                          <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>person</span>
                        </div>
                        <span className="dash-friend-name">{user}</span>
                        {jaEnviou ? (
                          <span className="dash-search-sent">
                            <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>check</span>
                            Enviada
                          </span>
                        ) : (
                          <button
                            className="dash-search-add-btn"
                            title={`Adicionar ${user}`}
                            onClick={() => handleEnviarSolicitacao(user)}
                            disabled={enviarSolicitacao.isPending}
                          >
                            <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>person_add</span>
                          </button>
                        )}
                      </div>
                    )
                  })
                )}
              </div>
            )}
          </div>

          {/* Separador */}
          <div className="dash-sidebar-divider" />

          {/* Solicitações de amizade recebidas */}
          {!loadingSolicitacoes && solicitacoes && solicitacoes.length > 0 && (
            <>
              <div className="dash-sidebar-section-header">
                <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>mail</span>
                <span className="dash-sidebar-section-title">Solicitações</span>
                <span className="dash-sidebar-section-count is-pending">{solicitacoes.length}</span>
              </div>

              <div className="dash-requests-list">
                {solicitacoes.map(sol => (
                  <div key={sol.idSolicitacao} className="dash-request-item">
                    <div className="dash-friend-avatar">
                      <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>person</span>
                    </div>
                    <span className="dash-friend-name">{sol.usernameEnviou}</span>
                    <div className="dash-request-actions">
                      <button
                        className="dash-request-btn is-accept"
                        onClick={() => aceitarSolicitacao.mutate(sol.idSolicitacao)}
                        disabled={aceitarSolicitacao.isPending || recusarSolicitacao.isPending}
                        title="Aceitar"
                      >
                        <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>check</span>
                      </button>
                      <button
                        className="dash-request-btn is-reject"
                        onClick={() => recusarSolicitacao.mutate(sol.idSolicitacao)}
                        disabled={aceitarSolicitacao.isPending || recusarSolicitacao.isPending}
                        title="Recusar"
                      >
                        <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>close</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              <div className="dash-sidebar-divider" />
            </>
          )}

          {/* Lista de amigos */}
          <div className="dash-sidebar-section-header">
            <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>group</span>
            <span className="dash-sidebar-section-title">Amigos</span>
            {amigos && <span className="dash-sidebar-section-count">{amigos.length}</span>}
          </div>

          {loadingAmigos ? (
            <div className="dash-friends-loading">
              <span className="material-symbols-outlined dash-friends-spin">sports_soccer</span>
            </div>
          ) : !amigos || amigos.length === 0 ? (
            <div className="dash-friends-empty">
              <span className="material-symbols-outlined" style={{ fontSize: '20px', opacity: 0.4 }}>person_off</span>
              <span>Nenhum amigo ainda</span>
            </div>
          ) : (
            <div className="dash-friends-list">
              {amigos.map(amigo => (
                <div key={amigo} className="dash-friend-item">
                  <div className="dash-friend-avatar">
                    <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>person</span>
                  </div>
                  <span className="dash-friend-name">{amigo}</span>
                  <div className="dash-friend-status" />
                </div>
              ))}
            </div>
          )}
        </nav>

        <div className="dash-sidebar-footer">
          <button className="dash-sidebar-user">
            <div className="dash-sidebar-avatar">
              <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>person</span>
            </div>
            <div className="dash-sidebar-user-info">
              <div className="dash-sidebar-user-name">
                {username}
              </div>
            </div>
          </button>
          <button className="dash-sidebar-logout" aria-label="Sair" onClick={handleLogout} title="Sair">
            <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>logout</span>
          </button>
        </div>
      </aside>

      {/* Main content area */}
      <div className="dash-main">
        {/* Header */}
        <header className="dash-header">
          {/* Mobile: top bar */}
          <div className="dash-header-top">
            <div className="dash-header-brand">
              <div className="dash-header-logo">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10" />
                  <path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20" />
                  <path d="M2 12h20" />
                </svg>
              </div>
              <span className="dash-header-title">Meu Álbum da Copa</span>
            </div>
            <div className="dash-header-actions">
              <button
                className="dash-header-user"
                aria-label="Perfil"
                onClick={() => setIsSidebarOpen(true)}
              >
                <div className="dash-header-user-avatar">
                  <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>person</span>
                </div>
                <div className="dash-header-user-info">
                  <span className="dash-header-user-name">{username}</span>
                </div>
              </button>
              <button className="dash-header-logout" aria-label="Sair" onClick={handleLogout} title="Sair">
                <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>logout</span>
              </button>
            </div>
          </div>

          {/* Greeting */}
          <div className="dash-greeting">
            <h1>Progresso do Álbum</h1>
          </div>
        </header>

        <main className="dash-content">
          {isLoading ? (
            <div className="dash-loading">
              <span className="material-symbols-outlined dash-loading-icon">sports_soccer</span>
              <p>Carregando dados...</p>
            </div>
          ) : (
            <>
              {/* Progress Card */}
              <section className="dash-progress" id="dash-progress">
                <div className="dash-progress-header">
                  <span className="dash-progress-label">Progresso do Álbum</span>
                </div>

                <div className="dash-progress-main">
                  <div className="dash-progress-percent">
                    {progresso}<span>%</span>
                  </div>
                  <div className="dash-progress-count">
                    <strong>{colecionadas}</strong> / {totalFigurinhas} figurinhas
                  </div>
                </div>

                <div className="dash-progress-bar">
                  <div
                    className="dash-progress-fill"
                    style={{ width: `${progresso}%` }}
                  />
                </div>
              </section>

              {/* Stats Row */}
              <section className="dash-stats" id="dash-stats">
                {/* Colecionadas */}
                <button className="dash-stat-card" onClick={() => navigate('/ver-figurinhas/colecionadas')}>
                  <div className="dash-stat-icon is-collected">
                    <span className="material-symbols-outlined">check_circle</span>
                  </div>
                  <div className="dash-stat-value">{colecionadas}</div>
                  <div className="dash-stat-label">Colecionadas</div>
                </button>

                {/* Faltando */}
                <button className="dash-stat-card" onClick={() => navigate('/ver-figurinhas/faltando')}>
                  <div className="dash-stat-icon is-missing">
                    <span className="material-symbols-outlined">search</span>
                  </div>
                  <div className="dash-stat-value">{faltando}</div>
                  <div className="dash-stat-label">Faltando</div>
                </button>

                {/* Repetidas */}
                <button className="dash-stat-card" onClick={() => navigate('/ver-figurinhas/repetidas')}>
                  <div className="dash-stat-icon is-repeated">
                    <span className="material-symbols-outlined">content_copy</span>
                  </div>
                  <div className="dash-stat-value">{repetidas}</div>
                  <div className="dash-stat-label">Repetidas</div>
                </button>
              </section>

              {/* Quick Actions */}
              <section className="dash-actions" id="dash-actions">
                <button
                  className="dash-action-card is-primary is-full"
                  onClick={() => navigate('/adicionar-figurinha')}
                >
                  <div className="dash-action-icon">
                    <span className="material-symbols-outlined" style={{ fontSize: '28px' }}>add_photo_alternate</span>
                  </div>
                  <div>
                    <div className="dash-action-label">Adicionar Figurinha</div>
                    <div className="dash-action-hint">Registre novas figurinhas</div>
                  </div>
                </button>

                <button
                  className="dash-action-card is-danger"
                  onClick={() => navigate('/remover-figurinha')}
                >
                  <div className="dash-action-icon">
                    <span className="material-symbols-outlined" style={{ fontSize: '28px' }}>delete</span>
                  </div>
                  <div>
                    <div className="dash-action-label">Remover Figurinha</div>
                    <div className="dash-action-hint">Corrija seu álbum</div>
                  </div>
                </button>

                <button
                  className="dash-action-card is-secondary"
                  onClick={() => navigate('/trocas')}
                >
                  <div className="dash-action-icon">
                    <span className="material-symbols-outlined" style={{ fontSize: '28px' }}>swap_horiz</span>
                  </div>
                  <div>
                    <div className="dash-action-label">Ver Trocas</div>
                    <div className="dash-action-hint">Gerencie suas trocas</div>
                  </div>
                </button>
              </section>
            </>
          )}
        </main>
      </div>
    </div>
  )
}

export default Dashboard