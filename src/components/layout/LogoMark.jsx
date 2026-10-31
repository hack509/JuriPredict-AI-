export default function LogoMark({ className = 'size-10' }) {
  return (
    <span
      className={`grid shrink-0 place-items-center overflow-hidden rounded-xl bg-white text-navy ${className}`}
    >
      <img
        src="/logo-icon.svg"
        alt=""
        className="size-full object-cover"
        aria-hidden="true"
      />
    </span>
  )
}
