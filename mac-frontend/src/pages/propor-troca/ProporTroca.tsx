import { useState, useMemo } from 'react'
import { useNavigate, useLocation, useParams } from 'react-router-dom'
import { useAllFigurinhas } from '../../hooks/useStaticData'
import { apiPost } from '../../lib/api'
import type { Figurinha, TrocasDTO, PropostaTrocaEnviadaDTO } from '../../types'
import './ProporTroca.css'

function ProporTroca() {
  const navigate = useNavigate()
  const { username } = useParams<{ username: string }>()
  const location = useLocation()

  // Trade data passed via router state
  const troca = (location.state as { troca?: TrocasDTO })?.troca

  const { data: figurinhas } = useAllFigurinhas()

  // Selected sticker IDs
  const [oferecidas, setOferecidas] = useState<Set<number>>(new Set())
  const [desejadas, setDesejadas] = useState<Set<number>>(new Set())

  // Submit state
  const [submitting, setSubmitting] = useState(false)
  const [sucesso, setSucesso] = useState(false)
  const [erro, setErro] = useState('')
  const [showConfirm, setShowConfirm] = useState(false)

  // Figurinha lookup map
  const figurinhaMap = useMemo(() => {
    if (!figurinhas) return new Map<number, Figurinha>()
    return new Map(figurinhas.map(f => [f.id, f]))
  }, [figurinhas])

  const codigoPorId = (id: number) => figurinhaMap.get(id)?.codigoFigurinha ?? `#${id}`
  const nomePorId = (id: number) => figurinhaMap.get(id)?.nome ?? null

  // Toggle selection
  const toggleOferecida = (id: number) => {
    setOferecidas(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const toggleDesejada = (id: number) => {
    setDesejadas(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  // Select/deselect all
  const selecionarTodasOferecidas = () => {
    if (!troca) return
    if (oferecidas.size === troca.euOfereço.length) {
      setOferecidas(new Set())
    } else {
      setOferecidas(new Set(troca.euOfereço))
    }
  }

  const selecionarTodasDesejadas = () => {
    if (!troca) return
    if (desejadas.size === troca.amigoOferece.length) {
      setDesejadas(new Set())
    } else {
      setDesejadas(new Set(troca.amigoOferece))
    }
  }

  // Counts
  const totalOferecidas = oferecidas.size
  const totalDesejadas = desejadas.size
  const isUnbalanced = totalOferecidas !== totalDesejadas && totalOferecidas > 0 && totalDesejadas > 0
  const canSubmit = totalOferecidas > 0 && totalDesejadas > 0

  // Submit
  const handleSubmit = async () => {
    if (!canSubmit || !username) return

    setSubmitting(true)
    setErro('')
    setSucesso(false)

    const payload: PropostaTrocaEnviadaDTO = {
      usernameDestino: username,
      figurinhasOferecidas: Array.from(oferecidas),
      figurinhasDesejadas: Array.from(desejadas),
    }

    try {
      await apiPost('/proposta-troca/enviar', payload)
      setShowConfirm(false)
      setSucesso(true)
      setTimeout(() => {
        navigate('/trocas')
      }, 1500)
    } catch {
      setShowConfirm(false)
      setErro('Erro ao enviar proposta. Tente novamente.')
    } finally {
      setSubmitting(false)
    }
  }

  // Guard: no trade data
  if (!troca || !username) {
    return (
      <div className="pt-container soccer-pattern">
        <header className="pt-header">
          <button className="pt-back" onClick={() => navigate('/trocas')} aria-label="Voltar">
            <span className="material-symbols-outlined">arrow_back</span>
          </button>
          <div className="pt-header-info">
            <div className="pt-header-icon">
              <span className="material-symbols-outlined">handshake</span>
            </div>
            <div>
              <h1 className="pt-title">Propor Troca</h1>
              <p className="pt-subtitle">Dados indisponíveis</p>
            </div>
          </div>
        </header>
        <main className="pt-content">
          <div className="pt-empty">
            <span className="material-symbols-outlined pt-empty-icon">error_outline</span>
            <p>Dados da troca não encontrados.</p>
            <button className="pt-back-link" onClick={() => navigate('/trocas')}>
              Voltar para Trocas
            </button>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="pt-container soccer-pattern">
      {/* Header */}
      <header className="pt-header">
        <button className="pt-back" onClick={() => navigate('/trocas')} aria-label="Voltar">
          <span className="material-symbols-outlined">arrow_back</span>
        </button>
        <div className="pt-header-info">
          <div className="pt-header-icon">
            <span className="material-symbols-outlined">handshake</span>
          </div>
          <div>
            <h1 className="pt-title">Propor Troca</h1>
            <p className="pt-subtitle">com {username}</p>
          </div>
        </div>
      </header>

      {/* Feedback messages */}
      {sucesso && (
        <div className="pt-toast pt-toast-success">
          <span className="material-symbols-outlined">check_circle</span>
          Proposta enviada com sucesso!
        </div>
      )}
      {erro && (
        <div className="pt-toast pt-toast-error">
          <span className="material-symbols-outlined">error</span>
          {erro}
        </div>
      )}

      <main className="pt-content">
        {/* Imbalance Warning */}
        {isUnbalanced && (
          <div className="pt-warning">
            <span className="material-symbols-outlined pt-warning-icon">warning</span>
            <div className="pt-warning-text">
              <strong>Troca não equivalente</strong>
              <span>
                Você está oferecendo {totalOferecidas} figurinha{totalOferecidas !== 1 ? 's' : ''} e
                pedindo {totalDesejadas}. {totalOferecidas > totalDesejadas ? 'Você está dando mais do que recebendo.' : 'Você está pedindo mais do que oferecendo.'}
              </span>
            </div>
          </div>
        )}

        {/* Two sections side by side on tablet+ */}
        <div className="pt-sections">
          {/* Section: Figurinhas que eu ofereço */}
          <section className="pt-section">
            <div className="pt-section-header">
              <div className="pt-section-title-row">
                <span className="material-symbols-outlined pt-section-icon is-give">arrow_upward</span>
                <span className="pt-section-title">Você oferece</span>
                <span className="pt-section-count">{totalOferecidas}/{troca.euOfereço.length}</span>
              </div>
              <button
                className="pt-select-all"
                onClick={selecionarTodasOferecidas}
              >
                {oferecidas.size === troca.euOfereço.length ? 'Limpar' : 'Todas'}
              </button>
            </div>

            <div className="pt-sticker-grid">
              {troca.euOfereço.map(id => {
                const isSelected = oferecidas.has(id)
                const nome = nomePorId(id)
                return (
                  <button
                    key={id}
                    className={`pt-sticker-card is-give ${isSelected ? 'is-selected' : ''}`}
                    onClick={() => toggleOferecida(id)}
                  >
                    <span className="pt-sticker-code">{codigoPorId(id)}</span>
                    {nome && <span className="pt-sticker-name">{nome}</span>}
                    <div className={`pt-sticker-check ${isSelected ? 'is-checked' : ''}`}>
                      <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>
                        {isSelected ? 'check' : 'add'}
                      </span>
                    </div>
                  </button>
                )
              })}
            </div>
          </section>

          {/* Section: Figurinhas que eu desejo */}
          <section className="pt-section">
            <div className="pt-section-header">
              <div className="pt-section-title-row">
                <span className="material-symbols-outlined pt-section-icon is-receive">arrow_downward</span>
                <span className="pt-section-title">Você recebe</span>
                <span className="pt-section-count">{totalDesejadas}/{troca.amigoOferece.length}</span>
              </div>
              <button
                className="pt-select-all"
                onClick={selecionarTodasDesejadas}
              >
                {desejadas.size === troca.amigoOferece.length ? 'Limpar' : 'Todas'}
              </button>
            </div>

            <div className="pt-sticker-grid">
              {troca.amigoOferece.map(id => {
                const isSelected = desejadas.has(id)
                const nome = nomePorId(id)
                return (
                  <button
                    key={id}
                    className={`pt-sticker-card is-receive ${isSelected ? 'is-selected' : ''}`}
                    onClick={() => toggleDesejada(id)}
                  >
                    <span className="pt-sticker-code">{codigoPorId(id)}</span>
                    {nome && <span className="pt-sticker-name">{nome}</span>}
                    <div className={`pt-sticker-check ${isSelected ? 'is-checked' : ''}`}>
                      <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>
                        {isSelected ? 'check' : 'add'}
                      </span>
                    </div>
                  </button>
                )
              })}
            </div>
          </section>
        </div>
      </main>

      {/* Fixed bottom submit bar */}
      {canSubmit && (
        <div className="pt-bottom-bar">
          <div className="pt-bottom-summary">
            <span className="pt-bottom-give">
              <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>arrow_upward</span>
              {totalOferecidas}
            </span>
            <span className="material-symbols-outlined pt-bottom-swap">swap_horiz</span>
            <span className="pt-bottom-receive">
              <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>arrow_downward</span>
              {totalDesejadas}
            </span>
          </div>
          <button
            className="pt-submit-btn"
            onClick={() => setShowConfirm(true)}
            disabled={submitting}
          >
            <span className="material-symbols-outlined">send</span>
            Enviar Proposta
          </button>
        </div>
      )}

      {/* Confirmation Modal */}
      {showConfirm && (
        <div className="pt-modal-overlay" onClick={() => !submitting && setShowConfirm(false)}>
          <div className="pt-modal" onClick={e => e.stopPropagation()}>
            <div className="pt-modal-icon">
              <span className="material-symbols-outlined">handshake</span>
            </div>
            <h2 className="pt-modal-title">Enviar proposta?</h2>
            <p className="pt-modal-message">
              {isUnbalanced
                ? `Atenção: troca não equivalente — você está ${totalOferecidas > totalDesejadas ? 'dando mais do que recebendo' : 'pedindo mais do que oferecendo'}.`
                : `Sua proposta de troca com ${username} será enviada.`}
            </p>

            <div className="pt-modal-details">
              <span className="pt-modal-user">
                <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>person</span>
                {username}
              </span>
              <span className="pt-modal-counts">
                <span className="pt-modal-count is-give">
                  <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>arrow_upward</span>
                  {totalOferecidas}
                </span>
                <span className="material-symbols-outlined" style={{ fontSize: '16px', color: 'var(--text-muted)' }}>swap_horiz</span>
                <span className="pt-modal-count is-receive">
                  <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>arrow_downward</span>
                  {totalDesejadas}
                </span>
              </span>
            </div>

            <div className="pt-modal-actions">
              <button
                className="pt-modal-btn is-cancel"
                onClick={() => setShowConfirm(false)}
                disabled={submitting}
              >
                Voltar
              </button>
              <button
                className="pt-modal-btn is-confirm"
                onClick={handleSubmit}
                disabled={submitting}
              >
                {submitting ? (
                  <>
                    <span className="material-symbols-outlined pt-spin" style={{ fontSize: '18px' }}>sports_soccer</span>
                    Enviando...
                  </>
                ) : (
                  'Enviar'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default ProporTroca
