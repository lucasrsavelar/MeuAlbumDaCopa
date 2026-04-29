import { supabase } from '../lib/supabase'

// Gera email fictício a partir do username
const toFakeEmail = (username: string) =>
    `${username.toLowerCase()}@mac.com`

// Cadastro
export async function register(username: string, password: string) {
    const email = toFakeEmail(username)

    const { data, error } = await supabase.auth.signUp({ email, password })
    if (error) throw error

    return data
}

// Login
export async function login(username: string, password: string) {
    const email = toFakeEmail(username)

    const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
    })
    if (error) throw error

    return data
}

// Logout
export async function logout() {
    await supabase.auth.signOut()
}

// Pega o token JWT da sessão atual
export async function getToken(): Promise<string | null> {
    const { data: { session } } = await supabase.auth.getSession()
    console.log('Session:', session)
    console.log('Token:', session?.access_token)
    return session?.access_token ?? null
}

// Retorna o usuário da sessão atual (ou null se não estiver logado)
export async function getSession() {
    const { data: { session } } = await supabase.auth.getSession()
    return session
}

// Observa mudanças de estado (login, logout, renovação de token)
export function onAuthStateChange(callback: (session: any) => void) {
    return supabase.auth.onAuthStateChange((_event, session) => {
        callback(session)
    })
}