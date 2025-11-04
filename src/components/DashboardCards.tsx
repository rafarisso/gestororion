import { brl } from '../lib/utils'
type Props = { today?: { in: number; out: number; net: number }; month?: { in: number; out: number; net: number }; loading?: boolean }
export default function DashboardCards({ today, month, loading }: Props) {
  return (
    <div className="grid md:grid-cols-3 gap-4">
      <Card title="Hoje (Entradas)" loading={loading}>{brl(today?.in ?? 0)}</Card>
      <Card title="Hoje (Saídas)" loading={loading}>{brl(today?.out ?? 0)}</Card>
      <Card title="Hoje (Líquido)" loading={loading}>{brl(today?.net ?? 0)}</Card>
      <Card title="Mês (Entradas)" loading={loading}>{brl(month?.in ?? 0)}</Card>
      <Card title="Mês (Saídas)" loading={loading}>{brl(month?.out ?? 0)}</Card>
      <Card title="Mês (Líquido)" loading={loading}>{brl(month?.net ?? 0)}</Card>
    </div>
  )
}
function Card({ title, children, loading }: { title: string; children: any; loading?: boolean }) {
  return (
    <div className="rounded-2xl bg-neutral-900 border border-neutral-800 p-4 shadow">
      <div className="text-sm text-neutral-400">{title}</div>
      <div className="text-2xl md:text-3xl font-semibold mt-1">
        {loading ? <span className="text-sm text-neutral-500">Carregando...</span> : children}
      </div>
    </div>
  )
}
