import { useState } from 'react'
import { BookOpen, Menu, X } from 'lucide-react'
import { NavLink, Outlet } from 'react-router-dom'

const links = [
  { to: '/', label: 'Accueil' },
  { to: '/assistant', label: 'Assistant IA' },
  { to: '/base-juridique', label: 'Base juridique' },
  { to: '/ressources', label: 'Ressources' },
]

export default function Layout() {
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <div className="flex min-h-screen flex-col bg-slate-50 text-slate-800">
      <a
        href="#contenu"
        className="sr-only z-50 rounded-md bg-white px-4 py-2 text-navy focus:not-sr-only focus:absolute focus:left-4 focus:top-4"
      >
        Aller au contenu
      </a>
      <header className="bg-navy text-white shadow-sm">
        <nav
          aria-label="Navigation principale"
          className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-4 py-4 sm:px-6"
        >
          <NavLink
            to="/"
            end
            className="flex shrink-0 items-center gap-2 rounded-xl focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-info"
            onClick={() => setMenuOpen(false)}
          >
            <span className="grid size-10 shrink-0 place-items-center overflow-hidden rounded-xl bg-white">
              <img
                src="/logo-icon.png"
                alt=""
                aria-hidden="true"
                width="160"
                height="160"
                className="size-10 object-contain"
              />
            </span>
            <span className="flex h-8 items-center rounded-md bg-white px-2">
              <img
                src="/logo-text.png"
                alt="JuriPredict AI"
                width="220"
                height="40"
                className="h-5 w-auto max-w-32 object-contain"
              />
            </span>
          </NavLink>

          <button
            type="button"
            className="rounded-lg p-2 text-white hover:bg-white/10 md:hidden"
            aria-expanded={menuOpen}
            aria-controls="navigation-links"
            aria-label={menuOpen ? 'Fermer le menu' : 'Ouvrir le menu'}
            onClick={() => setMenuOpen((open) => !open)}
          >
            {menuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>

          <div
            id="navigation-links"
            className={`${menuOpen ? 'flex' : 'hidden'} w-full flex-col gap-1 md:flex md:w-auto md:flex-row md:items-center md:gap-2`}
          >
            {links.map(({ to, label }) => (
              <NavLink
                key={to}
                to={to}
                end={to === '/'}
                onClick={() => setMenuOpen(false)}
                className={({ isActive }) =>
                  `rounded-lg px-3 py-2 text-sm transition hover:bg-white/10 hover:text-info ${
                    isActive ? 'bg-white/10 font-semibold text-info' : 'text-slate-100'
                  }`
                }
              >
                {label}
              </NavLink>
            ))}
          </div>
        </nav>
      </header>

      <main
        id="contenu"
        className="mx-auto w-full max-w-6xl flex-1 px-4 py-8 sm:px-6 sm:py-10"
      >
        <Outlet />
      </main>

      <footer className="border-t border-slate-200 bg-white">
        <div className="mx-auto flex max-w-6xl flex-col gap-3 px-4 py-6 text-sm text-slate-500 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <p className="flex items-center gap-2">
            <BookOpen size={16} aria-hidden="true" />
            Droit haïtien, sources consultables et analyse prudente.
          </p>
          <p>Prototype d’information juridique — pas un avis juridique.</p>
        </div>
      </footer>
    </div>
  )
}
