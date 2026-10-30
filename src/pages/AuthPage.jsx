import { useState } from 'react'
import { ArrowLeft, Eye, EyeOff, LockKeyhole, ShieldCheck } from 'lucide-react'
import { Link } from 'react-router-dom'
import LogoMark from '../components/layout/LogoMark.jsx'

export default function AuthPage({ mode = 'login' }) {
  const isRegister = mode === 'register'
  const [passwordVisible, setPasswordVisible] = useState(false)
  const [notice, setNotice] = useState('')

  function handleSubmit(event) {
    event.preventDefault()
    const formData = new FormData(event.currentTarget)
    if (
      isRegister &&
      formData.get('password') !== formData.get('confirm-password')
    ) {
      setNotice('Les deux mots de passe ne correspondent pas.')
      return
    }

    setNotice(
      "L’authentification n’est pas encore activée. Vos informations n’ont pas été envoyées ni enregistrées.",
    )
  }

  return (
    <main className="flex min-h-screen bg-white text-slate-800">
      <section className="relative hidden w-[46%] flex-col justify-between overflow-hidden bg-navy p-10 text-white lg:flex xl:p-14">
        <div className="absolute -right-36 -top-32 size-[32rem] rounded-full border-[1px] border-white/10" aria-hidden="true" />
        <div className="absolute -right-20 -top-16 size-96 rounded-full border-[1px] border-white/10" aria-hidden="true" />
        <Link to="/" className="relative flex w-fit items-center gap-3 rounded-lg">
          <LogoMark className="size-11" />
          <span className="rounded-md bg-white px-2 py-1">
            <img src="/logo-text.png" alt="JuriPredict AI" className="h-5 w-auto" />
          </span>
        </Link>

        <div className="relative max-w-lg">
          <span className="mb-6 grid size-12 place-items-center rounded-2xl bg-white/10 text-info">
            <ShieldCheck size={25} aria-hidden="true" />
          </span>
          <h1 className="text-4xl font-semibold leading-tight tracking-tight xl:text-5xl">
            Le droit haïtien, plus simple à explorer.
          </h1>
          <p className="mt-5 max-w-md text-base leading-7 text-slate-300">
            Retrouvez vos recherches et explorez des pistes juridiques avec des
            sources consultables.
          </p>
        </div>

        <p className="relative text-xs leading-5 text-slate-400">
          Un outil d’information juridique — pas un avis juridique professionnel.
        </p>
      </section>

      <section className="flex min-h-screen flex-1 flex-col items-center justify-center px-5 py-10 sm:px-10">
        <div className="w-full max-w-md">
          <Link
            to="/"
            className="mb-10 inline-flex items-center gap-2 text-sm font-medium text-slate-500 transition hover:text-navy"
          >
            <ArrowLeft size={17} aria-hidden="true" />
            Retour à l’accueil
          </Link>

          <div className="mb-8 lg:hidden">
            <img src="/logo-text.png" alt="JuriPredict AI" className="h-7 w-auto" />
          </div>

          <p className="text-sm font-semibold text-brand">
            {isRegister ? 'Créer un compte' : 'Bon retour'}
          </p>
          <h2 className="mt-2 text-3xl font-semibold tracking-tight text-navy">
            {isRegister ? 'Rejoignez JuriPredict' : 'Connectez-vous'}
          </h2>
          <p className="mt-2 text-sm leading-6 text-slate-500">
            {isRegister
              ? 'Créez votre espace pour retrouver vos recherches.'
              : 'Accédez à votre espace de recherche juridique.'}
          </p>

          <form onSubmit={handleSubmit} className="mt-8 space-y-5">
            <div>
              <label
                htmlFor="email"
                className="mb-2 block text-sm font-medium text-slate-700"
              >
                Adresse courriel
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                placeholder="vous@exemple.com"
                className="h-12 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm outline-none transition placeholder:text-slate-400 focus:border-brand focus:ring-4 focus:ring-brand/10"
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="mb-2 block text-sm font-medium text-slate-700"
              >
                Mot de passe
              </label>
              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type={passwordVisible ? 'text' : 'password'}
                  autoComplete={isRegister ? 'new-password' : 'current-password'}
                  minLength={isRegister ? 8 : undefined}
                  required
                  placeholder={isRegister ? '8 caractères minimum' : 'Votre mot de passe'}
                  className="h-12 w-full rounded-xl border border-slate-200 bg-white px-4 pr-12 text-sm outline-none transition placeholder:text-slate-400 focus:border-brand focus:ring-4 focus:ring-brand/10"
                />
                <button
                  type="button"
                  onClick={() => setPasswordVisible((visible) => !visible)}
                  aria-label={
                    passwordVisible
                      ? 'Masquer le mot de passe'
                      : 'Afficher le mot de passe'
                  }
                  className="absolute inset-y-0 right-0 grid w-12 place-items-center rounded-r-xl text-slate-400 transition hover:text-slate-700"
                >
                  {passwordVisible ? (
                    <EyeOff size={18} aria-hidden="true" />
                  ) : (
                    <Eye size={18} aria-hidden="true" />
                  )}
                </button>
              </div>
            </div>

            {isRegister && (
              <div>
                <label
                  htmlFor="confirm-password"
                  className="mb-2 block text-sm font-medium text-slate-700"
                >
                  Confirmer le mot de passe
                </label>
                <input
                  id="confirm-password"
                  name="confirm-password"
                  type="password"
                  autoComplete="new-password"
                  minLength={8}
                  required
                  placeholder="Répétez votre mot de passe"
                  className="h-12 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm outline-none transition placeholder:text-slate-400 focus:border-brand focus:ring-4 focus:ring-brand/10"
                />
              </div>
            )}

            {!isRegister && (
              <label className="flex items-center gap-2 text-sm text-slate-600">
                <input
                  type="checkbox"
                  name="remember"
                  className="size-4 rounded border-slate-300 accent-brand"
                />
                Garder ma session ouverte
              </label>
            )}

            <button
              type="submit"
              className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-brand px-4 text-sm font-semibold text-white transition hover:bg-blue-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
            >
              <LockKeyhole size={17} aria-hidden="true" />
              {isRegister ? 'Créer mon compte' : 'Se connecter'}
            </button>

            {notice && (
              <p
                role="status"
                className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm leading-6 text-amber-900"
              >
                {notice}
              </p>
            )}
          </form>

          <p className="mt-7 text-center text-sm text-slate-500">
            {isRegister ? 'Vous avez déjà un compte ?' : 'Pas encore de compte ?'}{' '}
            <Link
              to={isRegister ? '/connexion' : '/inscription'}
              className="font-semibold text-brand hover:text-blue-700"
            >
              {isRegister ? 'Se connecter' : 'Créer un compte'}
            </Link>
          </p>

          <p className="mt-8 text-center text-xs leading-5 text-slate-400">
            En continuant, évitez de saisir des informations personnelles ou
            sensibles dans vos recherches juridiques.
          </p>
        </div>
      </section>
    </main>
  )
}
