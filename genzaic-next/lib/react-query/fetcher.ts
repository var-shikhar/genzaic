async function readErrorMessage(res: Response): Promise<string> {
  try {
    const body = (await res.json()) as { error?: string; message?: string }
    return body?.error ?? body?.message ?? `Request failed: ${res.status}`
  } catch {
    return `Request failed: ${res.status}`
  }
}

export async function getJSON<T>(url: string): Promise<T> {
  const res = await fetch(url)
  if (!res.ok) throw new Error(await readErrorMessage(res))
  return (await res.json()) as T
}

export async function postJSON<TIn, TOut>(url: string, body?: TIn): Promise<TOut> {
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: body !== undefined ? JSON.stringify(body) : undefined,
  })
  if (!res.ok) throw new Error(await readErrorMessage(res))
  return (await res.json()) as TOut
}

export async function putJSON<TIn, TOut>(url: string, body: TIn): Promise<TOut> {
  const res = await fetch(url, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  })
  if (!res.ok) throw new Error(await readErrorMessage(res))
  return (await res.json()) as TOut
}

export async function patchJSON<TOut>(url: string): Promise<TOut> {
  const res = await fetch(url, { method: "PATCH" })
  if (!res.ok) throw new Error(await readErrorMessage(res))
  return (await res.json()) as TOut
}

export async function deleteJSON(url: string): Promise<void> {
  const res = await fetch(url, { method: "DELETE" })
  if (!res.ok) throw new Error(await readErrorMessage(res))
}

export async function postForm<TOut>(url: string, form: FormData): Promise<TOut> {
  const res = await fetch(url, { method: "POST", body: form })
  if (!res.ok) throw new Error(await readErrorMessage(res))
  return (await res.json()) as TOut
}

export async function putForm<TOut>(url: string, form: FormData): Promise<TOut> {
  const res = await fetch(url, { method: "PUT", body: form })
  if (!res.ok) throw new Error(await readErrorMessage(res))
  return (await res.json()) as TOut
}
