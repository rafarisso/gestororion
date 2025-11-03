import { useEffect, useMemo, useState } from 'react'
import type { Session } from '@supabase/supabase-js'
import DashboardCards from '../components/DashboardCards'
import UploadCard from '../components/UploadCard'
import TransactionsTable from '../components/TransactionsTable'
import ManualEntryForm from '../components/ManualEntryForm'
import { useProfile } from '../hooks/useProfile'
import { listDailySummary } from '../services/api'
import { supabase } from '../services/supabaseClient'

type Summary = {
  today?: { in: number; out: number; net: number }
  month?: { in: number; out: number; net: number }
}

type Props = {
  session: Session
}

export default function Dashboard({ session }: Props) {
  const { profile, loading, error } = useProfile()
  const [summary, setSummary] = useState<Summary>({})
  const [summaryLoading, setSummaryLoading] = useState(false)
  const [signingOut, setSigningOut] = useState(false)

  const today = useMemo(() => new Date(), [])
  const todayISO = today.toISOString().slice(0, 10)
  const monthStart = useMemo(() => {
    const d = new Date(today)
    d.setDate(1)
    return d.toISOString().slice(0, 10)
  }, [today])
  const monthEnd = useMemo(() => {
    const d = new Date(today)
    d.setMonth(d.getMonth() + 1)
    d.setDate(0)
    return d.toISOString().slice(0, 10)
  }, [today])

  useEffect(() => {
    if (!profile || profile.role !== 'owner') return
    let active = true
    ;(async () => {
      setSummaryLoading(true)
      try {
        const rows = await listDailySummary(monthStart, monthEnd)
        if (!active) return
        const todayRow = rows.find((row: any) => row.day === todayISO)
        const monthTotals = rows.reduce(
          (acc: { in: number; out: number; net: number }, row: any) => ({
            in: acc.in + Number(row.total_incomes ?? 0),
            out: acc.out + Number(row.total_expenses ?? 0),
            net: acc.net + Number(row.net_result ?? 0),
          }),
          { in: 0, out: 0, net: 0 },
        )
        setSummary({
          today: todayRow
            ? {
                in: Number(todayRow.total_incomes ?? 0),
                out: Number(todayRow.total_expenses ?? 0),
                net: Number(todayRow.net_result ?? 0),
              }
            : undefined,
          month: monthTotals,
        })
      } catch (err) {
        console.error(err)
      } finally {
        if (active) setSummaryLoading(false)
      }
    })()
    return () => {
      active = false
    }
  }, [profile, monthStart, monthEnd, todayISO])

  const displayName = (session.user.user_metadata as any)?.full_name || session.user.email || 'Usuário'
  const roleLabel = profile?.role === 'owner' ? 'Gestor' : profile?.role === 'employee' ? 'Atendente' : 'Perfil pendente'

  async function handleSignOut() {
    try {
      setSigningOut(true)
      await supabase.auth.signOut()
    } catch (err) {
      console.error(err)
    } finally {
      setSigningOut(false)
    }
  }

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-8 space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold">Gestor Órion</h1>
          <p className="text-neutral-400">Controle diário de entradas, saídas e leitura automática de notas/maquininhas.</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right text-sm text-neutral-400">
            <div className="text-neutral-200 font-semibold">{displayName}</div>
            <div>{roleLabel}</div>
          </div>
          <button
            onClick={handleSignOut}
            disabled={signingOut}
            className="rounded-xl border border-neutral-700 px-3 py-2 text-sm font-medium text-neutral-200 hover:bg-neutral-800 transition disabled:cursor-not-allowed disabled:opacity-60"
          >
            {signingOut ? 'Saindo...' : 'Sair'}
          </button>
        </div>
      </div>

      {loading && <div className="text-neutral-400">Carregando perfil...</div>}
      {error && <div className="text-red-400">{error}</div>}
      {!loading && !profile && !error && (
        <div className="rounded-2xl border border-amber-500/40 bg-amber-500/10 p-4 text-amber-200">
          Encontramos sua conta ({session.user.email}), mas o perfil ainda não está vinculado a uma organização. Peça para o
          gestor concluir o cadastro na tabela <code>user_profiles</code> do Supabase para liberar o acesso.
        </div>
      )}

      {profile && profile.role === 'owner' && (
        <DashboardCards today={summary.today} month={summary.month} loading={summaryLoading} />
      )}

      {profile && <ManualEntryForm profile={profile} />}

      {profile && (
        <div className="grid md:grid-cols-2 gap-4">
          <UploadCard bucket="invoices" title="Upload de Nota Fiscal (PDF/IMG/XML)" />
          <UploadCard bucket="pos_reports" title="Upload de Relatório de Maquininha (PDF/IMG/CSV)" />
        </div>
      )}

      {profile?.role === 'owner' ? (
        <TransactionsTable />
      ) : (
        profile && (
          <div className="rounded-2xl bg-neutral-900 border border-neutral-800 p-4 text-sm text-neutral-300">
            O acesso aos saldos e históricos completos é restrito ao proprietário da conta. Os lançamentos enviados por você
            ficam disponíveis para conferência do administrador.
          </div>
        )
      )}
    </div>
  )
}
