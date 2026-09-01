import { Header } from "@/components/shared/Header";
import { HeroSection } from "@/components/appointments/HeroSection";
import { RegistrationSection } from "@/components/appointments/RegistrationSection";
import { FaqSection } from "@/components/appointments/FaqSection";
import { Footer } from "@/components/shared/Footer";
import ScrollToTopButton from "@/components/shared/ScrollToTopButton";

export default function Home() {
  return (
    <main className="bg-background min-h-screen text-foreground">
      <Header />
      <HeroSection />
      <RegistrationSection />
      <FaqSection />
      <Footer />

      <ScrollToTopButton />
    </main>
  );
}