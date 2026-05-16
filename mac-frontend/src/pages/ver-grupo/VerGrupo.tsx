import { useState, useMemo } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useHeaderCollapse } from '../../hooks/useHeaderCollapse'
import { useUsuarioLogado } from '../../hooks/useStaticData'
import { useAmizades } from '../../hooks/useAmizades'
import {
  useGrupos,
  useConvidarParaGrupo,
  useRemoverMembro,
  useSairDoGrupo,
  useDeletarGrupo,
} from '../../hooks/useGrupos'
import './VerGrupo.css'

type ConfirmType = 'sair' | 'deletar' | 'remover'

interface ConfirmAction {
  type: ConfirmType
  username?: string
}

function VerGrupo() {
  const navigate = useNavigate()
  const { nomeGrupo } = useParams<{ nomeGrupo: string }>()
  const decodedNome = decodeURIComponent(nomeGrupo || '')
  const { isHeaderCollapsed, setIsHeaderCollapsed, isAtTop } = useHeaderCollapse()

  const { data: usuarioLogado } = useUsuarioLogado()
  const username = usuarioLogado ?? ''

  const { data: grupos, isLoading } = useGrupos()
  const { data: amigos } = useAmizades()

  // Mutations
  const convidarParaGrupo = useConvidarParaGrupo()
  const removerMembro = useRemoverMembro()
  const sairDoGrupo = useSairDoGrupo()
  const deletarGrupo = useDeletarGrupo()

  // UI state
  const [showConvidar, setShowConvidar] = useState(false)
  const [buscaConvite, setBuscaConvite] = useState('')
  const [confirmAction, setConfirmAction] = useState<ConfirmAction | null>(null)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [successMsg, setSuccessMsg] = useState<string | null>(null)

  const isMutating = convidarParaGrupo.isPending || removerMembro.isPending
    || sairDoGrupo.isPending || deletarGrupo.isPending

  // Encontrar o grupo
  const grupo = useMemo(
    () => grupos?.find(g => g.nomeGrupo === decodedNome),
    [grupos, decodedNome]
  )

  const membros = useMemo(() => grupo ? Object.entries(grupo.membros) : [], [grupo])
  const isAdmin = grupo?.membros[username] === 'CRIADOR'
  const memberCount = membros.length

  // Amigos que NÃO estão no grupo (para convite)
  const amigosForaDoGrupo = useMemo(() => {
    if (!amigos || !grupo) return []
    const membrosSet = new Set(Object.keys(grupo.membros))
    return amigos.filter(a => !membrosSet.has(a))
  }, [amigos, grupo])

  const amigosFiltrados = useMemo(() => {
    if (!buscaConvite.trim()) return amigosForaDoGrupo
    const q = buscaConvite.toLowerCase()
    return amigosForaDoGrupo.filter(a => a.toLowerCase().includes(q))
  }, [amigosForaDoGrupo, buscaConvite])

  // Handlers
  const showToast = (msg: string, type: 'success' | 'error') => {
    if (type === 'success') {
      setSuccessMsg(msg)
      setTimeout(() => setSuccessMsg(null), 3000)
    } else {
      setErrorMsg(msg)
      setTimeout(() => setErrorMsg(null), 4000)
    }
  }

  const handleConvidar = (usernameConvidado: string) => {
    convidarParaGrupo.mutate({ nomeGrupo: decodedNome, usernameConvidado }, {
      onSuccess: () => {
        showToast(`Convite enviado para ${usernameConvidado}!`, 'success')
        setShowConvidar(false)
        setBuscaConvite('')
      },
      onError: (err: any) => showToast(err?.message || 'Erro ao convidar.', 'error'),
    })
  }

  const handleConfirm = () => {
    if (!confirmAction) return

    if (confirmAction.type === 'sair') {
      sairDoGrupo.mutate(decodedNome, {
        onSuccess: () => {
          navigate('/dashboard', { replace: true })
        },
        onError: (err: any) => {
          showToast(err?.message || 'Erro ao sair do grupo.', 'error')
          setConfirmAction(null)
        },
      })
    } else if (confirmAction.type === 'deletar') {
      deletarGrupo.mutate(decodedNome, {
        onSuccess: () => {
          navigate('/dashboard', { replace: true })
        },
        onError: (err: any) => {
          showToast(err?.message || 'Erro ao excluir grupo.', 'error')
          setConfirmAction(null)
        },
      })
    } else if (confirmAction.type === 'remover' && confirmAction.username) {
      removerMembro.mutate({ nomeGrupo: decodedNome, usernameRemovido: confirmAction.username }, {
        onSuccess: () => {
          showToast(`${confirmAction.username} removido do grupo.`, 'success')
          setConfirmAction(null)
        },
        onError: (err: any) => {
          showToast(err?.message || 'Erro ao remover membro.', 'error')
          setConfirmAction(null)
        },
      })
    }
  }

  // Loading
  if (isLoading) {
    return (
      <div className="vg-container">
        <div className="vg-loading">
          <span className="material-symbols-outlined vg-loading-icon">sports_soccer</span>
          <p>Carregando grupo...</p>
        </div>
      </div>
    )
  }

  // Grupo não encontrado
  if (!grupo) {
    return (
      <div className="vg-container">
        <div className="vg-loading">
          <span className="material-symbols-outlined" style={{ fontSize: '48px', color: 'var(--text-muted)' }}>group_off</span>
          <p>Grupo não encontrado</p>
          <button className="vg-back-btn" onClick={() => navigate('/dashboard')}>
            <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>arrow_back</span>
            Voltar ao Dashboard
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="vg-container">
      {/* Toasts */}
      {successMsg && (
        <div className="vg-toast is-success">
          <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>check_circle</span>
          {successMsg}
        </div>
      )}
      {errorMsg && (
        <div className="vg-toast is-error">
          <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>error</span>
          {errorMsg}
        </div>
      )}

      {/* Header */}
      <header className={`vg-header ${isHeaderCollapsed ? 'is-collapsed' : ''}`}>
        <div className="vg-header-top">
          <button className="vg-back" onClick={() => navigate('/dashboard')}>
            <span className="material-symbols-outlined">arrow_back</span>
          </button>
          <h1 className="vg-title">{decodedNome}</h1>
          {!isAtTop && (
            <button
              className="vg-collapse-toggle"
              onClick={() => setIsHeaderCollapsed(c => !c)}
            >
              <span className="material-symbols-outlined">
                {isHeaderCollapsed ? 'expand_more' : 'expand_less'}
              </span>
            </button>
          )}
        </div>
        {!isHeaderCollapsed && (
          <div className="vg-header-info">
            <div className="vg-header-badge">
              <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>groups</span>
              {memberCount} membro{memberCount !== 1 ? 's' : ''}
            </div>
            {isAdmin && (
              <div className="vg-header-badge is-admin">
                <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>shield</span>
                Administrador
              </div>
            )}
          </div>
        )}
      </header>

      {/* Content */}
      <div className="vg-content">
        {/* Members Section */}
        <section className="vg-section">
          <div className="vg-section-header">
            <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>group</span>
            <span className="vg-section-title">Membros</span>
            <span className="vg-section-count">{memberCount}</span>
          </div>

          <div className="vg-members-list">
            {membros.map(([user, role]) => (
              <div key={user} className="vg-member-item">
                <div className="vg-member-avatar">
                  <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>person</span>
                </div>
                <div className="vg-member-info">
                  <span className="vg-member-name">
                    {user}
                    {user === username && <span className="vg-member-you">(você)</span>}
                  </span>
                  {role === 'ADMIN' && (
                    <span className="vg-member-role">
                      <span className="material-symbols-outlined" style={{ fontSize: '12px' }}>shield</span>
                      Admin
                    </span>
                  )}
                </div>
                {isAdmin && user !== username && (
                  <button
                    className="vg-member-remove"
                    onClick={() => setConfirmAction({ type: 'remover', username: user })}
                    disabled={isMutating}
                    title={`Remover ${user}`}
                  >
                    <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>person_remove</span>
                  </button>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* Admin Actions */}
        {isAdmin && (
          <section className="vg-section">
            <div className="vg-section-header">
              <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>settings</span>
              <span className="vg-section-title">Gerenciar</span>
            </div>

            <div className="vg-actions-list">
              <button
                className="vg-action-btn is-invite"
                onClick={() => setShowConvidar(true)}
                disabled={isMutating}
              >
                <span className="material-symbols-outlined">person_add</span>
                Convidar Membro
              </button>

              <button
                className="vg-action-btn is-danger"
                onClick={() => setConfirmAction({ type: 'deletar' })}
                disabled={isMutating}
              >
                <span className="material-symbols-outlined">delete</span>
                Excluir Grupo
              </button>
            </div>
          </section>
        )}

        {/* Leave */}
        <section className="vg-section">
          <button
            className="vg-action-btn is-leave"
            onClick={() => setConfirmAction({ type: 'sair' })}
            disabled={isMutating}
          >
            <span className="material-symbols-outlined">logout</span>
            Sair do Grupo
          </button>
        </section>
      </div>

      {/* Modal: Convidar */}
      {showConvidar && (
        <div className="vg-modal-overlay" onClick={() => { if (!isMutating) { setShowConvidar(false); setBuscaConvite('') } }}>
          <div className="vg-modal" onClick={e => e.stopPropagation()}>
            <div className="vg-modal-icon">
              <span className="material-symbols-outlined">person_add</span>
            </div>
            <h2 className="vg-modal-title">Convidar Membro</h2>
            <p className="vg-modal-message">Selecione um amigo para convidar ao grupo.</p>

            <div className="vg-modal-search">
              <span className="material-symbols-outlined vg-modal-search-icon">search</span>
              <input
                type="text"
                className="vg-modal-search-input"
                placeholder="Buscar amigo..."
                value={buscaConvite}
                onChange={e => setBuscaConvite(e.target.value)}
                autoFocus
              />
            </div>

            <div className="vg-invite-list">
              {amigosFiltrados.length === 0 ? (
                <div className="vg-invite-empty">
                  <span className="material-symbols-outlined" style={{ fontSize: '20px', opacity: 0.4 }}>person_off</span>
                  <span>{amigosForaDoGrupo.length === 0 ? 'Todos os amigos já estão no grupo' : 'Nenhum amigo encontrado'}</span>
                </div>
              ) : (
                amigosFiltrados.map(amigo => (
                  <button
                    key={amigo}
                    className="vg-invite-item"
                    onClick={() => handleConvidar(amigo)}
                    disabled={isMutating}
                  >
                    <div className="vg-member-avatar">
                      <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>person</span>
                    </div>
                    <span className="vg-invite-name">{amigo}</span>
                    <span className="material-symbols-outlined vg-invite-add">send</span>
                  </button>
                ))
              )}
            </div>

            <button
              className="vg-modal-close-btn"
              onClick={() => { setShowConvidar(false); setBuscaConvite('') }}
              disabled={isMutating}
            >
              Fechar
            </button>
          </div>
        </div>
      )}

      {/* Modal: Confirmação (sair / deletar / remover) */}
      {confirmAction && (
        <div className="vg-modal-overlay" onClick={() => { if (!isMutating) setConfirmAction(null) }}>
          <div className="vg-modal" onClick={e => e.stopPropagation()}>
            <div className={`vg-modal-icon ${confirmAction.type === 'deletar' ? 'is-danger' : 'is-warn'}`}>
              <span className="material-symbols-outlined">
                {confirmAction.type === 'sair' ? 'logout' : confirmAction.type === 'deletar' ? 'delete_forever' : 'person_remove'}
              </span>
            </div>
            <h2 className="vg-modal-title">
              {confirmAction.type === 'sair' && 'Sair do Grupo'}
              {confirmAction.type === 'deletar' && 'Excluir Grupo'}
              {confirmAction.type === 'remover' && 'Remover Membro'}
            </h2>
            <p className="vg-modal-message">
              {confirmAction.type === 'sair' && `Tem certeza que deseja sair de "${decodedNome}"?`}
              {confirmAction.type === 'deletar' && `Esta ação é irreversível. O grupo "${decodedNome}" será excluído permanentemente.`}
              {confirmAction.type === 'remover' && `Tem certeza que deseja remover ${confirmAction.username} do grupo?`}
            </p>

            <div className="vg-modal-actions">
              <button
                className="vg-modal-btn is-cancel"
                onClick={() => setConfirmAction(null)}
                disabled={isMutating}
              >
                Cancelar
              </button>
              <button
                className={`vg-modal-btn ${confirmAction.type === 'deletar' ? 'is-danger' : 'is-confirm'}`}
                onClick={handleConfirm}
                disabled={isMutating}
              >
                {isMutating ? (
                  <>
                    <span className="material-symbols-outlined vg-spin" style={{ fontSize: '18px' }}>sports_soccer</span>
                    Aguarde...
                  </>
                ) : (
                  <>
                    <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>
                      {confirmAction.type === 'sair' ? 'logout' : confirmAction.type === 'deletar' ? 'delete' : 'check'}
                    </span>
                    {confirmAction.type === 'sair' && 'Sair'}
                    {confirmAction.type === 'deletar' && 'Excluir'}
                    {confirmAction.type === 'remover' && 'Remover'}
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default VerGrupo
