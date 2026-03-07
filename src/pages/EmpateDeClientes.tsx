import { useState } from "react";
import { DropZone } from "@/components/pntfx/drop-zone";
import { ProcessingOverlay } from "@/components/pntfx/processing-overlay";
import { ResultCard } from "@/components/pntfx/result-card";
import { NavBar } from "@/components/pntfx/navbar";
import { useFinancialStore } from "@/stores/financial-store";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Info } from "lucide-react";

type Stage = "idle" | "processing" | "done";

const MOCK_RESULTS = [
  {
    title: "BBVA",
    description: "Institución con alta liquidez y buen manejo de activos.",
    rating: "A+",
  },
  {
    title: "Santander",
    description: "Institución con sólida rentabilidad operativa.",
    rating: "B+",
  },
  {
    title: "Banorte",
    description: "Institución con estructura de deuda moderada.",
    rating: "A-",
  },
];

export default function EmpateDeClientes() {
  const [stage, setStage] = useState<Stage>("idle");
  const { master } = useFinancialStore();

  const handleFileDrop = () => {
    setStage("processing");
    setTimeout(() => setStage("done"), 3500);
  };

  return (
    <div className="min-h-screen w-full bg-page-gradient">
      <NavBar />
      <main className="w-full max-w-5xl mx-auto py-8 px-6 md:px-8">

        {/* Header */}
        <div className="mb-10 animate-fade-in-up">
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            Empate de Clientes
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Arrastra un archivo para comenzar el análisis.
          </p>
        </div>

        {/* MASTER status */}
        {master ? (
          <Alert className="mb-6 bg-emerald-500/10 border-emerald-500/30 animate-fade-in">
            <Info className="!w-4 !h-4 text-emerald-400" />
            <AlertDescription className="text-emerald-400/80 text-sm">
              Usando datos del MASTER generado para <span className="font-medium text-emerald-400">{master.empresa}</span> ({master.periodo}).
            </AlertDescription>
          </Alert>
        ) : (
          <Alert className="mb-6 bg-primary/5 border-primary/20 animate-fade-in">
            <Info className="!w-4 !h-4 text-primary" />
            <AlertDescription className="text-muted-foreground text-sm">
              No se ha generado un MASTER aún. Procesa los documentos en el <span className="font-medium text-primary">Procesador Financiero</span> primero para obtener resultados reales.
            </AlertDescription>
          </Alert>
        )}

        {/* Drop zone — hidden once done */}
        {stage !== "done" && (
          <DropZone onFileDrop={handleFileDrop} disabled={stage === "processing"} />
        )}

        {/* Processing animation */}
        {stage === "processing" && <ProcessingOverlay />}

        {/* Results */}
        {stage === "done" && (
          <div className="animate-fade-in-up">
            <p className="text-sm mb-6 text-muted-foreground">
              Análisis completado — 3 posibles instituciones encontradas.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {MOCK_RESULTS.map((r, i) => (
                <div key={r.title} className="animate-fade-in-up" style={{ animationDelay: `${i * 100}ms` }}>
                  <ResultCard {...r} />
                </div>
              ))}
            </div>
            <button
              onClick={() => setStage("idle")}
              className="mt-8 text-xs underline cursor-pointer transition-opacity hover:opacity-70 text-muted-foreground"
            >
              Analizar otro archivo
            </button>
          </div>
        )}

      </main>
    </div>
  );
}
