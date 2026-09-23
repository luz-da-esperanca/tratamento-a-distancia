"use client"; // Necessário para usar hooks

import { SubmitButton } from "@/components/shared/SubmitButton";
import { validarAcessoPaciente } from "@/src/features/appointments/presentation/actions/agendamentos.actions";
import { formatDateMask, toISODate } from "@/src/shared/utils/mask";
import { AlertCircle, CalendarDays, Hash, LockKeyhole } from "lucide-react";
import { useActionState, useState, type ChangeEvent } from "react";

export function TratamentoLoginCard() {
  // Inicializamos o hook passando a Action e o estado inicial (nulo)
  const [state, formAction] = useActionState(validarAcessoPaciente, null);

  const [nascimentoDisplay, setNascimentoDisplay] = useState("");
  const [nascimentoISO, setNascimentoISO] = useState("");

  const handleNascimentoChange = (event: ChangeEvent<HTMLInputElement>) => {
    const masked = formatDateMask(event.target.value);
    setNascimentoDisplay(masked);
    setNascimentoISO(toISODate(masked));
  };

  return (
    <section className="flex flex-1 justify-center items-center px-4 sm:px-6 lg:px-8 py-8">
      <div className="bg-background shadow-2xl shadow-neutral/10 border border-neutral/15 w-full max-w-md card">
        <div className="gap-6 p-6 sm:p-8 card-body">
          <div className="space-y-2 text-center">
            <h1 className="font-semibold text-foreground text-3xl">Acompanhe seu tratamento</h1>
            <p className="flex justify-center items-center gap-2 font-extralight text-brand text-sm label-text">
              <LockKeyhole size={14} />
              Informe o número do protocolo e a data de nascimento.
            </p>
          </div>

          {/* Exibe o erro devolvido pela Server Action caso exista */}
          {state?.erro && (
            <div className="flex items-center gap-2 bg-error/10 p-3 border border-error/20 rounded-xl text-error text-sm">
              <AlertCircle size={16} className="shrink-0" />
              <p>{state.erro}</p>
            </div>
          )}

          {/* Passamos o formAction devolvido pelo hook, que entende o retorno corretamente */}
          <form action={formAction} className="space-y-6 grid">
            <label className="form-control">
              <span className="flex items-center gap-2 mb-2 font-medium text-foreground text-sm label-text">
                <Hash size={14} />
                Número do protocolo
              </span>
              <input
                name="protocolo"
                required
                className="bg-background border-neutral/20 focus:border-brand w-full text-foreground placeholder:text-foreground/50 input input-bordered"
                placeholder="Ex.: ABC-1234"
              />
            </label>

            <label className="form-control">
              <span className="flex items-center gap-2 mb-2 font-medium text-foreground text-sm label-text">
                <CalendarDays size={14} />
                Data de nascimento
              </span>
              <input
                required
                type="text"
                inputMode="numeric"
                placeholder="dd/mm/aaaa"
                maxLength={10}
                className="bg-background border-neutral/20 focus:border-brand w-full text-foreground placeholder:text-foreground/50 input input-bordered"
                value={nascimentoDisplay}
                onChange={handleNascimentoChange}
              />
              <input type="hidden" name="dataNascimento" value={nascimentoISO} />
            </label>
            <SubmitButton text="Acessar" icon={<LockKeyhole size={16} />} />
          </form>
        </div>
      </div>
    </section>
  );
}