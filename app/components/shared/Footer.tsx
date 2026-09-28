import { Heart, Mail, MapPin, Phone } from "lucide-react";

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-background/95 px-4 sm:px-6 lg:px-8 py-10 border-neutral/15 border-t">
      <div className="flex lg:flex-row flex-col lg:justify-between lg:items-center gap-8 mx-auto w-full max-w-7xl">
        
        {/* Coluna Institucional */}
        <div className="space-y-3">
          <p className="flex items-center gap-2 text-brand text-sm uppercase tracking-[0.28em]">
            <Heart size={14} />
            Luz da Esperança
          </p>
          <p className="max-w-xl text-foreground/70 text-xs leading-6">
            Casa de caridade dedicada ao atendimento fraterno e aos tratamentos espirituais. 
            Auxiliando no reequilíbrio da alma com fé, amor e esperança. <br />
            © {currentYear} Luz da Esperança. Todos os direitos reservados.
          </p>
        </div>

        {/* Coluna de Contato */}
        <div className="gap-3 grid sm:grid-cols-2 text-foreground/80 text-sm lg:text-right">
          <p className="flex lg:justify-end items-center gap-2">
            <MapPin size={16} className="text-brand" />
            Parnaíba, Piauí, Brasil
          </p>
          <p className="flex lg:justify-end items-center gap-2">
            <Phone size={16} className="text-brand" />
            (86) 9516-5179
          </p>
          <p className="flex lg:justify-end items-center gap-2 sm:col-span-2">
            <Mail size={16} className="text-brand" />
            diretoria@luzdaesperanca.org
          </p>
        </div>
      </div>
    </footer>
  );
}