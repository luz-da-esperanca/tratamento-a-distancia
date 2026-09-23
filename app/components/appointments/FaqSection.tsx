const faqItems = [
  {
    question: "O que é oferecido no Tratamento a Distância?",
    answer: "O tratamento oferece amparo espiritual por meio de lives e atendimentos virtuais. As práticas incluem Evangelhoterapia, Passe, Desobsessão, Água Fluidificada e o incentivo ao Culto no Lar.",
  },
  {
    question: "Quais são os dias e horários das transmissões?",
    answer: "As lives começam sempre às 19:30. A programação é: Segunda-feira (Evangelho e Atendimento Fraterno); Terça-feira (Palestras Públicas); e Quarta-feira (Tratamento Espiritual, Evangelhoterapia e Vibração).",
  },
  {
    question: "Como devo me preparar no dia do tratamento?",
    answer: "Cultive uma atitude mental digna e serena desde cedo. Evite deliberadamente brigas e discussões. Evite também alimentações excessivas, bebidas alcoólicas e diminua o uso de fumo e carne. Horas antes do início (19:30), dedique-se à oração e leitura do Evangelho em seu lar.",
  },
  {
    question: "Como funciona a fluidificação da água?",
    answer: "Você deve reservar um vasilhame (ou garrafa) com água antes do início do tratamento para que seja fluidificada pela espiritualidade. Esta água funcionará como um medicamento espiritual e deve ser consumida aos poucos durante toda a semana.",
  },
  {
    question: "Quais são as orientações para a Cirurgia Espiritual?",
    answer: "Para a cirurgia, deite-se pelo menos 15 minutos antes do horário (19:30). Permaneça deitado por pelo menos 1h30 (se possível, levante-se somente no dia seguinte). Passe a semana inteira vibrando positivamente e mantendo a oração firme.",
  },
  {
    question: "O que devo fazer na semana seguinte à cirurgia?",
    answer: "Na sexta-feira da semana seguinte, você deve repetir exatamente o mesmo procedimento (deitar-se no mesmo horário e fazer suas preces) para que a espiritualidade realize a retirada dos pontos da cirurgia.",
  },
  {
    question: "O tratamento espiritual substitui a medicina convencional?",
    answer: "Não. É importante ressaltar que o tratamento espiritual não substitui os tratamentos médicos convencionais, mas age como um complemento. É estritamente recomendado que você não deixe de seguir as orientações e medicações do seu médico.",
  },
  {
    question: "O tratamento ou a cirurgia possuem algum custo?",
    answer: "Não, todo o tratamento espiritual e a cirurgia são 100% gratuitos, seguindo o ensinamento 'dai de graça o que de graça recebestes'. Ninguém está autorizado a pedir nenhum tipo de contribuição financeira em nome do Luz da Esperança.",
  },
  {
    question: "O que fazer se houver imprevistos no dia?",
    answer: "Busque superar os impedimentos naturais, como chuvas, visitas inesperadas ou problemas cotidianos, mantendo a paciência e a serenidade para não interromper a continuidade e a eficácia do seu tratamento.",
  },
];

export function FaqSection() {
  return (
    <section id="faq" className="relative flex items-center px-4 sm:px-6 lg:px-8 py-16 min-h-screen scroll-mt-44 sm:scroll-mt-24">
      {/* O gradiente agora consome a variável de background do seu :root para garantir consistência */}
      <div className="-z-10 absolute inset-0 bg-[linear-gradient(180deg,var(--background)_0%,#F7F4EE_100%)]" />

      <div className="lg:items-start gap-8 grid lg:grid-cols-[0.9fr_1.1fr] mx-auto w-full max-w-7xl">
        <div className="space-y-6">
          <p className="text-brand text-sm uppercase tracking-[0.28em]">Orientações</p>
          <h2 className="font-semibold text-foreground text-3xl sm:text-4xl">Dúvidas e preparações para o tratamento.</h2>
          <p className="max-w-xl text-foreground/80 text-base leading-7">
            Abaixo você encontra as diretrizes de preparação no lar, os horários de recolhimento e as respostas para as dúvidas mais comuns sobre os atendimentos e cirurgias a distância.
          </p>

          <div className="bg-card/90 shadow-lg shadow-neutral/10 p-6 border border-neutral/15 rounded-3xl">
            <p className="text-neutral text-sm uppercase tracking-[0.22em]">Aviso importante</p>
            <p className="mt-3 text-foreground/85 text-sm leading-6">
              A dádiva do auxílio espiritual é totalmente gratuita. Nenhuma pessoa está autorizada a cobrar qualquer valor financeiro em nome da instituição para a realização de passes ou cirurgias.
            </p>
          </div>
        </div>

        <div className="space-y-4">
          {faqItems.map((item, index) => (
            <details
              key={item.question}
              className="collapse collapse-arrow bg-card/95 shadow-lg shadow-neutral/10 border border-neutral/15 rounded-3xl"
              open={index === 0}
            >
              <summary className="collapse-title font-semibold text-foreground text-lg">
                {item.question}
              </summary>
              <div className="collapse-content text-foreground/80 text-sm leading-7">
                <p>{item.answer}</p>
              </div>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}