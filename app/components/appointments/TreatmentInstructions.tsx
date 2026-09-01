import { ListChecks, Heart, AlertCircle, ShieldCheck } from "lucide-react";

export function TreatmentInstructions() {
  const commonInstructions = [
    { 
      title: "Preparação Mental e Física", 
      description: "Mantenha a mente serena desde cedo, evitando brigas e discussões. Evite também excessos alimentares, fumo e bebidas alcoólicas." 
    },
    { 
      title: "Horário e Sintonia", 
      description: "Os tratamentos ocorrem durante as transmissões às 19:30. Momentos antes, dedique-se à prece e à leitura do Evangelho no lar." 
    },
    { 
      title: "Água Fluidificada", 
      description: "Reserve um recipiente com água antes do início para ser fluidificada. Ela funciona como remédio espiritual e deve ser consumida aos poucos." 
    },
    { 
      title: "Acompanhamento Médico", 
      description: "O tratamento espiritual atua como complemento. Nunca interrompa os seus tratamentos médicos convencionais ou o uso de medicações." 
    }
  ];

  const surgeryInstructions = [
    { 
      title: "Horário de Recolhimento", 
      description: "No dia da cirurgia, deite-se em um ambiente tranquilo pelo menos 15 minutos antes do horário de início da transmissão (19:30)." 
    },
    { 
      title: "Repouso Pós-Cirurgia", 
      description: "Permaneça em repouso absoluto por no mínimo 1h30. É fortemente recomendado que você se levante somente no dia seguinte." 
    },
    { 
      title: "Retirada dos Pontos", 
      description: "Na sexta-feira da semana seguinte, você deve repetir exatamente o mesmo procedimento de repouso para a retirada dos pontos espirituais." 
    },
    { 
      title: "Gratuidade Total", 
      description: "O ensinamento é 'dai de graça o que de graça recebestes'. Ninguém está autorizado a cobrar qualquer valor em nome do Luz da Esperança." 
    }
  ];

  return (
    <div className="gap-6 grid grid-cols-1 md:grid-cols-2 mt-8 w-full">
      <div className="bg-background shadow-md border border-neutral/15 card">
        <div className="card-body">
          <h3 className="flex items-center gap-2 mb-4 text-brand card-title">
            <ListChecks size={20} />
            Funcionamento do Tratamento
          </h3>
          <ul className="space-y-4">
            {commonInstructions.map((item, index) => (
              <li key={index} className="flex gap-3 text-foreground/80 text-sm">
                <div className="mt-1">
                  <Heart size={14} className="fill-brand/20 text-brand" />
                </div>
                <div>
                  <strong className="block text-foreground">{item.title}</strong>
                  {item.description}
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="bg-background shadow-md border border-neutral/15 card">
        <div className="card-body">
          <h3 className="flex items-center gap-2 mb-4 text-brand card-title">
            <ShieldCheck size={20} />
            Procedimentos da Cirurgia
          </h3>
          <ul className="space-y-4">
            {surgeryInstructions.map((item, index) => (
              <li key={index} className="flex gap-3 text-foreground/80 text-sm">
                <div className="mt-1">
                  <AlertCircle size={14} className="text-brand" />
                </div>
                <div>
                  <strong className="block text-foreground">{item.title}</strong>
                  {item.description}
                </div>
              </li>
            ))}
          </ul>
          <div className="bg-neutral/5 mt-4 p-3 border border-neutral/10 rounded-lg">
            <p className="text-neutral text-xs italic">
              * Tente superar imprevistos (como chuva ou visitas inoportunas) com paciência para não quebrar a sintonia e a eficácia do seu tratamento.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}