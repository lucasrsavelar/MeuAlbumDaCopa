import { createContext, useContext, useEffect, useState } from 'react'
import { type AuthUser, getSession, login as doLogin, logout as doLogout } from '../services/authService'
import { useNavigate } from 'react-router-dom'
import { useQueryClient } from '@tanstack/react-query'

interface AuthContextType {
    user: AuthUser | null
    login: (username: string, senha: string) => Promise<void>
    logout: () => Promise<void>
    carregando: boolean
}

const AuthContext = createContext<AuthContextType | null>(null)

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<AuthUser | null>(null)
    const [carregando, setCarregando] = useState(true)
    const navigate = useNavigate()
    const queryClient = useQueryClient()

    // Verifica sessão ao carregar o app
    useEffect(() => {
        getSession()
            .then(setUser)
            .finally(() => setCarregando(false))

        // Escuta logout forçado (refresh token expirado)
        const handler = () => { setUser(null); navigate('/login') }
        window.addEventListener('auth:session-expired', handler)
        return () => window.removeEventListener('auth:session-expired', handler)
    }, [])

    const login = async (username: string, senha: string) => {
        const data = await doLogin(username, senha)
        setUser(data)
        navigate('/dashboard')
    }

    const logout = async () => {
        await doLogout()
        queryClient.clear()
        setUser(null)
        navigate('/login')
    }

    return (
        <AuthContext.Provider value={{ user, login, logout, carregando }}>
            {children}
        </AuthContext.Provider>
    )
}

export function useAuth() {
    const ctx = useContext(AuthContext)
    if (!ctx) throw new Error('useAuth deve ser usado dentro de AuthProvider')
    return ctx
}