import { useState, useMemo, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useHeaderCollapse } from '../../hooks/useHeaderCollapse'
import { useQueryClient } from '@tanstack/react-query'
import { useAllFigurinhas } from '../../hooks/useStaticData'
import {
  usePropostasRecebidas,
  usePropostasEnviadas,
  useAceitarProposta,
  useRecusarProposta,
  useCancelarProposta,
} from '../../hooks/usePropostaTroca'
import type { Figurinha, PropostaTrocaRecebidaDTO } from '../../types'
import './VerPropostas.css'

type Tab = 'recebidas' | 'enviadas'

interface ConfirmAction {
  type: 'aceitar' | 'recusar' | 'cancelar'
  proposta: PropostaTrocaRecebidaDTO
}

function VerPropostas() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { isHeaderCollapsed, setIsHeaderCollapsed, isAtTop } = useHeaderCollapse()

  const [tab, setTab] = useState<Tab>('recebidas')
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [confirmAction, setConfirmAction] = useState<ConfirmAction | null>(null)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [successMsg, setSuccessMsg] = useState<string | null>(null)

  // Invalidate on mount to get fresh data
  useEffect(() => {
    queryClient.invalidateQueries({ queryKey: ['propostas-troca'] })
  }, [queryClient])

  const { data: figurinhas } = useAllFigurinhas()
  const { data: recebidas, isLoading: loadingRecebidas } = usePropostasRecebidas()
  const { data: enviadas, isLoading: loadingEnviadas } = usePropostasEnviadas()

  const aceitarProposta = useAceitarProposta()
  const recusarProposta = useRecusarProposta()
  const cancelarProposta = useCancelarProposta()

  const isLoading = tab === 'recebidas' ? loadingRecebidas : loadingEnviadas
  const propostas = tab === 'recebidas' ? recebidas : enviadas
  const isMutating = aceitarProposta.isPending || recusarProposta.isPending || cancelarProposta.isPending

  // Figurinha lookup
  const figurinhaMap = useMemo(() => {
    if (!figurinhas) return new Map<number, Figurinha>()
    return new Map(figurinhas.map(f => [f.id, f]))
  }, [figurinhas])

  const codigoPorId = (id: number) => figurinhaMap.get(id)?.codigoFigurinha ?? `#${id}`

  const toggleExpand = (id: string) => {
    setExpandedId(prev => prev === id ? null : id)
  }

  // Confirmation handlers
  const handleConfirm = () => {
    if (!confirmAction) return

    const { type, proposta } = confirmAction
    const onSuccess = (msg: string) => {
      setSuccessMsg(msg)
      setConfirmAction(null)
      setExpandedId(null)
      queryClient.refetchQueries({ queryKey: ['propostas-troca'] })
      setTimeout(() => setSuccessMsg(null), 5000)
    }

    const onError = (error: any) => {
      setErrorMsg(error?.message || 'Ocorreu um erro ao processar a proposta.')
      setConfirmAction(null)
      setTimeout(() => setErrorMsg(null), 5000)
    }

    switch (type) {
      case 'aceitar':
        aceitarProposta.mutate(proposta.idProposta, { 
          onSuccess: () => onSuccess('Troca aceita com sucesso!'), 
          onError 
        })
        break
      case 'recusar':
        recusarProposta.mutate(proposta.idProposta, { 
          onSuccess: () => onSuccess('Proposta recusada.'), 
          onError 
        })
        break
      case 'cancelar':
        cancelarProposta.mutate(proposta.idProposta, { 
          onSuccess: () => onSuccess('Proposta cancelada.'), 
          onError 
        })
        break
    }
  }

  const confirmLabels: Record<ConfirmAction['type'], { title: string; message: string; btn: string; variant: string }> = {
    aceitar: {
      title: 'Aceitar proposta?',
      message: 'As figurinhas serão trocadas automaticamente. Esta ação não pode ser desfeita.',
      btn: 'Aceitar',
      variant: 'is-accept',
    },
    recusar: {
      title: 'Recusar proposta?',
      message: 'A proposta será recusada e removida. Esta ação não pode ser desfeita.',
      btn: 'Recusar',
      variant: 'is-reject',
    },
    cancelar: {
      title: 'Cancelar proposta?',
      message: 'A proposta enviada será cancelada e removida. Esta ação não pode ser desfeita.',
      btn: 'Cancelar proposta',
      variant: 'is-reject',
    },
  }

  return (
    <div className="vp-container soccer-pattern">
      {/* Header */}
      <header className={`vp-header ${isHeaderCollapsed ? 'is-collapsed' : ''}`}>
        <button className="vp-back" onClick={() => navigate('/dashboard')} aria-label="Voltar">
          <span className="material-symbols-outlined">arrow_back</span>
        </button>
        <div className="vp-header-info" style={{ flex: 1 }}>
          <div className="vp-header-icon">
            <span className="material-symbols-outlined">handshake</span>
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <h1 className="vp-title">Propostas de Troca</h1>
              {!isAtTop && (
                <button 
                  className="vp-header-toggle" 
                  onClick={() => setIsHeaderCollapsed(!isHeaderCollapsed)}
                  aria-label={isHeaderCollapsed ? 'Expandir cabeçalho' : 'Reduzir cabeçalho'}
                >
                  <span className="material-symbols-outlined">
                    {isHeaderCollapsed ? 'expand_more' : 'expand_less'}
                  </span>
                </button>
              )}
            </div>
            <p className="vp-subtitle">
              {isLoading ? 'Carregando...' : `${propostas?.length ?? 0} proposta${(propostas?.length ?? 0) !== 1 ? 's' : ''}`}
            </p>
          </div>
        </div>
      </header>

      {/* Toasts */}
      {errorMsg && (
        <div className="vp-toast vp-toast-error">
          <span className="material-symbols-outlined">error</span>
          <span>{errorMsg}</span>
        </div>
      )}
      {successMsg && (
        <div className="vp-toast vp-toast-success">
          <span className="material-symbols-outlined">check_circle</span>
          <span>{successMsg}</span>
        </div>
      )}

      <main className="vp-content">
        {/* Tab toggle */}
        <div className="vp-tabs">
          <button
            className={`vp-tab ${tab === 'recebidas' ? 'is-active' : ''}`}
            onClick={() => { setTab('recebidas'); setExpandedId(null) }}
          >
            <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>inbox</span>
            Recebidas
            {recebidas && recebidas.length > 0 && (
              <span className="vp-tab-badge">{recebidas.length}</span>
            )}
          </button>
          <button
            className={`vp-tab ${tab === 'enviadas' ? 'is-active' : ''}`}
            onClick={() => { setTab('enviadas'); setExpandedId(null) }}
          >
            <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>send</span>
            Enviadas
            {enviadas && enviadas.length > 0 && (
              <span className="vp-tab-badge">{enviadas.length}</span>
            )}
          </button>
        </div>

        {/* List */}
        {isLoading ? (
          <div className="vp-loading">
            <span className="material-symbols-outlined vp-loading-icon">sports_soccer</span>
            <p>Carregando propostas...</p>
          </div>
        ) : !propostas || propostas.length === 0 ? (
          <div className="vp-empty">
            <span className="material-symbols-outlined vp-empty-icon">
              {tab === 'recebidas' ? 'inbox' : 'send'}
            </span>
            <p>Nenhuma proposta {tab === 'recebidas' ? 'recebida' : 'enviada'}</p>
            <span className="vp-empty-hint">
              {tab === 'recebidas'
                ? 'Quando alguém te enviar uma proposta, ela aparecerá aqui'
                : 'Suas propostas enviadas aparecerão aqui'}
            </span>
          </div>
        ) : (
          <div className="vp-list">
            {propostas.map(proposta => {
              const isExpanded = expandedId === proposta.idProposta

              // For recebidas: oferecidas = what sender gives you, desejadas = what sender wants from you
              // For enviadas: oferecidas = what you offered, desejadas = what you wanted
              const recebeLabel = tab === 'recebidas' ? 'Você recebe' : 'Você pediu'
              const daLabel = tab === 'recebidas' ? 'Você dá' : 'Você ofereceu'
              const recebeIds = proposta.figurinhasOferecidas
              const daIds = proposta.figurinhasDesejadas

              return (
                <div
                  key={proposta.idProposta}
                  className={`vp-card ${isExpanded ? 'is-expanded' : ''}`}
                >
                  {/* Card header */}
                  <button
                    className="vp-card-header"
                    onClick={() => toggleExpand(proposta.idProposta)}
                  >
                    <div className="vp-card-avatar">
                      <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>person</span>
                    </div>
                    <div className="vp-card-info">
                      <span className="vp-card-name">{proposta.usernameEnviou}</span>
                      <span className="vp-card-summary">
                        {recebeIds.length} para receber · {daIds.length} para dar
                      </span>
                    </div>
                    <span className={`material-symbols-outlined vp-card-chevron ${isExpanded ? 'is-open' : ''}`}>
                      expand_more
                    </span>
                  </button>

                  {/* Card details */}
                  {isExpanded && (
                    <div className="vp-card-details">
                      {/* Stickers you receive */}
                      <div className="vp-section">
                        <div className="vp-section-header">
                          <span className="material-symbols-outlined vp-section-icon is-receive">arrow_downward</span>
                          <span className="vp-section-title">{recebeLabel}</span>
                          <span className="vp-section-count">{recebeIds.length}</span>
                        </div>
                        <div className="vp-chips">
                          {recebeIds.map(id => (
                            <span key={id} className="vp-chip is-receive">{codigoPorId(id)}</span>
                          ))}
                        </div>
                      </div>

                      {/* Stickers you give */}
                      <div className="vp-section">
                        <div className="vp-section-header">
                          <span className="material-symbols-outlined vp-section-icon is-give">arrow_upward</span>
                          <span className="vp-section-title">{daLabel}</span>
                          <span className="vp-section-count">{daIds.length}</span>
                        </div>
                        <div className="vp-chips">
                          {daIds.map(id => (
                            <span key={id} className="vp-chip is-give">{codigoPorId(id)}</span>
                          ))}
                        </div>
                      </div>

                      {/* Action buttons */}
                      <div className="vp-actions">
                        {tab === 'recebidas' ? (
                          <>
                            <button
                              className="vp-action-btn is-accept"
                              onClick={() => setConfirmAction({ type: 'aceitar', proposta })}
                              disabled={isMutating}
                            >
                              <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>check_circle</span>
                              Aceitar
                            </button>
                            <button
                              className="vp-action-btn is-reject"
                              onClick={() => setConfirmAction({ type: 'recusar', proposta })}
                              disabled={isMutating}
                            >
                              <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>cancel</span>
                              Recusar
                            </button>
                          </>
                        ) : (
                          <button
                            className="vp-action-btn is-reject is-full"
                            onClick={() => setConfirmAction({ type: 'cancelar', proposta })}
                            disabled={isMutating}
                          >
                            <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>delete</span>
                            Cancelar Proposta
                          </button>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </main>

      {/* Confirmation Modal */}
      {confirmAction && (
        <div className="vp-modal-overlay" onClick={() => !isMutating && setConfirmAction(null)}>
          <div className="vp-modal" onClick={e => e.stopPropagation()}>
            <div className="vp-modal-icon">
              <span className="material-symbols-outlined">
                {confirmAction.type === 'aceitar' ? 'handshake' : 'warning'}
              </span>
            </div>
            <h2 className="vp-modal-title">{confirmLabels[confirmAction.type].title}</h2>
            <p className="vp-modal-message">{confirmLabels[confirmAction.type].message}</p>

            <div className="vp-modal-details">
              <span className="vp-modal-user">
                <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>person</span>
                {confirmAction.proposta.usernameEnviou}
              </span>
              <span className="vp-modal-counts">
                <span className="vp-modal-count is-receive">
                  <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>arrow_downward</span>
                  {confirmAction.proposta.figurinhasOferecidas.length}
                </span>
                <span className="material-symbols-outlined" style={{ fontSize: '16px', color: 'var(--text-muted)' }}>swap_horiz</span>
                <span className="vp-modal-count is-give">
                  <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>arrow_upward</span>
                  {confirmAction.proposta.figurinhasDesejadas.length}
                </span>
              </span>
            </div>

            <div className="vp-modal-actions">
              <button
                className="vp-modal-btn is-cancel"
                onClick={() => setConfirmAction(null)}
                disabled={isMutating}
              >
                Voltar
              </button>
              <button
                className={`vp-modal-btn ${confirmLabels[confirmAction.type].variant}`}
                onClick={handleConfirm}
                disabled={isMutating}
              >
                {isMutating ? (
                  <>
                    <span className="material-symbols-outlined vp-spin" style={{ fontSize: '18px' }}>sports_soccer</span>
                    Processando...
                  </>
                ) : (
                  confirmLabels[confirmAction.type].btn
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default VerPropostas
