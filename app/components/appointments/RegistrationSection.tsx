"use client";

import { PhoneField } from "@/components/shared/PhoneField";
import { SearchableSelect } from "@/components/shared/SearchableSelect";
import { SubmitButton } from "@/components/shared/SubmitButton";
import {
    FormInscricao,
    salvarAgendamento,
} from "@/src/features/appointments/presentation/actions/inscricao.actions";
import {
    validateStep,
    type FormErrors,
} from "@/src/features/appointments/presentation/utils/formValidation";
import {
    codeByName,
    countries,
    getStates,
    hasStates,
} from "@/src/shared/infrastructure/data/locations";
import {
    formatDateMask,
    isNascimentoValido,
    toISODate,
} from "@/src/shared/utils/mask";
import { formatPhoneDisplay } from "@/src/shared/utils/phone";
import {
    ArrowLeft,
    ArrowRight,
    CalendarDays,
    CheckCheck,
    ClipboardList,
    Mail,
    MapPinned,
    Megaphone,
    MessageCircle,
    Phone,
    ShieldCheck,
    UserRound,
} from "lucide-react";
import { useState, useTransition, type ChangeEvent } from "react";

const stepLabels = ["Paciente", "Agendamento", "Revisão"];

// Estado focado apenas no que o usuário preenche na interface
const initialFormData: FormInscricao = {
  nomeCompleto: "",
  dataNascimento: "",
  pais: "",
  estado: "",
  cidade: "",
  endereco: "",
  emailNotificacao: "",
  celular: "",
  tipoWhatsApp: "E_WHATSAPP",
  whatsappAuxiliar: "",
  nomeSolicitante: "",
  tipo: "TRATAMENTO_SEM_CIRURGIA",
};

export function RegistrationSection() {
  const [step, setStep] = useState(0);
  const [formData, setFormData] = useState<FormInscricao>(initialFormData);
  const [protocoloGerado, setProtocoloGerado] = useState<string | null>(null);
  const [erro, setErro] = useState<string | null>(null);
  const [nascimentoDisplay, setNascimentoDisplay] = useState("");
  const [errors, setErrors] = useState<FormErrors>({});

  const clearError = (field: keyof FormInscricao) =>
    setErrors((current) => {
      if (!current[field]) return current;
      const next = { ...current };
      delete next[field];
      return next;
    });

  const handlePaisSelect = (pais: string) => {
    setFormData((current) => ({ ...current, pais, estado: "" }));
    clearError("pais");
    clearError("estado");
  };

  const handleEstadoSelect = (estado: string) => {
    setFormData((current) => ({ ...current, estado }));
    clearError("estado");
  };

  const handleNascimentoChange = (event: ChangeEvent<HTMLInputElement>) => {
    const masked = formatDateMask(event.target.value);
    setNascimentoDisplay(masked);
    setFormData((current) => ({
      ...current,
      dataNascimento: toISODate(masked),
    }));
    clearError("dataNascimento");
  };

  const [isPending, startTransition] = useTransition();

  const updateField =
    (field: keyof FormInscricao) =>
    (
      event: ChangeEvent<
        HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
      >,
    ) => {
      const target = event.target as HTMLInputElement;
      setFormData((current) => ({
        ...current,
        [field]: target.type === "checkbox" ? target.checked : target.value,
      }));
      clearError(field);
    };

  const goNext = () => {
    const stepErrors = validateStep(step, formData);
    if (Object.keys(stepErrors).length > 0) {
      setErrors(stepErrors);
      return;
    }
    setErrors({});
    setStep((current) => Math.min(2, current + 1));
  };

  const handleAction = () => {
    setErro(null);

    if (!formData.pais) {
      setErro("Selecione o país.");
      return;
    }
    if (hasStates(codeByName[formData.pais]) && !formData.estado) {
      setErro("Selecione o estado/província/região.");
      return;
    }
    if (!isNascimentoValido(formData.dataNascimento)) {
      setErro("Informe uma data de nascimento válida (até hoje).");
      return;
    }

    startTransition(async () => {
      const resultado = await salvarAgendamento(formData);

      if (resultado.sucesso) {
        setProtocoloGerado(resultado.protocolo!);
      } else {
        setErro(resultado.erro || "Ocorreu um erro desconhecido.");
      }
    });
  };

  if (protocoloGerado) {
    return (
      <section
        id="inscricao"
        className="flex flex-col justify-center items-center p-8 min-h-[60vh] scroll-mt-44 sm:scroll-mt-35"
      >
        <div className="bg-card shadow-lg p-10 border border-brand/20 rounded-3xl w-full max-w-md text-center">
          <div className="flex justify-center items-center bg-brand/10 mx-auto mb-6 rounded-full w-20 h-20 text-brand">
            <CheckCheck size={40} />
          </div>
          <h2 className="mb-2 font-bold text-foreground text-2xl">
            Inscrição Confirmada!
          </h2>
          <p className="mb-6 text-neutral">
            Guarde o seu protocolo para acompanhar as atualizações do
            tratamento.
          </p>

          <div className="bg-background mb-6 p-4 border border-neutral/15 rounded-xl">
            <p className="mb-1 text-neutral text-xs uppercase tracking-widest">
              Seu Protocolo
            </p>
            <p className="font-bold text-brand text-2xl tracking-wider">
              {protocoloGerado}
            </p>
          </div>

          <button
            onClick={() => {
              setProtocoloGerado(null);
              setStep(0);
              setFormData(initialFormData);
              setNascimentoDisplay("");
            }}
            className="w-full text-foreground hover:text-background btn btn-ghost"
          >
            Fazer nova inscrição
          </button>
        </div>
      </section>
    );
  }

  return (
    <section
      id="inscricao"
      className="relative flex items-center p-8 min-h-screen overflow-hidden scroll-mt-44 sm:scroll-mt-24"
    >
      <div className="-z-10 absolute inset-0 bg-[linear-gradient(180deg,var(--background)_0%,#F5F1EA_55%,var(--background)_100%)]" />

      <div className="gap-8 grid lg:grid-cols-[0.5fr_1.5fr] mx-auto w-full max-w-7xl">
        <aside className="space-y-6">
          <div className="space-y-3">
            <h2 className="font-bold text-foreground text-3xl sm:text-4xl">
              Solicite o seu Atendimento
            </h2>
            <p className="max-w-xl text-foreground/80 text-base leading-7">
              Preencha com atenção os dados do paciente e as informações de
              contato. O formulário é dividido em três etapas rápidas para
              facilitar a sua inscrição no tratamento espiritual a distância.
            </p>
          </div>

          <div className="bg-card/90 shadow-lg shadow-neutral/8 p-6 border border-neutral/15 rounded-3xl">
            <p className="flex items-center gap-2 text-brand text-sm uppercase tracking-[0.28em]">
              <ShieldCheck size={14} /> Confidencialidade
            </p>
            <p className="mt-3 text-foreground/85 text-sm leading-6">
              Todos os dados fornecidos estão seguros e serão utilizados
              exclusivamente para a sintonia da equipe espiritual e para o envio
              de orientações sobre o tratamento.
            </p>
          </div>
        </aside>

        <div className="bg-card/95 shadow-2xl shadow-neutral/10 border border-neutral/15 card">
          <div className="gap-6 p-6 sm:p-8 lg:p-10 card-body">
            {erro && (
              <div className="bg-error/10 mb-4 p-3 border border-error/20 rounded-xl text-error text-sm">
                {erro}
              </div>
            )}
            <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:justify-between sm:items-start">
              <p className="flex items-center gap-2 text-brand text-sm uppercase tracking-[0.25em]">
                <ClipboardList size={14} />
                Inscrição
              </p>
              <ul className="steps steps-horizontal max-sm:mx-auto">
                {stepLabels.map((label, index) => (
                  <li
                    key={label}
                    className={`step ${index <= step ? "text-brand font-semibold [--step-bg:var(--brand)] [--step-fg:var(--background)]" : "text-neutral font-extralight"}`}
                  >
                    {label}
                  </li>
                ))}
              </ul>
            </div>

            <form className="space-y-6" action={handleAction}>
              {step === 0 && (
                <div className="gap-4 grid md:grid-cols-2">
                  <label className="flex flex-col form-control">
                    <span
                      className={`mb-2 font-medium text-sm label-text ${
                        errors.nomeCompleto ? "text-error" : "text-foreground"
                      }`}
                    >
                      Nome completo*
                    </span>
                    <input
                      required
                      aria-invalid={!!errors.nomeCompleto}
                      className={`bg-background text-foreground placeholder:text-neutral/60 input input-bordered w-full ${
                        errors.nomeCompleto
                          ? "border-error focus:border-error"
                          : "border-neutral/20 focus:border-brand"
                      }`}
                      placeholder="Ex.: Maria Oliveira"
                      value={formData.nomeCompleto}
                      onChange={updateField("nomeCompleto")}
                    />
                  </label>
                  <label className="flex flex-col form-control">
                    <span
                      className={`mb-2 font-medium text-sm label-text ${
                        errors.dataNascimento ? "text-error" : "text-foreground"
                      }`}
                    >
                      Data de nascimento*
                    </span>
                    <input
                      required
                      aria-invalid={!!errors.dataNascimento}
                      type="text"
                      inputMode="numeric"
                      placeholder="dd/mm/aaaa"
                      maxLength={10}
                      className={`bg-background text-foreground placeholder:text-neutral/60 input input-bordered w-full ${
                        errors.dataNascimento
                          ? "border-error focus:border-error"
                          : "border-neutral/20 focus:border-brand"
                      }`}
                      value={nascimentoDisplay}
                      onChange={handleNascimentoChange}
                    />
                  </label>
                  <label className="flex flex-col min-w-0 form-control">
                    <span
                      className={`mb-2 font-medium text-sm label-text ${
                        errors.pais ? "text-error" : "text-foreground"
                      }`}
                    >
                      País*
                    </span>
                    <SearchableSelect
                      options={countries}
                      value={formData.pais}
                      onChange={handlePaisSelect}
                      placeholder="Selecione o país"
                      searchPlaceholder="Digite o nome do país..."
                      hasError={!!errors.pais}
                    />
                  </label>
                  <label className="flex flex-col min-w-0 form-control">
                    <span
                      className={`mb-2 font-medium text-sm label-text ${
                        errors.estado ? "text-error" : "text-foreground"
                      }`}
                    >
                      Estado*
                    </span>
                    {hasStates(codeByName[formData.pais]) ? (
                      <SearchableSelect
                        options={getStates(codeByName[formData.pais])!}
                        value={formData.estado}
                        onChange={handleEstadoSelect}
                        placeholder="Selecione o estado"
                        searchPlaceholder="Digite o nome do estado..."
                        hasError={!!errors.estado}
                      />
                    ) : (
                      <input
                        aria-invalid={!!errors.estado}
                        className={`bg-background text-foreground placeholder:text-neutral/60 input input-bordered w-full ${
                          errors.estado
                            ? "border-error focus:border-error"
                            : "border-neutral/20 focus:border-brand"
                        }`}
                        placeholder="Ex.: Piauí"
                        value={formData.estado}
                        onChange={updateField("estado")}
                      />
                    )}
                  </label>
                  <label className="flex flex-col form-control">
                    <span
                      className={`mb-2 font-medium text-sm label-text ${
                        errors.cidade ? "text-error" : "text-foreground"
                      }`}
                    >
                      Cidade*
                    </span>
                    <input
                      required
                      aria-invalid={!!errors.cidade}
                      autoComplete="address-level2"
                      className={`bg-background text-foreground placeholder:text-neutral/60 input input-bordered w-full ${
                        errors.cidade
                          ? "border-error focus:border-error"
                          : "border-neutral/20 focus:border-brand"
                      }`}
                      placeholder="Parnaíba"
                      value={formData.cidade}
                      onChange={updateField("cidade")}
                    />
                  </label>
                  <label className="flex flex-col form-control">
                    <span
                      className={`mb-2 font-medium text-sm label-text ${
                        errors.endereco ? "text-error" : "text-foreground"
                      }`}
                    >
                      Endereço*
                    </span>
                    <input
                      required
                      aria-invalid={!!errors.endereco}
                      className={`bg-background text-foreground placeholder:text-neutral/60 input input-bordered w-full ${
                        errors.endereco
                          ? "border-error focus:border-error"
                          : "border-neutral/20 focus:border-brand"
                      }`}
                      placeholder="Rua, número, bairro e complemento"
                      value={formData.endereco}
                      onChange={updateField("endereco")}
                    />
                  </label>
                </div>
              )}

              {step === 1 && (
                <div className="gap-4 grid md:grid-cols-2">
                  <label className="flex flex-col form-control">
                    <span className="mb-2 font-medium text-foreground text-sm label-text">
                      Nome do solicitante (Opcional)
                    </span>
                    <input
                      className="bg-background border-neutral/20 focus:border-brand text-foreground placeholder:text-neutral/60 input input-bordered w-full"
                      placeholder="Ex.: Irmã Ana"
                      value={formData.nomeSolicitante}
                      onChange={updateField("nomeSolicitante")}
                    />
                  </label>
                  <label className="flex flex-col form-control">
                    <span
                      className={`flex items-center gap-2 mb-2 font-medium text-sm label-text ${
                        errors.emailNotificacao ? "text-error" : "text-foreground"
                      }`}
                    >
                      <Mail size={14} />
                      E-mail de notificação*
                    </span>
                    <input
                      required
                      aria-invalid={!!errors.emailNotificacao}
                      autoComplete="email"
                      aria-describedby={
                        errors.emailNotificacao
                          ? "erro-emailNotificacao"
                          : undefined
                      }
                      type="email"
                      className={`bg-background text-foreground placeholder:text-neutral/60 input input-bordered w-full ${
                        errors.emailNotificacao
                          ? "border-error focus:border-error"
                          : "border-neutral/20 focus:border-brand"
                      }`}
                      placeholder="contato@exemplo.com"
                      value={formData.emailNotificacao}
                      onChange={updateField("emailNotificacao")}
                    />
                  </label>
                  <div className="flex flex-col gap-3">
                    <label className="flex flex-col form-control">
                      <span
                        className={`flex items-center gap-2 mb-2 font-medium text-sm label-text ${
                          errors.celular ? "text-error" : "text-foreground"
                        }`}
                      >
                        <Phone size={14} />
                        Celular*
                      </span>
                      <PhoneField
                        value={formData.celular}
                        onChange={(value) => {
                          setFormData((prev) => ({ ...prev, celular: value }));
                          clearError("celular");
                        }}
                        hasError={!!errors.celular}
                      />
                    </label>
                    <label className="flex flex-col form-control">
                      {/* <span className="mb-2 font-medium text-foreground text-sm label-text">
                        WhatsApp
                      </span> */}
                      <label className="px-0 py-0 border-0 rounded-sm max-w-80 cursor-pointer label">
                        <input
                          type="checkbox"
                          className="border-neutral/30 checkbox checkbox-accent [--chkbg:var(--brand)] [--chkfg:var(--background)]"
                          checked={formData.tipoWhatsApp === "E_WHATSAPP"}
                          onChange={(e) => {
                            setFormData((prev) => ({
                              ...prev,
                              tipoWhatsApp: e.target.checked
                                ? "E_WHATSAPP"
                                : prev.whatsappAuxiliar?.trim()
                                ? "OUTRO_NUMERO" :
                                "NAO_TEM",
                            }));
                          }}
                        />
                        <span className="text-foreground label-text">
                          Este número é WhatsApp
                        </span>
                      </label>
                    </label>
                  </div>

                  <label className="flex flex-col form-control">
                      <span className="flex items-center gap-2 mb-2 font-medium text-foreground text-sm label-text">
                        <MessageCircle size={14} /> WhatsApp Auxiliar (Opcional)
                      </span>
                      <PhoneField
                        value={formData.whatsappAuxiliar ?? ""}
                        onChange={(value) => {
                          setFormData((prev) => ({
                            ...prev,
                            whatsappAuxiliar: value,
                            tipoWhatsApp: value.trim() ? "OUTRO_NUMERO" : "NAO_TEM"
                          }));
                          clearError("whatsappAuxiliar");
                        }}
                        disabled={formData.tipoWhatsApp === "E_WHATSAPP"}
                      />
                      {errors.whatsappAuxiliar && (
                        <p
                          id="erro-whatsappAuxiliar"
                          role="alert"
                          className="mt-1 text-error text-sm"
                        >
                          {errors.whatsappAuxiliar}
                        </p>
                      )}
                    </label>

                  <label className="flex flex-col form-control">
                    <span className="flex items-center gap-2 mt-2 font-extralight text-brand text-sm label-text">
                      <Megaphone size={14} /> As cirurgias acontecem na última
                      sexta-feira do mês.
                    </span>
                    <label className="px-0 py-0 border-0 rounded-sm max-w-80 cursor-pointer label h-10">
                      <input
                        type="checkbox"
                        className="border-neutral/30 checkbox checkbox-accent [--chkbg:var(--brand)] [--chkfg:var(--background)]"
                        checked={formData.tipo === "TRATAMENTO_COM_CIRURGIA"}
                        onChange={(e) => {
                          setFormData((prev) => ({
                            ...prev,
                            tipo: e.target.checked
                              ? "TRATAMENTO_COM_CIRURGIA"
                              : "TRATAMENTO_SEM_CIRURGIA",
                          }));
                        }}
                      />
                      <span className="text-foreground label-text">
                        Desejo o Tratamento com Cirurgia
                      </span>
                    </label>
                  </label>
                </div>
              )}

              {step === 2 && (
                <div className="gap-4 grid lg:grid-cols-2 py-1.5">
                  <div className="bg-background p-5 border border-neutral/15 rounded-3xl">
                    <p className="flex items-center gap-2 text-brand text-sm uppercase tracking-[0.22em]">
                      <UserRound size={14} />
                      Paciente
                    </p>
                    <dl className="space-y-3 mt-4 text-foreground/85 text-sm">
                      <div className="flex justify-between items-center gap-4">
                        <dt>Nome</dt>
                        <dd className="font-medium text-foreground text-right">
                          {formData.nomeCompleto || "Nome não informado"}
                        </dd>
                      </div>
                      <div className="flex justify-between items-center gap-4">
                        <dt>Nascimento</dt>
                        <dd className="font-medium text-foreground text-right">
                          {formData.dataNascimento
                            ? formData.dataNascimento
                                .split("-")
                                .reverse()
                                .join("/")
                            : "--/--/----"}
                        </dd>
                      </div>
                      <div className="flex justify-between items-center gap-4">
                        <dt className="flex items-center gap-2">
                          <MapPinned size={14} />
                          Local
                        </dt>
                        <dd className="font-medium text-foreground text-right">
                          {[formData.cidade, formData.estado, formData.pais]
                            .filter(Boolean)
                            .join(" / ") || "Cidade / Estado / País"}
                        </dd>
                      </div>
                    </dl>
                  </div>
                  <div className="bg-background p-5 border border-neutral/15 rounded-3xl">
                    <p className="flex items-center gap-2 text-brand text-sm uppercase tracking-[0.22em]">
                      <CalendarDays size={14} />
                      Agendamento
                    </p>
                    <dl className="space-y-3 mt-4 text-foreground/85 text-sm">
                      <div className="flex justify-between items-center gap-4">
                        <dt>Tipo</dt>
                        <dd className="font-medium text-foreground text-right">
                          {formData.tipo === "TRATAMENTO_COM_CIRURGIA"
                            ? "Com Cirurgia"
                            : "Sem Cirurgia"}
                        </dd>
                      </div>
                      <div className="flex justify-between items-center gap-4">
                        <dt>Solicitante</dt>
                        <dd className="font-medium text-foreground text-right">
                          {formData.nomeSolicitante || "Para si mesmo"}
                        </dd>
                      </div>
                      <div className="flex justify-between items-center gap-4">
                        <dt>E-mail</dt>
                        <dd className="font-medium text-foreground text-right">
                          {formData.emailNotificacao || "Não informado"}
                        </dd>
                      </div>
                      <div className="flex justify-between items-center gap-4">
                        <dt>WhatsApp</dt>
                        <dd className="font-medium text-foreground text-right">
                          {formData.tipoWhatsApp === "E_WHATSAPP"
                            ? "Sim"
                            : formData.tipoWhatsApp === "OUTRO_NUMERO"
                              ? "Outro Número"
                              : "Não"}
                        </dd>
                      </div>
                      <div className="flex justify-between items-center gap-4">
                        <dt>Celular</dt>
                        <dd className="font-medium text-foreground text-right">
                          {formatPhoneDisplay(formData.celular) ||
                            "(00) 00000-0000"}
                        </dd>
                      </div>
                      {formData.tipoWhatsApp === "OUTRO_NUMERO" && (
                        <div className="flex justify-between items-center gap-4">
                          <dt>Auxiliar</dt>
                          <dd className="font-medium text-foreground text-right">
                            {formatPhoneDisplay(
                              formData.whatsappAuxiliar ?? "",
                            ) || "(00) 00000-0000"}
                          </dd>
                        </div>
                      )}
                    </dl>
                  </div>
                </div>
              )}

              <div className="flex flex-wrap justify-between items-center gap-2 pt-6 border-neutral/10 border-t sm:gap-3">
                <button
                  type="button"
                  className="gap-2 bg-background hover:bg-brand border-brand/20 hover:border-brand text-foreground hover:text-background btn"
                  onClick={() => setStep((current) => Math.max(0, current - 1))}
                  hidden={step === 0}
                >
                  <ArrowLeft size={16} />
                  Voltar
                </button>

                <div className="flex flex-wrap gap-3 ml-auto">
                  {step < 2 ? (
                    <button
                      type="button"
                      className="gap-2 bg-brand hover:bg-brand-hover border-brand hover:border-brand-hover text-background btn"
                      onClick={goNext}
                    >
                      Próxima etapa
                      <ArrowRight size={16} />
                    </button>
                  ) : (
                      <SubmitButton
                        className="w-35 sm:w-auto"
                      text="Finalizar inscrição"
                      icon={<CheckCheck size={16} />}
                    />
                  )}
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}
