// This transport wrapper is injected into the protected central API client.
// Racing the whole small JSON response also protects against transports that
// ignore AbortSignal or deliver a response body after cancellation.
export function abortableFetch(
  fetcher: typeof fetch,
  signal: AbortSignal,
): typeof fetch {
  return (input, options) => {
    signal.throwIfAborted()
    return new Promise<Response>((resolve, reject) => {
      function abort() {
        signal.removeEventListener('abort', abort)
        reject(
          signal.reason ?? new DOMException('Request cancelled.', 'AbortError'),
        )
      }
      signal.addEventListener('abort', abort, { once: true })
      void Promise.resolve()
        .then(async () => {
          signal.throwIfAborted()
          const response = await fetcher(input, { ...options, signal })
          if (!response.ok) return response
          const body = await response.text()
          signal.throwIfAborted()
          return new Response(body || null, {
            status: response.status,
            statusText: response.statusText,
            headers: response.headers,
          })
        })
        .then(
          (response) => {
            signal.removeEventListener('abort', abort)
            if (signal.aborted) abort()
            else resolve(response)
          },
          (error: unknown) => {
            signal.removeEventListener('abort', abort)
            reject(error)
          },
        )
    })
  }
}
