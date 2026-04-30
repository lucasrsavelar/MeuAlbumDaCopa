import { getToken } from '../services/authService'

const BASE_URL = import.meta.env.VITE_API_URL

async function authHeaders() {
    const token = await getToken()
    return {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
    }
}

// GET autenticado
export async function apiGet(path: string) {
    const res = await fetch(`${BASE_URL}${path}`, {
        headers: await authHeaders()
    })
    if (!res.ok) throw new Error(`Erro ${res.status}`)
    return res.json()
}

// POST autenticado
export async function apiPost(path: string, body: unknown) {
    const res = await fetch(`${BASE_URL}${path}`, {
        method: 'POST',
        headers: await authHeaders(),
        body: JSON.stringify(body)
    })
    if (!res.ok) throw new Error(`Erro ${res.status}`)
    // 204 No Content — sem body
    if (res.status === 204) return null
    return res.json()
}

// PATCH autenticado
export async function apiPatch(path: string, body: unknown) {
    const res = await fetch(`${BASE_URL}${path}`, {
        method: 'PATCH',
        headers: await authHeaders(),
        body: JSON.stringify(body)
    })
    if (!res.ok) throw new Error(`Erro ${res.status}`)
    return res.json()
}

// DELETE autenticado
export async function apiDelete(path: string) {
    const res = await fetch(`${BASE_URL}${path}`, {
        method: 'DELETE',
        headers: await authHeaders()
    })
    if (!res.ok) throw new Error(`Erro ${res.status}`)
    return res.json()
}