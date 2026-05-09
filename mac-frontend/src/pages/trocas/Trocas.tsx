import { useState, useMemo, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQueryClient } from '@tanstack/react-query'
import { useTrocas } from '../../hooks/useTrocas'
import { useAllFigurinhas } from '../../hooks/useStaticData'
import { usePropostasRecebidas, usePropostasEnviadas } from '../../hooks/usePropostaTroca'
import type { Figurinha, TrocasDTO } from '../../types'
import './Trocas.css'

function Trocas() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  useEffect(() => {
    queryClient.invalidateQueries({ queryKey: ['trocas'] })
    queryClient.invalidateQueries({ queryKey: ['propostas-troca'] })
  }, [queryClient])

  const { data: trocas, isLoading: loadingTrocas } = useTrocas()
  const { data: figurinhas, isLoading: loadingFigurinhas } = useAllFigurinhas()
  const { data: recebidas, isLoading: loadingRecebidas } = usePropostasRecebidas()
  const { data: enviadas, isLoading: loadingEnviadas } = usePropostasEnviadas()

  const [expandedAmigo, setExpandedAmigo] = useState<string | null>(null)

  const isLoading = loadingTrocas || loadingFigurinhas || loadingRecebidas || loadingEnviadas

  // Mapa id → Figurinha para lookup rápido
  const figurinhaMap = useMemo(() => {
    if (!figurinhas) return new Map<number, Figurinha>()
    return new Map(figurinhas.map(f => [f.id, f]))
  }, [figurinhas])

  const codigoPorId = (id: number) => figurinhaMap.get(id)?.codigoFigurinha ?? `#${id}`

  const toggleAmigo = (username: string) => {
    setExpandedAmigo(prev => prev === username ? null : username)
  }

  const usuariosComProposta = useMemo(() => {
    const set = new Set<string>()
    if (recebidas) recebidas.forEach(p => set.add(p.usernameEnviou))
    if (enviadas) enviadas.forEach(p => set.add(p.usernameEnviou))
    return set
  }, [recebidas, enviadas])

  // Filtra trocas que realmente têm figurinhas para trocar e que não têm propostas em andamento
  const trocasDisponiveis = useMemo(() => {
    if (!trocas) return []
    return trocas.filter(t => 
      t.euOfereço.length > 0 && 
      t.amigoOferece.length > 0 && 
      !usuariosComProposta.has(t.usernameAmigo)
    )
  }, [trocas, usuariosComProposta])

  const handleProporTroca = (troca: TrocasDTO) => {
    navigate(`/propor-troca/${encodeURIComponent(troca.usernameAmigo)}`, {
      state: { troca },
    })
  }

  return (
    <div className="tr-container soccer-pattern">
      {/* Header */}
      <header className="tr-header">
        <button className="tr-back" onClick={() => navigate('/dashboard')} aria-label="Voltar">
          <span className="material-symbols-outlined">arrow_back</span>
        </button>
        <div className="tr-header-info">
          <div className="tr-header-icon">
            <span className="material-symbols-outlined">swap_horiz</span>
          </div>
          <div>
            <h1 className="tr-title">Trocas Disponíveis</h1>
            <p className="tr-subtitle">
              {isLoading ? 'Carregando...' : `${trocasDisponiveis.length} amigo${trocasDisponiveis.length !== 1 ? 's' : ''} com trocas`}
            </p>
          </div>
        </div>
        <button
          className="tr-proposals-btn"
          onClick={() => navigate('/ver-propostas')}
          title="Ver Propostas"
          aria-label="Ver Propostas"
        >
          <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>handshake</span>
          {recebidas && recebidas.length > 0 && (
            <span className="tr-proposals-badge">{recebidas.length}</span>
          )}
        </button>
      </header>

      <main className="tr-content">
        {isLoading ? (
          <div className="tr-loading">
            <span className="material-symbols-outlined tr-loading-icon">sports_soccer</span>
            <p>Buscando trocas possíveis...</p>
          </div>
        ) : trocasDisponiveis.length === 0 ? (
          <div className="tr-empty">
            <span className="material-symbols-outlined tr-empty-icon">swap_horiz</span>
            <p>Nenhuma troca disponível</p>
            <span className="tr-empty-hint">Adicione amigos e figurinhas para encontrar trocas</span>
          </div>
        ) : (
          <div className="tr-list">
            {trocasDisponiveis.map(troca => {
              const isExpanded = expandedAmigo === troca.usernameAmigo
              return (
                <div
                  key={troca.usernameAmigo}
                  className={`tr-card ${isExpanded ? 'is-expanded' : ''}`}
                >
                  {/* Card header — clicável */}
                  <button
                    className="tr-card-header"
                    onClick={() => toggleAmigo(troca.usernameAmigo)}
                  >
                    <div className="tr-card-avatar">
                      <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>person</span>
                    </div>
                    <div className="tr-card-info">
                      <span className="tr-card-name">{troca.usernameAmigo}</span>
                      <span className="tr-card-summary">
                        {troca.amigoOferece.length} para receber · {troca.euOfereço.length} para dar
                      </span>
                    </div>
                    <span className={`material-symbols-outlined tr-card-chevron ${isExpanded ? 'is-open' : ''}`}>
                      expand_more
                    </span>
                  </button>

                  {/* Card details — expandido */}
                  {isExpanded && (
                    <div className="tr-card-details">
                      <div className="tr-card-sections">
                        {/* Figurinhas que o amigo oferece (eu recebo) */}
                        <div className="tr-section">
                          <div className="tr-section-header">
                            <span className="material-symbols-outlined tr-section-icon is-receive">arrow_downward</span>
                            <span className="tr-section-title">Você recebe</span>
                            <span className="tr-section-count">{troca.amigoOferece.length}</span>
                          </div>
                          <div className="tr-chips">
                            {troca.amigoOferece.map(id => (
                              <span key={id} className="tr-chip is-receive">{codigoPorId(id)}</span>
                            ))}
                          </div>
                        </div>

                        {/* Figurinhas que eu ofereço (eu dou) */}
                        <div className="tr-section">
                          <div className="tr-section-header">
                            <span className="material-symbols-outlined tr-section-icon is-give">arrow_upward</span>
                            <span className="tr-section-title">Você dá</span>
                            <span className="tr-section-count">{troca.euOfereço.length}</span>
                          </div>
                          <div className="tr-chips">
                            {troca.euOfereço.map(id => (
                              <span key={id} className="tr-chip is-give">{codigoPorId(id)}</span>
                            ))}
                          </div>
                        </div>
                      </div>

                      {/* Botão Propor Troca */}
                      <div className="tr-card-actions">
                        <button
                          className="tr-propose-btn"
                          onClick={(e) => { e.stopPropagation(); handleProporTroca(troca) }}
                        >
                        <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>handshake</span>
                        Propor Troca
                        </button>
                      </div>
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

export default Trocas
