import { useEffect, useState } from 'react'
import { listTransactions } from '../services/api'
import { brl } from '../lib/utils'
export default function TransactionsTable() {
  const [rows, setRows] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  useEffect(() => { (async ()=>{ setLoading(true); try { setRows(await listTransactions({ limit: 200 })) } finally { setLoading(false) } })() }, [])
  return (
    <div className="rounded-2xl bg-neutral-900 border border-neutral-800 overflow-hidden">
      <div className="px-4 py-3 border-b border-neutral-800 font-semibold">Lançamentos recentes</div>
      <table className="w-full text-sm">
        <thead className="bg-neutral-900/60">
          <tr className="text-left">
            <th className="px-4 py-2">Data</th>
            <th className="px-4 py-2">Tipo</th>
            <th className="px-4 py-2">Descrição</th>
            <th className="px-4 py-2">Método</th>
            <th className="px-4 py-2 text-right">Valor</th>
          </tr>
        </thead>
        <tbody>
          {loading ? <tr><td className="px-4 py-6" colSpan={5}>Carregando...</td></tr> :
           rows.length === 0 ? <tr><td className="px-4 py-6" colSpan={5}>Sem lançamentos.</td></tr> :
           rows.map((r: any) => (
            <tr key={r.id} className="border-t border-neutral-800">
              <td className="px-4 py-2">{r.occurred_at}</td>
              <td className="px-4 py-2">{r.kind === 'income' ? 'Entrada' : 'Saída'}</td>
              <td className="px-4 py-2">{r.description ?? '-'}</td>
              <td className="px-4 py-2">{r.payment_method ?? '-'}</td>
              <td className="px-4 py-2 text-right">{brl(r.amount)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
