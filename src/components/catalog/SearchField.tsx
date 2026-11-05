import type { ReactNode, Ref } from 'react'

interface SearchFieldProps {
  children?: ReactNode
  id: string
  label: string
  value: string
  placeholder: string
  inputRef?: Ref<HTMLInputElement>
  onChange: (value: string) => void
}

export default function SearchField({
  id,
  label,
  value,
  placeholder,
  inputRef,
  onChange,
  children,
}: SearchFieldProps) {
  const input = (
    <input
      ref={inputRef}
      id={id}
      name="query"
      type="search"
      enterKeyHint="search"
      autoCapitalize="none"
      autoCorrect="off"
      autoComplete="off"
      placeholder={placeholder}
      value={value}
      aria-controls="product-grid"
      onChange={(event) => onChange(event.target.value)}
    />
  )
  return (
    <>
      <label htmlFor={id}>{label}</label>
      {children ? (
        <div className="search-row">
          {input}
          {children}
        </div>
      ) : (
        input
      )}
    </>
  )
}
