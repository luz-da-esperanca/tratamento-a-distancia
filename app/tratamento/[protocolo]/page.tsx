import { ProtocolInfoCard } from "@/components/appointments/ProtocolInfoCard";
import { TreatmentInstructions } from "@/components/appointments/TreatmentInstructions";
import { Footer } from "@/components/shared/Footer";
import { Header } from "@/components/shared/Header";
import { buscarAgendamentoPorProtocolo } from "@/src/features/appointments/presentation/actions/agendamentos.actions";
import { cookies } from "next/headers";
import { notFound, redirect } from "next/navigation";

type PageProps = {
  params: Promise<{ protocolo: string }>;
};

export default async function ProtocolPage({ params }: PageProps) {
  const { protocolo } = await params;

  
  const cookieStore = await cookies();
  const session = cookieStore.get("paciente_session")?.value;

  
  if (!session || session !== protocolo) {
    
    redirect("/tratamento"); 
  }
  
  const agendamento = await buscarAgendamentoPorProtocolo(protocolo);

  if (!agendamento) {
    notFound(); 
  }

  return (
    <main className="flex flex-col bg-background min-h-screen text-foreground">
      <Header />
      
      <div className="flex flex-col flex-1 items-center px-4 sm:px-6 lg:px-8 py-12">
        <div className="space-y-8 w-full max-w-5xl">
          
          <ProtocolInfoCard agendamento={agendamento} />
          
          <div className="text-neutral/40 text-sm italic uppercase tracking-[0.2em] divider">Instruções e Procedimentos</div>
          
          <TreatmentInstructions />
          
        </div>
      </div>

      <Footer />
    </main>
  );
}