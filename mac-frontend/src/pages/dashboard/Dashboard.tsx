import { useNavigate } from 'react-router-dom'
import { useAllFigurinhas } from '../../hooks/useStaticData'
import { useFigurinhasUsuario } from '../../hooks/useFigurinhasUsuario'
import './Dashboard.css'

function Dashboard() {
  const navigate = useNavigate()

  // Dados estáticos (catálogo) — cache infinito
  const { data: figurinhas, isLoading: loadingFigurinhas } = useAllFigurinhas()

  // Dados do usuário — mapa { idFigurinha: quantidade }
  const { data: figurinhasUsuario, isLoading: loadingUsuario } = useFigurinhasUsuario()

  const isLoading = loadingFigurinhas || loadingUsuario

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
      {/* Desktop: Sidebar */}
      <aside className="dash-sidebar">
        <div className="dash-sidebar-brand">
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
        </nav>

        <div className="dash-sidebar-footer">
          <button className="dash-sidebar-user">
            <div className="dash-sidebar-avatar">
              <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>person</span>
            </div>
            <div className="dash-sidebar-user-info">

            </div>
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
            <button className="dash-header-user" aria-label="Perfil">
              <span className="material-symbols-outlined" style={{ fontSize: '22px' }}>person</span>
            </button>
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
                <div className="dash-stat-card">
                  <div className="dash-stat-icon is-collected">
                    <span className="material-symbols-outlined">check_circle</span>
                  </div>
                  <div className="dash-stat-value">{colecionadas}</div>
                  <div className="dash-stat-label">Colecionadas</div>
                </div>

                {/* Faltando */}
                <div className="dash-stat-card">
                  <div className="dash-stat-icon is-missing">
                    <span className="material-symbols-outlined">search</span>
                  </div>
                  <div className="dash-stat-value">{faltando}</div>
                  <div className="dash-stat-label">Faltando</div>
                </div>

                {/* Repetidas */}
                <div className="dash-stat-card">
                  <div className="dash-stat-icon is-repeated">
                    <span className="material-symbols-outlined">content_copy</span>
                  </div>
                  <div className="dash-stat-value">{repetidas}</div>
                  <div className="dash-stat-label">Repetidas</div>
                </div>
              </section>

              {/* Quick Actions */}
              <section className="dash-actions" id="dash-actions">
                <button
                  className="dash-action-card is-primary"
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
