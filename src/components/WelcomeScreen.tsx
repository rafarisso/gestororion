import type { ChangeEvent, FormEvent } from 'react'
import { useMemo, useState } from 'react'
import { supabase } from '../services/supabaseClient'

const roles = {
  owner: {
    id: 'owner' as const,
    name: 'Rafael',
    fullName: 'Rafael (Gestor)',
    subtitle: 'Diretor e responsável pelos resultados',
    description:
      'Visualiza saldos, acompanha as entradas e saídas diárias e aprova as negociações. Tem acesso completo ao painel.',
    highlights: ['Resumo financeiro do dia e do mês', 'Tabela completa de lançamentos', 'Configuração da equipe'],
    placeholderEmail: 'rafael@suaempresa.com',
  },
  employee: {
    id: 'employee' as const,
    name: 'Pedro Henrique Gatti',
    fullName: 'Pedro Henrique Gatti (Atendente)',
    subtitle: 'Responsável pelos lançamentos diários',
    description:
      'Registra gastos, entradas de cartão, Pix ou dinheiro e envia fotos das notas e relatórios das maquininhas.',
    highlights: ['Cadastro manual de entradas e saídas', 'Upload por foto ou arquivo', 'Acompanhamento das tarefas do dia'],
    placeholderEmail: 'pedro@suaempresa.com',
  },
}

type RoleKey = keyof typeof roles

export default function WelcomeScreen() {
  const [selectedRole, setSelectedRole] = useState<RoleKey>('owner')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const role = useMemo(() => roles[selectedRole], [selectedRole])

  function handleSelectRole(roleKey: RoleKey) {
    setSelectedRole(roleKey)
    setMessage(null)
    setError(null)
    setPassword('')
    setEmail('')
  }

  async function handleLogin(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setMessage(null)
    setError(null)
    if (!email || !password) {
      setError('Preencha e-mail e senha para entrar.')
      return
    }

    try {
      setLoading(true)
      const { error: signInError } = await supabase.auth.signInWithPassword({ email, password })
      if (signInError) throw signInError
      setMessage('Login realizado! Carregando painel...')
    } catch (err: any) {
      console.error(err)
      setError(err.message || 'Não foi possível entrar. Confira as credenciais.')
    } finally {
      setLoading(false)
    }
  }

  async function handlePasswordReset() {
    if (!email) {
      setError('Informe o e-mail para receber o link de redefinição.')
      return
    }
    try {
      setLoading(true)
      setError(null)
      setMessage(null)
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: window.location.origin,
      })
      if (resetError) throw resetError
      setMessage('Enviamos um e-mail com o link para redefinir a senha.')
    } catch (err: any) {
      console.error(err)
      setError(err.message || 'Não foi possível enviar o link de redefinição.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 px-4 py-10">
      <div className="max-w-5xl mx-auto space-y-8">
        <header className="space-y-3 text-center">
          <span className="inline-flex items-center gap-2 text-sm font-medium text-orange-400">
            <span className="w-2 h-2 rounded-full bg-orange-500" /> Gestor Órion
          </span>
          <h1 className="text-3xl md:text-4xl font-bold">Selecione seu perfil para acessar o painel</h1>
          <p className="text-neutral-400 max-w-3xl mx-auto">
            O Rafael acompanha o resultado geral como Gestor e o Pedro registra as movimentações do dia como Atendente. Escolha seu
            perfil abaixo para fazer login com as credenciais cadastradas no Supabase.
          </p>
        </header>

        <div className="grid md:grid-cols-2 gap-4">
          {(Object.keys(roles) as RoleKey[]).map((key) => {
            const info = roles[key]
            const isActive = key === selectedRole
            return (
              <button
                key={key}
                type="button"
                onClick={() => handleSelectRole(key)}
                className={`text-left rounded-2xl border px-5 py-6 transition focus:outline-none focus:ring-2 focus:ring-orange-500/60 ${
                  isActive
                    ? 'border-orange-500 bg-neutral-900 shadow-lg shadow-orange-500/10'
                    : 'border-neutral-800 bg-neutral-900/60 hover:border-neutral-700'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-xl font-semibold">{info.fullName}</h2>
                    <p className="text-sm text-neutral-400">{info.subtitle}</p>
                  </div>
                  {isActive && <span className="text-xs font-semibold text-orange-400">Selecionado</span>}
                </div>
                <p className="mt-4 text-sm text-neutral-300 leading-relaxed">{info.description}</p>
                <ul className="mt-4 space-y-2 text-sm text-neutral-400">
                  {info.highlights.map((highlight) => (
                    <li key={highlight} className="flex items-start gap-2">
                      <span className="mt-1 h-1.5 w-1.5 rounded-full bg-orange-500" />
                      <span>{highlight}</span>
                    </li>
                  ))}
                </ul>
              </button>
            )
          })}
        </div>

        <form
          onSubmit={handleLogin}
          className="rounded-2xl bg-neutral-900 border border-neutral-800 p-6 space-y-5 max-w-3xl mx-auto"
        >
          <div className="space-y-1">
            <span className="text-xs uppercase tracking-wide text-neutral-500">Entrar como</span>
            <h3 className="text-lg font-semibold text-neutral-100">{role.fullName}</h3>
          </div>

          <label className="flex flex-col gap-2 text-sm">
            <span className="text-neutral-300">E-mail</span>
            <input
              type="email"
              value={email}
              onChange={(event: ChangeEvent<HTMLInputElement>) => setEmail(event.target.value)}
              placeholder={role.placeholderEmail}
              className="rounded-xl bg-neutral-800 border border-neutral-700 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500/60"
              required
            />
          </label>

          <label className="flex flex-col gap-2 text-sm">
            <span className="text-neutral-300">Senha</span>
            <input
              type="password"
              value={password}
              onChange={(event: ChangeEvent<HTMLInputElement>) => setPassword(event.target.value)}
              placeholder="Sua senha cadastrada no Supabase"
              className="rounded-xl bg-neutral-800 border border-neutral-700 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500/60"
              required
            />
          </label>

          <div className="flex flex-col gap-3 text-sm">
            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-orange-500 px-4 py-2 font-medium text-white transition hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? 'Entrando...' : 'Entrar no painel'}
            </button>
            <button
              type="button"
              onClick={handlePasswordReset}
              className="text-left text-xs text-neutral-400 underline-offset-2 hover:text-neutral-200 hover:underline"
            >
              Esqueci a senha / redefinir acesso
            </button>
            {message && <span className="text-sm text-emerald-400">{message}</span>}
            {error && <span className="text-sm text-red-400">{error}</span>}
          </div>
        </form>

        <footer className="text-center text-xs text-neutral-500">
          Precisa cadastrar novos usuários? Acesse o Supabase com a service key e inclua na tabela <code>user_profiles</code> a
          pessoa com o papel correto.
        </footer>
      </div>
    </div>
  )
}
