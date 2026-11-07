import { BASE_URL } from '../../../shared/api/client.ts'
export type CatalogScenario = '/delay/3000' | '/fail/500' | '/empty'
export function catalogScenarioFromPath(
  path: string,
): CatalogScenario | undefined {
  if (path === '/delay/3000' || path === '/fail/500' || path === '/empty')
    return path
  return undefined
}
// Only the collection URL is redirected; the protected central API client still
// performs the request and validates the original response shape.
export function scenarioFetch(
  fetcher: typeof fetch,
  scenario: CatalogScenario,
): typeof fetch {
  let attempted = false
  return (input, options) => {
    const url = String(input)
    if (url.split('?')[0] !== BASE_URL + '/products')
      return fetcher(input, options)
    const selected =
      scenario === '/fail/500' && attempted ? '/products' : scenario
    attempted = true
    return fetcher(BASE_URL + selected, options)
  }
}
