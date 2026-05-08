import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { register } from '../../services/authService'
import { validateUsername } from './Cadastro.scripts'
import './Cadastro.css'
import logoImg from '../../assets/logo.png'

function Cadastro() {
  const navigate = useNavigate()
  const [usuario, setUsuario] = useState('')
  const [senha, setSenha] = useState('')
  const [confirmarSenha, setConfirmarSenha] = useState('')
  const [mostrarSenha, setMostrarSenha] = useState(false)
  const [mostrarConfirmar, setMostrarConfirmar] = useState(false)
  const [erro, setErro] = useState('')
  const [carregando, setCarregando] = useState(false)

  // Validações
  const erroUsuario = usuario.length > 0 ? validateUsername(usuario) : undefined
  const usuarioValido = usuario.length > 0 && !erroUsuario
  const senhaValida = senha.length >= 8
  const senhasIguais = confirmarSenha.length > 0 && senha === confirmarSenha
  const senhasDiferentes = confirmarSenha.length > 0 && senha !== confirmarSenha
  const formularioValido = usuarioValido && senhaValida && senhasIguais

  const handleSubmit = async (e: React.SubmitEvent) => {
    e.preventDefault()
    setErro('')

    // Validação final antes de enviar
    const usernameError = validateUsername(usuario)
    if (usernameError) {
      setErro(usernameError)
      return
    }
    if (!senhaValida) {
      setErro('A senha deve ter pelo menos 8 caracteres.')
      return
    }
    if (!senhasIguais) {
      setErro('As senhas não coincidem.')
      return
    }

    setCarregando(true)
    try {
      await register(usuario, senha)
      navigate('/dashboard')
    } catch (err: any) {
      setErro(err?.message || 'Erro ao criar conta. Tente novamente.')
    } finally {
      setCarregando(false)
    }
  }

  return (
    <div className="cadastro-container soccer-pattern">
      {/* Desktop: painel lateral com branding */}
      <aside className="cadastro-brand-panel">
        <div className="cadastro-brand-panel-content">
          <div className="cadastro-brand-panel-icon">
            <img src={logoImg} alt="MAC 26 Logo" />
          </div>
          <h2 className="cadastro-brand-panel-title">Junte-se<br />à Coleção</h2>

          <div className="cadastro-brand-panel-features">
            <div className="cadastro-feature-item">
              <div className="cadastro-feature-icon">
                <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>auto_awesome</span>
              </div>
              Rastreie suas figurinhas coletadas
            </div>
            <div className="cadastro-feature-item">
              <div className="cadastro-feature-icon">
                <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>swap_horiz</span>
              </div>
              Troque repetidas com a comunidade
            </div>
            <div className="cadastro-feature-item">
              <div className="cadastro-feature-icon">
                <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>emoji_events</span>
              </div>
              Acompanhe seu progresso em tempo real
            </div>
          </div>
        </div>
      </aside>

      {/* Formulário */}
      <div className="cadastro-form-panel">
        <div className="cadastro-inner">
          {/* Botão voltar */}
          <Link to="/" className="cadastro-back">
            <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>arrow_back</span>
            Voltar
          </Link>

          {/* Logo (mobile/tablet only) */}
          <div className="cadastro-logo">
            <div className="cadastro-logo-icon">
              <img src={logoImg} alt="MAC 26 Logo" />
            </div>
            <span className="cadastro-brand-text">Meu Álbum da Copa</span>
          </div>

          {/* Header */}
          <div className="cadastro-header">
            <h1>Crie sua conta</h1>
          </div>

          {/* Card */}
          <div className="cadastro-card">
            <form className="cadastro-form" onSubmit={handleSubmit}>
              {/* Erro geral */}
              {erro && (
                <div className="cadastro-error">
                  <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>error</span>
                  {erro}
                </div>
              )}

              {/* Usuário */}
              <div className="cadastro-input-group">
                <label className="cadastro-input-label" htmlFor="cadastro-usuario">
                  Nome de Usuário
                </label>
                <div className={`cadastro-input-wrapper ${erroUsuario ? 'cadastro-input-error' : ''} ${usuarioValido ? 'cadastro-input-success' : ''}`}>
                  <span className="cadastro-input-icon material-symbols-outlined">person</span>
                  <input
                    id="cadastro-usuario"
                    className="cadastro-input-field"
                    type="text"
                    placeholder="Escolha um nome de usuário"
                    value={usuario}
                    onChange={(e) => setUsuario(e.target.value.toLowerCase())}
                    autoComplete="username"
                  />
                </div>
                {erroUsuario && (
                  <span className="cadastro-input-hint cadastro-hint-error">
                    {erroUsuario}
                  </span>
                )}
                {usuarioValido && (
                  <span className="cadastro-input-hint cadastro-hint-success">
                    ✓ Nome de usuário válido
                  </span>
                )}
              </div>

              {/* Senha */}
              <div className="cadastro-input-group">
                <label className="cadastro-input-label" htmlFor="cadastro-senha">
                  Senha
                </label>
                <div className={`cadastro-input-wrapper ${senha.length > 0 && !senhaValida ? 'cadastro-input-error' : ''} ${senhaValida ? 'cadastro-input-success' : ''}`}>
                  <span className="cadastro-input-icon material-symbols-outlined">lock</span>
                  <input
                    id="cadastro-senha"
                    className="cadastro-input-field"
                    type={mostrarSenha ? 'text' : 'password'}
                    placeholder="Mínimo 8 caracteres"
                    value={senha}
                    onChange={(e) => setSenha(e.target.value)}
                    autoComplete="new-password"
                  />
                  <button
                    type="button"
                    className="cadastro-toggle-password"
                    onClick={() => setMostrarSenha(!mostrarSenha)}
                    aria-label={mostrarSenha ? 'Ocultar senha' : 'Mostrar senha'}
                  >
                    <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>
                      {mostrarSenha ? 'visibility_off' : 'visibility'}
                    </span>
                  </button>
                </div>
                {senha.length > 0 && !senhaValida && (
                  <span className="cadastro-input-hint cadastro-hint-error">
                    A senha deve ter pelo menos 8 caracteres
                  </span>
                )}
                {senhaValida && (
                  <span className="cadastro-input-hint cadastro-hint-success">
                    ✓ Senha válida
                  </span>
                )}
              </div>

              {/* Confirmar Senha */}
              <div className="cadastro-input-group">
                <label className="cadastro-input-label" htmlFor="cadastro-confirmar">
                  Confirmar Senha
                </label>
                <div className={`cadastro-input-wrapper ${senhasDiferentes ? 'cadastro-input-error' : ''} ${senhasIguais ? 'cadastro-input-success' : ''}`}>
                  <span className="cadastro-input-icon material-symbols-outlined">lock</span>
                  <input
                    id="cadastro-confirmar"
                    className="cadastro-input-field"
                    type={mostrarConfirmar ? 'text' : 'password'}
                    placeholder="Confirme sua senha"
                    value={confirmarSenha}
                    onChange={(e) => setConfirmarSenha(e.target.value)}
                    autoComplete="new-password"
                  />

                  <button
                    type="button"
                    className="cadastro-toggle-password"
                    onClick={() => setMostrarConfirmar(!mostrarConfirmar)}
                    aria-label={mostrarConfirmar ? 'Ocultar senha' : 'Mostrar senha'}
                  >
                    <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>
                      {mostrarConfirmar ? 'visibility_off' : 'visibility'}
                    </span>
                  </button>
                </div>
                {confirmarSenha.length > 0 && senhasDiferentes && (
                  <span className="cadastro-input-hint cadastro-hint-error">
                    As senhas não coincidem
                  </span>
                )}
                {confirmarSenha.length > 0 && senhasIguais && (
                  <span className="cadastro-input-hint cadastro-hint-success">
                    ✓ Senhas coincidem
                  </span>
                )}
              </div>

              {/* Botão Cadastrar */}
              <button
                type="submit"
                className="cadastro-submit"
                id="cadastro-submit-btn"
                disabled={!formularioValido || carregando}
              >
                {carregando ? 'Criando conta...' : 'Cadastrar'}
                {!carregando && (
                  <span className="cadastro-submit-icon material-symbols-outlined">how_to_reg</span>
                )}
              </button>
            </form>
          </div>

          {/* Link para login */}
          <p className="cadastro-footer">
            Já tem uma conta?{' '}
            <Link to="/" className="cadastro-footer-link">
              Entrar
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}

export default Cadastro