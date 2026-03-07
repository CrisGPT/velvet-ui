import { KpiCard } from "@/components/pntfx/kpi-card";
import { RevenueChart } from "@/components/pntfx/charts/revenue-chart";
import { ExpensesChart } from "@/components/pntfx/charts/expenses-chart";
import { CashFlowChart } from "@/components/pntfx/charts/cash-flow-chart";
import { BalanceChart } from "@/components/pntfx/charts/balance-chart";
import { TrendingUp, TrendingDown, DollarSign, BarChart3, Info } from "lucide-react";
import { NavBar } from "@/components/pntfx/navbar";
import { useFinancialStore } from "@/stores/financial-store";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function PredictorKPI() {
  const { master } = useFinancialStore();

  const ingresos = master ? `$${(master.ventas).toLocaleString()}` : "$293,500";
  const gastos = master ? `$${(master.costoDeVentas + master.gastosOperativos).toLocaleString()}` : "$184,700";
  const utilidad = master ? `$${(master.utilidadNeta).toLocaleString()}` : "$108,800";
  const flujo = master ? `$${(master.saldoFinal - master.saldoInicial).toLocaleString()}` : "$108,800";
  const margen = master ? `Margen del ${Math.round(master.margenNeto * 100)}%` : "Margen del 37%";

  return (
    <div className="min-h-screen w-full bg-page-gradient">
      <NavBar />

      <main className="w-full max-w-7xl mx-auto py-8 px-6 md:px-8">

        {/* Header */}
        <div className="mb-6 animate-fade-in-up">
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            Predictor de KPI&apos;s
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Resumen de indicadores clave de desempeño
          </p>
        </div>

        {/* MASTER status */}
        {master ? (
          <Alert className="mb-6 bg-emerald-500/10 border-emerald-500/30 animate-fade-in">
            <Info className="!w-4 !h-4 text-emerald-400" />
            <AlertDescription className="text-emerald-400/80 text-sm">
              Datos reales del MASTER: <span className="font-medium text-emerald-400">{master.empresa}</span> ({master.periodo}).
            </AlertDescription>
          </Alert>
        ) : (
          <Alert className="mb-6 bg-primary/5 border-primary/20 animate-fade-in">
            <Info className="!w-4 !h-4 text-primary" />
            <AlertDescription className="text-muted-foreground text-sm">
              Mostrando datos de demostración. Genera un MASTER en el Procesador Financiero para ver datos reales.
            </AlertDescription>
          </Alert>
        )}

        {/* KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="animate-fade-in-up animation-delay-100">
            <KpiCard title="Ingresos Totales" value={ingresos} description="+12% vs año anterior" icon={<DollarSign size={18} className="text-primary" />} />
          </div>
          <div className="animate-fade-in-up animation-delay-200">
            <KpiCard title="Gastos Totales" value={gastos} description="+4% vs año anterior" icon={<TrendingDown size={18} className="text-primary" />} />
          </div>
          <div className="animate-fade-in-up animation-delay-300">
            <KpiCard title="Utilidad Neta" value={utilidad} description={margen} icon={<TrendingUp size={18} className="text-primary" />} />
          </div>
          <div className="animate-fade-in-up animation-delay-400">
            <KpiCard title="Flujo de Caja" value={flujo} description="Acumulado" icon={<BarChart3 size={18} className="text-primary" />} />
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
