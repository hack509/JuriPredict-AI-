import { useState } from 'react'
import {
  ArrowUpRight,
  BookOpen,
  BookOpenCheck,
  ExternalLink,
  Menu,
  Scale,
  ShieldCheck,
  X,
} from 'lucide-react'
import { NavLink, Outlet } from 'react-router-dom'
import { legalResources } from '../../data/legalResources.js'
import LogoMark from './LogoMark.jsx'

const links = [
  { to: '/', label: 'Accueil' },
  { to: '/assistant', label: 'Assistant IA' },
  { to: '/base-juridique', label: 'Base juridique' },
  { to: '/ressources', label: 'Ressources' },
  { to: '/connexion', label: 'Connexion' },
]
const currentYear = new Date().getFullYear()

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
            <LogoMark />
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
        <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-14">
          <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-[1.3fr_0.8fr_1.2fr] lg:gap-16">
            <div>
              <NavLink
                to="/"
                className="inline-flex items-center gap-3 rounded-xl"
              >
                <LogoMark className="size-10 bg-slate-50" />
                <span className="rounded bg-white px-1.5 py-1">
                  <img
                    src="/logo-text.png"
                    alt="JuriPredict AI"
                    className="h-5 w-auto"
                  />
                </span>
              </NavLink>
              <p className="mt-4 max-w-sm text-sm leading-6 text-slate-500">
                Un point de départ pour explorer le droit haïtien, comprendre
                les textes et retrouver des sources à consulter.
              </p>
              <p className="mt-5 inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-medium text-emerald-800">
                <ShieldCheck size={15} aria-hidden="true" />
                Informer, avec prudence
              </p>
            </div>

            <nav aria-label="Liens utiles">
              <h2 className="text-sm font-semibold text-navy">Explorer</h2>
              <ul className="mt-4 space-y-3">
                {[
                  { to: '/assistant', label: 'Assistant juridique', icon: Scale },
                  { to: '/base-juridique', label: 'Base juridique', icon: BookOpen },
                  { to: '/ressources', label: 'Toutes les ressources', icon: BookOpenCheck },
                ].map(({ to, label, icon: Icon }) => (
                  <li key={to}>
                    <NavLink
                      to={to}
                      className="inline-flex items-center gap-2 text-sm text-slate-500 transition hover:text-brand"
                    >
                      <Icon size={16} aria-hidden="true" />
                      {label}
                    </NavLink>
                  </li>
                ))}
              </ul>
            </nav>

            <nav aria-label="Sources juridiques externes">
              <h2 className="text-sm font-semibold text-navy">
                Droit national
              </h2>
              <ul className="mt-4 space-y-3">
                {legalResources
                  .filter(({ scope }) => scope === 'national')
                  .slice(0, 3)
                  .map((resource) => (
                    <li key={resource.name}>
                      <a
                        href={resource.url}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-2 text-sm text-slate-500 transition hover:text-brand"
                      >
                        {resource.name}
                        <ArrowUpRight size={14} aria-hidden="true" />
                      </a>
                    </li>
                  ))}
                <li className="pt-1">
                  <NavLink
                    to="/ressources"
                    className="inline-flex items-center gap-2 text-sm font-semibold text-brand hover:text-blue-700"
                  >
                    Toutes les sources nationales
                    <ExternalLink size={14} aria-hidden="true" />
                  </NavLink>
                </li>
              </ul>
            </nav>

            <nav aria-label="Sources juridiques internationales">
              <h2 className="text-sm font-semibold text-navy">
                Droit international
              </h2>
              <ul className="mt-4 space-y-3">
                {legalResources
                  .filter(({ scope }) => scope === 'international')
                  .slice(0, 3)
                  .map((resource) => (
                    <li key={resource.name}>
                      <a
                        href={resource.url}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-2 text-sm text-slate-500 transition hover:text-brand"
                      >
                        {resource.name}
                        <ArrowUpRight size={14} aria-hidden="true" />
                      </a>
                    </li>
                  ))}
                <li className="pt-1">
                  <NavLink
                    to="/ressources"
                    className="inline-flex items-center gap-2 text-sm font-semibold text-brand hover:text-blue-700"
                  >
                    Toutes les sources internationales
                    <ExternalLink size={14} aria-hidden="true" />
                  </NavLink>
                </li>
              </ul>
            </nav>
          </div>

          <div className="mt-10 flex flex-col gap-3 border-t border-slate-200 pt-5 text-xs leading-5 text-slate-500 sm:flex-row sm:items-center sm:justify-between">
            <p>
              © {currentYear} JuriPredict AI · Droit haïtien,
              sources consultables.
            </p>
            <p>
              Outil d’information — ne remplace pas l’avis d’un professionnel
              du droit.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
