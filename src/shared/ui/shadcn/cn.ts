import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'
// Standard shadcn class-name helper; existing ROSEVEIL CSS supplies the styles.
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
