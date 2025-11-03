export function cn(...classes: Array<string | false | undefined>) {
  return classes.filter(Boolean).join(' ')
}
export function brl(n: number) {
  return n.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}
