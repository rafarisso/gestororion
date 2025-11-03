import DashboardCards from '../components/DashboardCards'
import UploadCard from '../components/UploadCard'
import TransactionsTable from '../components/TransactionsTable'
export default function Dashboard() {
  return (
    <div className="max-w-6xl mx-auto p-4 md:p-8 space-y-6">
      <h1 className="text-3xl md:text-4xl font-bold">Gestor Órion</h1>
      <p className="text-neutral-400">Controle diário de entradas, saídas e leitura automática de notas/maquininhas.</p>
      <DashboardCards />
      <div className="grid md:grid-cols-2 gap-4">
        <UploadCard bucket="invoices" title="Upload de Nota Fiscal (PDF/IMG/XML)" />
        <UploadCard bucket="pos_reports" title="Upload de Relatório de Maquininha (PDF/IMG/CSV)" />
      </div>
      <TransactionsTable />
    </div>
  )
}
