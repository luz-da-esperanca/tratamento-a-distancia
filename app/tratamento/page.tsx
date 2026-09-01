import { Footer } from "@/components/shared/Footer";
import { Header } from "@/components/shared/Header";
import { TratamentoLoginCard } from "@/components/appointments/TratamentoLoginCard";

export default function TratamentoPage() {
  return (
    <main className="flex flex-col justify-between bg-background min-h-screen text-foreground">
      <Header />
      <TratamentoLoginCard />
      <Footer />
    </main>
  );
}