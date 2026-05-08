const BASE = import.meta.env.VITE_API_URL

let isRefreshing = false
let refreshQueue: Array<(ok: boolean) => void> = []

async function trySession(): Promise<boolean> {
    if (isRefreshing) {
        return new Promise(resolve => {
            refreshQueue.push(resolve)
        })
    }

    isRefreshing = true

    try {
        const res = await fetch(`${BASE}/auth/session`, {
            credentials: 'include'
        })

        const ok = res.ok

        refreshQueue.forEach(resolve => resolve(ok))
        refreshQueue = []

        return ok
    } catch {
        refreshQueue.forEach(resolve => resolve(false))
        refreshQueue = []
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
            ...(options.body ? { 'Content-Type': 'application/json' } : {}),
            ...options.headers
        }
    })

    if (res.status === 401 && retry) {
        const ok = await trySession()

        if (ok) {
            await new Promise(r => setTimeout(r, 50)) // opcional
            return apiFetch(path, options, false)
        }

        window.dispatchEvent(new Event('auth:session-expired'))
        throw new Error('Sessão expirada')
    }

    return res
}

// ── métodos públicos (mesma interface de antes) ──────────────────────────

async function handleError(res: Response) {
    let errorMessage = `Erro ${res.status}`
    try {
        const body = await res.json()
        if (body && typeof body.message === 'string') {
            errorMessage = body.message
        }
    } catch {
        // ignore JSON parse errors
    }
    throw new Error(errorMessage)
}

export async function apiGet(path: string) {
    const res = await apiFetch(path, { method: 'GET' })
    if (!res.ok) await handleError(res)
    return res.json()
}

export async function apiPost(path: string, body: unknown) {
    const res = await apiFetch(path, {
        method: 'POST',
        body: JSON.stringify(body)
    })
    if (!res.ok) await handleError(res)
    if (res.status === 204) return null
    return res.json()
}

export async function apiPatch(path: string, body: unknown) {
    const res = await apiFetch(path, {
        method: 'PATCH',
        body: JSON.stringify(body)
    })
    if (!res.ok) await handleError(res)
    if (res.status === 204) return null
    return res.json()
}

export async function apiDelete(path: string) {
    const res = await apiFetch(path, { method: 'DELETE' })
    if (!res.ok) await handleError(res)
    if (res.status === 204) return null
    return res.json()
}