import { useEffect, useMemo, useState } from 'react'
import DashboardCards from '../components/DashboardCards'
import UploadCard from '../components/UploadCard'
import TransactionsTable from '../components/TransactionsTable'
import ManualEntryForm from '../components/ManualEntryForm'
import { useProfile } from '../hooks/useProfile'
import { listDailySummary } from '../services/api'

type Summary = {
  today?: { in: number; out: number; net: number }
  month?: { in: number; out: number; net: number }
}

export default function Dashboard() {
  const { profile, loading, error } = useProfile()
  const [summary, setSummary] = useState<Summary>({})
  const [summaryLoading, setSummaryLoading] = useState(false)

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

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-8 space-y-6">
      <h1 className="text-3xl md:text-4xl font-bold">Gestor Órion</h1>
      <p className="text-neutral-400">Controle diário de entradas, saídas e leitura automática de notas/maquininhas.</p>

      {loading && <div className="text-neutral-400">Carregando perfil...</div>}
      {error && <div className="text-red-400">{error}</div>}
      {!loading && !profile && !error && (
        <div className="text-red-400">Nenhum usuário autenticado. Entre na conta para acessar o painel.</div>
      )}

      {profile && profile.role === 'owner' && (
        <DashboardCards today={summary.today} month={summary.month} loading={summaryLoading} />
      )}

      {profile && <ManualEntryForm profile={profile} />}

      <div className="grid md:grid-cols-2 gap-4">
        <UploadCard bucket="invoices" title="Upload de Nota Fiscal (PDF/IMG/XML)" />
        <UploadCard bucket="pos_reports" title="Upload de Relatório de Maquininha (PDF/IMG/CSV)" />
      </div>

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
