import { brl } from '../lib/utils'
type Props = { today?: { in: number; out: number; net: number }; month?: { in: number; out: number; net: number } }
export default function DashboardCards({ today, month }: Props) {
  return (
    <div className="grid md:grid-cols-3 gap-4">
      <Card title="Hoje (Entradas)">{brl(today?.in ?? 0)}</Card>
      <Card title="Hoje (Saídas)">{brl(today?.out ?? 0)}</Card>
      <Card title="Hoje (Líquido)">{brl(today?.net ?? 0)}</Card>
      <Card title="Mês (Entradas)">{brl(month?.in ?? 0)}</Card>
      <Card title="Mês (Saídas)">{brl(month?.out ?? 0)}</Card>
      <Card title="Mês (Líquido)">{brl(month?.net ?? 0)}</Card>
    </div>
  )
}
function Card({ title, children }: { title: string; children: any }) {
  return (
    <div className="rounded-2xl bg-neutral-900 border border-neutral-800 p-4 shadow">
      <div className="text-sm text-neutral-400">{title}</div>
      <div className="text-2xl md:text-3xl font-semibold mt-1">{children}</div>
    </div>
  )
}
