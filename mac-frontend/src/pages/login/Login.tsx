import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { login } from '../../services/authService'
import './Login.css'

function Login() {
  const navigate = useNavigate()
  const [usuario, setUsuario] = useState('')
  const [senha, setSenha] = useState('')
  const [mostrarSenha, setMostrarSenha] = useState(false)
  const [erro, setErro] = useState('')
  const [carregando, setCarregando] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErro('')

    if (!usuario.trim() || !senha) {
      setErro('Preencha todos os campos.')
      return
    }

    setCarregando(true)
    try {
      await login(usuario, senha)
      navigate('/dashboard')
    } catch (err: any) {
      // Mensagens amigáveis para erros comuns do Supabase
      const msg = err?.message ?? ''
      if (msg.includes('Invalid login credentials')) {
        setErro('Usuário ou senha incorretos.')
      } else if (msg.includes('Email not confirmed')) {
        setErro('Conta não confirmada. Verifique seu e-mail.')
      } else {
        setErro('Erro ao entrar. Tente novamente.')
      }
    } finally {
      setCarregando(false)
    }
  }

  return (
    <div className="login-container soccer-pattern">
      {/* Desktop: painel lateral com branding */}
      <aside className="login-brand-panel">
        <div className="login-brand-panel-content">
          <div className="login-brand-panel-icon">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20" />
              <path d="M2 12h20" />
            </svg>
          </div>
          <h2 className="login-brand-panel-title">Meu Álbum<br />da Copa</h2>
          <p className="login-brand-panel-subtitle">
            Gerencie sua coleção de figurinhas da Copa do Mundo 2026
          </p>
        </div>
      </aside>

      {/* Formulário (mobile: centralizado / desktop: painel direito) */}
      <div className="login-form-panel">
        <div className="login-inner">
          {/* Logo (mobile/tablet only) */}
          <div className="login-logo">
            <div className="login-logo-icon">
              <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20" />
                <path d="M2 12h20" />
              </svg>
            </div>
            <span className="login-brand-text">Meu Álbum da Copa</span>
          </div>

          {/* Welcome text */}
          <div className="login-welcome">
            <h1>Bem-vindo de volta!</h1>
            <p>Entre para continuar colecionando.</p>
          </div>

          {/* Card com formulário */}
          <div className="login-card">
            <form className="login-form" onSubmit={handleSubmit}>
              {/* Erro geral */}
              {erro && (
                <div className="login-error">
                  <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>error</span>
                  {erro}
                </div>
              )}

              {/* Usuário */}
              <div className="login-input-group">
                <label className="login-input-label" htmlFor="login-usuario">
                  Nome de Usuário
                </label>
                <div className="login-input-wrapper">
                  <span className="login-input-icon material-symbols-outlined">person</span>
                  <input
                    id="login-usuario"
                    className="login-input-field"
                    type="text"
                    placeholder="Seu nome de usuário"
                    value={usuario}
                    onChange={(e) => setUsuario(e.target.value.toLowerCase())}
                    autoComplete="username"
                  />
                </div>
              </div>

              {/* Senha */}
              <div className="login-input-group">
                <label className="login-input-label" htmlFor="login-senha">
                  Senha
                </label>
                <div className="login-input-wrapper">
                  <span className="login-input-icon material-symbols-outlined">lock</span>
                  <input
                    id="login-senha"
                    className="login-input-field"
                    type={mostrarSenha ? 'text' : 'password'}
                    placeholder="Sua senha"
                    value={senha}
                    onChange={(e) => setSenha(e.target.value)}
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    className="login-toggle-password"
                    onClick={() => setMostrarSenha(!mostrarSenha)}
                    aria-label={mostrarSenha ? 'Ocultar senha' : 'Mostrar senha'}
                  >
                    <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>
                      {mostrarSenha ? 'visibility_off' : 'visibility'}
                    </span>
                  </button>
                </div>
              </div>

              {/* Botão Entrar */}
              <button
                type="submit"
                className="login-submit"
                id="login-submit-btn"
                disabled={carregando}
              >
                {carregando ? 'Entrando...' : 'Entrar'}
                {!carregando && (
                  <span className="login-submit-icon material-symbols-outlined">arrow_forward</span>
                )}
              </button>
            </form>
          </div>

          {/* Link para cadastro */}
          <p className="login-footer">
            Não tem uma conta?{' '}
            <Link to="/cadastro" className="login-footer-link">
              Cadastre-se
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}

export default Login