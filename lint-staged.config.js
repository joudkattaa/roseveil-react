import path from 'node:path'
import { fileURLToPath } from 'node:url'

const root = path.dirname(fileURLToPath(import.meta.url))
const protectedPaths = new Set([
  'src/logic.ts',
  'src/state.ts',
  'src/modules/cart/cart.logic.ts',
  'src/modules/cart/cart.types.ts',
  'src/modules/products/products.api.ts',
  'src/modules/products/products.logic.ts',
  'src/modules/products/products.types.ts',
  'src/modules/state/state.types.ts',
  'src/shared/api/client.ts',
])

export default function stagedTasks(files) {
  const eligible = files.filter((file) => {
    const relative = path
      .relative(root, file)
      .replaceAll('\\', '/')
      .toLowerCase()
    return (
      relative !== '..' &&
      !relative.startsWith('../') &&
      !path.isAbsolute(relative) &&
      !protectedPaths.has(relative)
    )
  })
  // lint-staged parses arguments without a shell; quote each filename separately.
  const argumentsFor = (selected) =>
    selected.map((file) => JSON.stringify(file.replaceAll('\\', '/'))).join(' ')
  const code = eligible.filter((file) => /\.(?:[cm]?js|jsx|tsx?)$/i.test(file))
  const formattable = eligible.filter((file) =>
    /\.(?:[cm]?js|jsx|tsx?|css|html|json|md|ya?ml)$/i.test(file),
  )
  return [
    ...(code.length
      ? [`oxlint --max-warnings 0 -- ${argumentsFor(code)}`]
      : []),
    ...(formattable.length
      ? [`prettier --write -- ${argumentsFor(formattable)}`]
      : []),
  ]
}
