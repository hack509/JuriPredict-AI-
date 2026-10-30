import { Scale } from 'lucide-react'

export default function LogoMark({ className = 'size-10' }) {
  return (
    <span
      className={`grid shrink-0 place-items-center overflow-hidden rounded-xl bg-white text-navy ${className}`}
    >
      <Scale size={24} strokeWidth={2.2} aria-hidden="true" />
    </span>
  )
}
