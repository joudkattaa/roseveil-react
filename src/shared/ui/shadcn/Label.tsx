// Manually installed from shadcn/ui (MIT), revision c257f688cf4de7ec10cc1be84cad29cd4631182c.
// Source: https://github.com/shadcn-ui/ui/blob/c257f688cf4de7ec10cc1be84cad29cd4631182c/apps/v4/registry/new-york-v4/ui/label.tsx
// Adapted: relative imports, named Props, one component per file, ROSEVEIL CSS; semantic error keys.
import type { ComponentProps } from 'react'
import { Root } from '@radix-ui/react-label'
import { cn } from './cn.ts'
const LabelPrimitive = { Root }
interface LabelProps extends ComponentProps<typeof Root> {}
function Label({ className, ...props }: LabelProps) {
  return (
    <LabelPrimitive.Root
      data-slot="label"
      className={cn(
        'flex items-center gap-2 text-sm leading-none font-medium select-none group-data-[disabled=true]:pointer-events-none group-data-[disabled=true]:opacity-50 peer-disabled:cursor-not-allowed peer-disabled:opacity-50',
        className,
      )}
      {...props}
    />
  )
}

export { Label }
