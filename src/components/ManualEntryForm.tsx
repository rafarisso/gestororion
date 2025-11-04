import { FormEvent, useEffect, useMemo, useState } from 'react'
import { addTransaction, Kind } from '../services/api'
import { supabase } from '../services/supabaseClient'
import { UserProfile } from '../services/profile'

const paymentMethods = ['Dinheiro', 'Cartão de Crédito', 'Cartão de Débito', 'Pix', 'Transferência', 'Outros']

type Category = {
  id: number
  name: string
  kind: Kind
}

type Props = {
  profile: UserProfile
}

export default function ManualEntryForm({ profile }: Props) {
  const [date, setDate] = useState<string>(() => new Date().toISOString().slice(0, 10))
  const [kind, setKind] = useState<Kind>('income')
  const [amount, setAmount] = useState('')
  const [description, setDescription] = useState('')
  const [paymentMethod, setPaymentMethod] = useState('')
  const [categoryId, setCategoryId] = useState<number | null>(null)
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let active = true
    ;(async () => {
      const { data, error } = await supabase
        .from('categories')
        .select('id, name, kind')
        .eq('organization_id', profile.organization_id)
        .order('name', { ascending: true })
      if (!active) return
      if (error) {
        console.error(error)
        setError('Não foi possível carregar as categorias.')
        return
      }
      setCategories(data ?? [])
    })()
    return () => {
      active = false
    }
  }, [profile.organization_id])

  const filteredCategories = useMemo(
    () => categories.filter((c: Category) => c.kind === kind),
    [categories, kind],
  )

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setMessage(null)
    setError(null)
    const numericAmount = Number(amount.replace(',', '.'))
    if (!numericAmount || Number.isNaN(numericAmount)) {
      setError('Informe um valor válido.')
      return
    }
    try {
      setLoading(true)
      await addTransaction({
        occurred_at: date,
        kind,
        amount: numericAmount,
        description: description.trim() || undefined,
        payment_method: paymentMethod || undefined,
        category_id: categoryId ?? undefined,
      })
      setMessage('Lançamento registrado com sucesso!')
      setAmount('')
      setDescription('')
      setPaymentMethod('')
      setCategoryId(null)
    } catch (err: any) {
      console.error(err)
      setError(err.message || 'Não foi possível salvar o lançamento.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="rounded-2xl bg-neutral-900 border border-neutral-800 p-4 space-y-4">
      <div>
        <h2 className="text-lg font-semibold">Registrar manualmente</h2>
        <p className="text-sm text-neutral-400">
          Use este formulário para lançar entradas (Cartão, Pix, Dinheiro) e saídas (Mercado, fornecedores, aluguel, etc.).
        </p>
      </div>
      <form className="grid md:grid-cols-2 gap-4" onSubmit={handleSubmit}>
        <label className="flex flex-col gap-1 text-sm">
          <span className="text-neutral-300">Data</span>
          <input
            type="date"
            value={date}
            onChange={(event: any) => setDate(event.target.value)}
            className="rounded-xl bg-neutral-800 border border-neutral-700 px-3 py-2"
            required
          />
        </label>
        <label className="flex flex-col gap-1 text-sm">
          <span className="text-neutral-300">Tipo</span>
          <select
            value={kind}
            onChange={(event: any) => setKind(event.target.value as Kind)}
            className="rounded-xl bg-neutral-800 border border-neutral-700 px-3 py-2"
          >
            <option value="income">Entrada</option>
            <option value="expense">Saída</option>
          </select>
        </label>
        <label className="flex flex-col gap-1 text-sm">
          <span className="text-neutral-300">Valor</span>
          <input
            type="number"
            min="0"
            step="0.01"
            placeholder="0,00"
            value={amount}
            onChange={(event: any) => setAmount(event.target.value)}
            className="rounded-xl bg-neutral-800 border border-neutral-700 px-3 py-2"
            required
          />
        </label>
        <label className="flex flex-col gap-1 text-sm">
          <span className="text-neutral-300">Forma de pagamento</span>
          <select
            value={paymentMethod}
            onChange={(event: any) => setPaymentMethod(event.target.value)}
            className="rounded-xl bg-neutral-800 border border-neutral-700 px-3 py-2"
          >
            <option value="">Selecione</option>
            {paymentMethods.map((method) => (
              <option key={method} value={method}>
                {method}
              </option>
            ))}
          </select>
        </label>
        <label className="flex flex-col gap-1 text-sm md:col-span-2">
          <span className="text-neutral-300">Categoria</span>
          <select
            value={categoryId ?? ''}
            onChange={(event: any) =>
              setCategoryId(event.target.value ? Number(event.target.value) : null)
            }
            className="rounded-xl bg-neutral-800 border border-neutral-700 px-3 py-2"
          >
            <option value="">Selecione</option>
            {filteredCategories.map((category: Category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
        </label>
        <label className="flex flex-col gap-1 text-sm md:col-span-2">
          <span className="text-neutral-300">Descrição</span>
          <textarea
            value={description}
            onChange={(event: any) => setDescription(event.target.value)}
            rows={3}
            placeholder="Ex: Mercado do dia, aluguel, relatório da maquininha, negociação, etc."
            className="rounded-xl bg-neutral-800 border border-neutral-700 px-3 py-2"
          />
        </label>
        <div className="md:col-span-2 flex flex-col gap-2">
          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 rounded-xl bg-orange-500 hover:bg-orange-600 disabled:opacity-60 disabled:cursor-not-allowed text-white font-medium"
          >
            {loading ? 'Salvando...' : 'Salvar lançamento'}
          </button>
          {message && <span className="text-sm text-emerald-400">{message}</span>}
          {error && <span className="text-sm text-red-400">{error}</span>}
        </div>
      </form>
    </div>
  )
}
