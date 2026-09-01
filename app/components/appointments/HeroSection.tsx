import { ArrowRight, BadgeCheck, CircleHelp, HeartHandshake, Sparkles } from "lucide-react";

export function HeroSection() {
  return (
    <section
      id="inicio"
      className="flex items-start bg-linear-to-b from-brand to-background pt-8 min-h-screen hero"
      // style={{ backgroundImage: "url(https://img.daisyui.com/images/stock/photo-1507358522600-9f71e620c44e.webp)" }}
    >
      <div className="lg:items-center gap-8 grid lg:grid-cols-[1.3fr_0.9fr] mx-auto w-full max-w-7xl hero-content">
        <div className="space-y-6">
          <span className="gap-2 bg-transparent border-background/40 text-background badge">
            <HeartHandshake size={14} />
            Tratamento e acolhimento
          </span>
          <h1 className="max-w-3xl font-bold text-white text-shadow-lg text-4xl sm:text-5xl lg:text-6xl leading-tight">
            Tratamento Espiritual à Distância
          </h1>
          <p className="max-w-2xl text-foreground/90 text-base sm:text-lg leading-7">
            O Centro Espírita Luz da Esperança oferece tratamento por meio da oração e atendimentos virtuais. Participe das transmissões e receba amparo através de Evangelhoterapia, passes e vibrações sem sair de casa.
          </p>

          <div className="flex flex-wrap gap-3">
            <a href="#inscricao" className="gap-2 bg-brand hover:bg-brand-hover border-brand hover:border-brand-hover text-background btn rounded-lg">
              Fazer inscrição
              <ArrowRight size={16} /> 
            </a>
            <a href="#faq" className="gap-2 bg-background hover:bg-brand border-brand/25 hover:border-brand text-foreground hover:text-background btn rounded-lg">
              <CircleHelp size={16} />
              Ver orientações
            </a>
          </div>

          <div className="gap-4 grid sm:grid-cols-3">
            <div className="bg-card/80 shadow-sm p-4 border border-neutral/15 rounded-2xl">
              <p className="flex items-center gap-2 text-neutral text-sm"><BadgeCheck size={16} />Modalidade</p>
              <p className="mt-2 font-semibold text-foreground text-2xl">100% Virtual</p>
            </div>
            <div className="bg-card/80 shadow-sm p-4 border border-neutral/15 rounded-2xl">
              <p className="flex items-center gap-2 text-neutral text-sm"><Sparkles size={16} />Transmissões</p>
              <p className="mt-2 font-semibold text-foreground text-2xl">Seg, Ter e Qua</p>
            </div>
            <div className="bg-card/80 shadow-sm p-4 border border-neutral/15 rounded-2xl">
              <p className="flex items-center gap-2 text-neutral text-sm"><HeartHandshake size={16} />Início</p>
              <p className="mt-2 font-semibold text-foreground text-2xl">Às 19:30</p>
            </div>
          </div>
        </div>

        <div className="bg-card/90 shadow-2xl shadow-neutral/10 lg:mt-16 border border-neutral/15 card">
          <div className="gap-5 p-6 sm:p-8 card-body">
            <div className="flex justify-between items-center gap-4">
              <div>
                <p className="text-brand text-sm uppercase tracking-[0.25em]">Resumo</p>
                <h2 className="mt-2 font-semibold text-foreground text-2xl">O que é oferecido?</h2>
              </div>
              <div className="bg-brand/10 px-3 py-1 border border-brand/25 rounded-full font-medium text-brand text-sm">
                Aberto
              </div>
            </div>

            <div className="gap-3 grid">
              <div className="bg-card p-4 border border-neutral/15 rounded-2xl">
                <p className="text-neutral text-sm">Terapias e Amparo</p>
                <p className="mt-2 text-foreground/85 text-sm leading-6">
                  Nossos atendimentos incluem Evangelhoterapia, passes, desobsessão e atendimento fraterno, promovendo equilíbrio físico e espiritual de forma remota.
                </p>
              </div>
              <div className="bg-card p-4 border border-neutral/15 rounded-2xl">
                <p className="text-neutral text-sm">Preparação no Lar</p>
                <p className="mt-2 text-foreground/85 text-sm leading-6">
                  Reserve um vasilhame com água para fluidificar, cultive uma atitude mental digna, faça a leitura do Evangelho todos os dias e dedique-se ao serviço da prece.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}