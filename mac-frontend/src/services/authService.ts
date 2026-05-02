const BASE = import.meta.env.VITE_API_URL

// ── tipos ────────────────────────────────────────────────────────────────

export interface AuthUser {
    username: string
    email: string
}

// ── funções públicas (mesma assinatura de antes) ─────────────────────────

export async function register(username: string, senha: string): Promise<AuthUser> {
    const res = await fetch(`${BASE}/auth/cadastro`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ username, senha })
    })
    if (!res.ok) throw await res.json()
    return res.json()
}

export async function login(username: string, senha: string): Promise<AuthUser> {
    const res = await fetch(`${BASE}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ username, senha })
    })
    if (!res.ok) throw await res.json()
    return res.json()
}

export async function logout(): Promise<void> {
    await fetch(`${BASE}/auth/logout`, {
        method: 'POST',
        credentials: 'include'
    })
    // dispara evento para o AuthContext limpar o estado
    window.dispatchEvent(new Event('auth:session-expired'))
}

export async function getSession(): Promise<AuthUser | null> {
    const res = await fetch(`${BASE}/auth/session`, {
        credentials: 'include'
    })
    if (!res.ok) return null
    return res.json()
}

// Cookie é HttpOnly — JS não tem acesso.
// getToken() não faz mais sentido, mas mantemos para não quebrar imports antigos.
export async function getToken(): Promise<null> {
    return null
}

// onAuthStateChange era reativo (WebSocket do Supabase).
// Substituímos por uma verificação na montagem + evento customizado.
export function onAuthStateChange(callback: (user: AuthUser | null) => void) {
    // Verifica sessão imediatamente
    getSession().then(callback)

    // Escuta logout forçado (ex: refresh token expirado)
    const handler = () => callback(null)
    window.addEventListener('auth:session-expired', handler)

    // Retorna unsubscribe no mesmo formato do Supabase
    return {
        data: {
            subscription: {
                unsubscribe: () => window.removeEventListener('auth:session-expired', handler)
            }
        }
    }
}