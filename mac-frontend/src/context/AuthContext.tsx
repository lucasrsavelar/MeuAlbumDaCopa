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

let sessionPromise: Promise<AuthUser | null> | null = null

function getSessionOnce() {
    if (!sessionPromise) {
        sessionPromise = getSession()
    }
    return sessionPromise
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<AuthUser | null>(null)
    const [carregando, setCarregando] = useState(true)

    const navigate = useNavigate()
    const queryClient = useQueryClient()

    useEffect(() => {
        getSessionOnce()
            .then(setUser)
            .finally(() => setCarregando(false))

        const handleSessionExpired = () => {
            setUser(null)
            queryClient.clear()
            navigate('/login')
        }

        const handleStorage = (e: StorageEvent) => {
            if (e.key === 'logout') handleSessionExpired()
        }

        window.addEventListener('auth:session-expired', handleSessionExpired)
        window.addEventListener('storage', handleStorage)

        return () => {
            window.removeEventListener('auth:session-expired', handleSessionExpired)
            window.removeEventListener('storage', handleStorage)
        }
    }, [])

    const login = async (username: string, senha: string) => {
        const data = await doLogin(username, senha)
        queryClient.clear()
        setUser(data)
        navigate('/dashboard')
    }

    const logout = async () => {
        await doLogout()
        queryClient.clear()
        setUser(null)
        localStorage.setItem('logout', Date.now().toString())

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