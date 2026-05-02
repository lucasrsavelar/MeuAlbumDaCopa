const BASE = import.meta.env.VITE_API_URL

// ── refresh transparente ─────────────────────────────────────────────────

let isRefreshing = false
let refreshQueue: Array<() => void> = []

async function tryRefresh(): Promise<boolean> {
    if (isRefreshing) {
        return new Promise(resolve => {
            refreshQueue.push(() => resolve(true))
        })
    }

    isRefreshing = true

    try {
        const res = await fetch(`${BASE}/auth/refresh`, {
            method: 'POST',
            credentials: 'include'
        })

        if (!res.ok) throw new Error('Refresh falhou')

        refreshQueue.forEach(fn => fn())
        refreshQueue = []
        return true
    } catch {
        refreshQueue = []
        window.dispatchEvent(new Event('auth:session-expired'))
        return false
    } finally {
        isRefreshing = false
    }
}

// ── fetch base com retry ─────────────────────────────────────────────────

async function apiFetch(path: string, options: RequestInit = {}, retry = true): Promise<Response> {
    const res = await fetch(`${BASE}${path}`, {
        ...options,
        credentials: 'include',
        headers: {
            'Content-Type': 'application/json',
            ...options.headers
        }
    })

    if (res.status === 401 && retry) {
        const refreshed = await tryRefresh()
        if (refreshed) return apiFetch(path, options, false)
        throw new Error('Sessão expirada')
    }

    return res
}

// ── métodos públicos (mesma interface de antes) ──────────────────────────

export async function apiGet(path: string) {
    const res = await apiFetch(path, { method: 'GET' })
    if (!res.ok) throw new Error(`Erro ${res.status}`)
    return res.json()
}

export async function apiPost(path: string, body: unknown) {
    const res = await apiFetch(path, {
        method: 'POST',
        body: JSON.stringify(body)
    })
    if (!res.ok) throw new Error(`Erro ${res.status}`)
    if (res.status === 204) return null
    return res.json()
}

export async function apiPatch(path: string, body: unknown) {
    const res = await apiFetch(path, {
        method: 'PATCH',
        body: JSON.stringify(body)
    })
    if (!res.ok) throw new Error(`Erro ${res.status}`)
    return res.json()
}

export async function apiDelete(path: string) {
    const res = await apiFetch(path, { method: 'DELETE' })
    if (!res.ok) throw new Error(`Erro ${res.status}`)
    return res.json()
}