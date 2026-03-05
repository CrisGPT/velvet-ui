import { KpiCard } from "@/components/pntfx/kpi-card";
import { RevenueChart } from "@/components/pntfx/charts/revenue-chart";
import { ExpensesChart } from "@/components/pntfx/charts/expenses-chart";
import { CashFlowChart } from "@/components/pntfx/charts/cash-flow-chart";
import { BalanceChart } from "@/components/pntfx/charts/balance-chart";
import { TrendingUp, TrendingDown, DollarSign, BarChart3 } from "lucide-react";
import { NavBar } from "@/components/pntfx/navbar";

export default function PredictorKPI() {
  return (
    <div className="min-h-screen w-full bg-page-gradient">
      <NavBar />

      <main className="w-full max-w-7xl mx-auto py-8 px-6 md:px-8">

        {/* Header */}
        <div className="mb-10 animate-fade-in-up">
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            Predictor de KPI&apos;s
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Resumen de indicadores clave de desempeño
          </p>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="animate-fade-in-up animation-delay-100">
            <KpiCard title="Ingresos Totales" value="$293,500" description="+12% vs año anterior" icon={<DollarSign size={18} className="text-primary" />} />
          </div>
          <div className="animate-fade-in-up animation-delay-200">
            <KpiCard title="Gastos Totales" value="$184,700" description="+4% vs año anterior" icon={<TrendingDown size={18} className="text-primary" />} />
          </div>
          <div className="animate-fade-in-up animation-delay-300">
            <KpiCard title="Utilidad Neta" value="$108,800" description="Margen del 37%" icon={<TrendingUp size={18} className="text-primary" />} />
          </div>
          <div className="animate-fade-in-up animation-delay-400">
            <KpiCard title="Flujo de Caja" value="$108,800" description="Acumulado Jun 2024" icon={<BarChart3 size={18} className="text-primary" />} />
          </div>
        </div>

        {/* Charts — row 1 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div className="animate-fade-in-up animation-delay-200">
            <RevenueChart />
          </div>
          <div className="animate-fade-in-up animation-delay-300">
            <ExpensesChart />
          </div>
        </div>

        {/* Charts — row 2 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="animate-fade-in-up animation-delay-400">
            <CashFlowChart />
          </div>
          <div className="animate-fade-in-up animation-delay-500">
            <BalanceChart />
          </div>
        </div>

      </main>
    </div>
  );
}
