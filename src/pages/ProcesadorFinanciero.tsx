import { DownloadFilesButton } from "@/components/pntfx/download-files";
import { UploadCard } from "@/components/pntfx/upload-card";
import { NavBar } from "@/components/pntfx/navbar";

export default function ProcesadorFinanciero() {
  return (
    <div className="flex min-h-screen w-full flex-col bg-page-gradient">
      <NavBar />

      <main className="w-full max-w-5xl mx-auto py-8 px-6 md:px-8">
        <div className="mb-10 animate-fade-in-up">
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            Procesador Financiero
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Carga los Estados Financieros del cliente para obtener análisis profundos.
          </p>
        </div>

        <div className="flex w-full flex-col md:flex-row gap-5 mb-8">
          <div className="w-full animate-fade-in-up animation-delay-100">
            <UploadCard title="Estados de Cuenta" />
          </div>
          <div className="w-full animate-fade-in-up animation-delay-200">
            <UploadCard title="Estados de Resultados" />
          </div>
          <div className="w-full animate-fade-in-up animation-delay-300">
            <UploadCard title="Balance General" />
          </div>
        </div>

        <div className="flex justify-center animate-fade-in-up animation-delay-400">
          <DownloadFilesButton />
        </div>
      </main>
    </div>
  );
}
