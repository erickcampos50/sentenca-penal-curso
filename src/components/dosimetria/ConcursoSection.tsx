import { useState, type Dispatch, type SetStateAction } from "react";
import { Info } from "./InfoPill";
import { fmt, calcConcurso, sugerirModalidadeConcurso } from "./utils";
import type { ConcursoConfig, ConcursoCrime, Crime } from "./types";

interface Props {
  crimesList: Crime[];
  crimes: ConcursoCrime[];
  setCrimes: Dispatch<SetStateAction<ConcursoCrime[]>>;
  config: ConcursoConfig;
  setConfig: Dispatch<SetStateAction<ConcursoConfig>>;
}

const FRACOES_FORMAL = [
  { label: "1/6", value: String(1 / 6) },
  { label: "1/5", value: String(1 / 5) },
  { label: "1/4", value: String(1 / 4) },
  { label: "1/3", value: String(1 / 3) },
  { label: "1/2", value: String(1 / 2) },
];

const FRACOES_CONTINUADO = [
  ...FRACOES_FORMAL,
  { label: "2/3", value: String(2 / 3) },
];

const inputCls = "w-full h-[42px] px-3 text-sm rounded-[4px] border border-[#ced4da] bg-white text-[#212529] focus:outline-none focus:border-brand-500 transition-colors";
const labelCls = "block text-sm font-medium text-[#212529] mb-1";

export default function ConcursoSection({ crimesList, crimes, setCrimes, config, setConfig }: Props) {
  const [copied, setCopied] = useState(false);

  const addCrime = () => {
    const nextId = crimes.length > 0 ? Math.max(...crimes.map(c => c.id)) + 1 : 1;
    setCrimes(prev => [...prev, { id: nextId, nome: "", tipo: "reclusão", penaMin: "", penaMax: "", penaDef: "", observacao: "" }]);
  };

  const removeCrime = (id: number) => setCrimes(prev => prev.filter(c => c.id !== id));

  const updateCrime = (id: number, field: keyof ConcursoCrime, value: string) => {
    setCrimes(prev => prev.map(c => c.id === id ? { ...c, [field]: value } : c));
  };

  const handleCrimeSelect = (id: number, nome: string) => {
    const crime = crimesList.find(c => c.nome === nome);
    if (crime) {
      setCrimes(prev => prev.map(c => c.id === id ? {
        ...c, nome: crime.nome, tipo: crime.tipo,
        penaMin: String(crime.pena_min), penaMax: String(crime.pena_max),
        observacao: crime.observacao,
      } : c));
    } else {
      setCrimes(prev => prev.map(c => c.id === id ? { ...c, nome, observacao: "" } : c));
    }
  };

  const resultado = calcConcurso(crimes, config);
  const sugestao = sugerirModalidadeConcurso(config);

  const setConfigField = (field: keyof ConcursoConfig, value: string) => {
    setConfig(prev => ({ ...prev, [field]: value }));
  };

  const relatorio = resultado ? [
    "RELATÓRIO DE CONCURSO DE CRIMES",
    "",
    `Modalidade selecionada: ${config.modalidade}`,
    resultado.fundamentoEscolhido,
    "",
    "Penas individuais consideradas:",
    ...crimes
      .filter(c => parseFloat(c.penaDef || "0") > 0)
      .map((c, i) => `${i + 1}. ${c.nome || "Crime sem descrição"}: ${fmt(parseFloat(c.penaDef))}`),
    "",
    `Soma material: ${fmt(resultado.soma)}; após limite do art. 75, CP: ${fmt(resultado.material)}`,
    `Pena mais grave: ${fmt(resultado.maxPena)}`,
    `Concurso formal próprio: ${fmt(resultado.formal)}`,
    `Crime continuado: ${fmt(resultado.continuado)}`,
    "",
    `Resultado pela modalidade escolhida: ${fmt(resultado.resultadoEscolhido)}`,
    "",
    "Nota didática: o concurso deve ser calculado após a dosimetria individual de cada crime.",
  ].join("\n") : "";

  const handleCopy = async () => {
    if (!relatorio) return;
    try {
      await navigator.clipboard.writeText(relatorio);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch { setCopied(false); }
  };

  return (
    <div className="space-y-4">
      <Info color="blue" title="Concurso de Crimes (Arts. 69-71, CP)">
        Adicione as penas definitivas individuais depois da dosimetria trifásica de cada crime.
      </Info>

      {/* Diagnóstico */}
      <div className="bg-white rounded-[4px] p-4 border border-[#dee2e6] space-y-4">
        <h2 className="font-bold text-base text-[#212529]">1. Diagnóstico da modalidade</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className={labelCls}>Houve uma só ação ou omissão?</label>
            <select value={config.umaConduta} onChange={e => setConfigField("umaConduta", e.target.value)} className={inputCls + " cursor-pointer"}>
              <option value="">Não sei informar</option>
              <option value="sim">Sim</option>
              <option value="nao">Não</option>
            </select>
          </div>
          <div>
            <label className={labelCls}>Havia desígnios autônomos?</label>
            <select value={config.designiosAutonomos} onChange={e => setConfigField("designiosAutonomos", e.target.value)} className={inputCls + " cursor-pointer"}>
              <option value="">Não sei informar</option>
              <option value="sim">Sim</option>
              <option value="nao">Não</option>
            </select>
          </div>
          <div>
            <label className={labelCls}>Os crimes são da mesma espécie?</label>
            <select value={config.mesmaEspecie} onChange={e => setConfigField("mesmaEspecie", e.target.value)} className={inputCls + " cursor-pointer"}>
              <option value="">Não sei informar</option>
              <option value="sim">Sim</option>
              <option value="nao">Não</option>
            </select>
          </div>
          <div>
            <label className={labelCls}>Tempo, lugar e modo indicam continuidade?</label>
            <select value={config.mesmasCondicoes} onChange={e => setConfigField("mesmasCondicoes", e.target.value)} className={inputCls + " cursor-pointer"}>
              <option value="">Não sei informar</option>
              <option value="sim">Sim</option>
              <option value="nao">Não</option>
            </select>
          </div>
        </div>
        {sugestao && (
          <div className="bg-brand-50 border border-brand-200 rounded-[4px] p-3 text-sm text-brand-800">
            <strong>Sugestão didática:</strong> {sugestao.motivo}
            <button type="button" onClick={() => setConfigField("modalidade", sugestao.modalidade)}
              className="ml-2 underline font-semibold text-brand-600 hover:text-brand-700">Aplicar</button>
          </div>
        )}
      </div>

      {/* Regra aplicável */}
      <div className="bg-white rounded-[4px] p-4 border border-[#dee2e6] space-y-4">
        <h2 className="font-bold text-base text-[#212529]">2. Regra aplicável ao caso</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className={labelCls}>Modalidade</label>
            <select value={config.modalidade} onChange={e => setConfigField("modalidade", e.target.value)} className={inputCls + " cursor-pointer"}>
              <option value="material">Concurso material (art. 69)</option>
              <option value="formal-proprio">Concurso formal próprio (art. 70)</option>
              <option value="formal-improprio">Concurso formal impróprio (art. 70)</option>
              <option value="continuado">Crime continuado (art. 71)</option>
            </select>
          </div>
          <div>
            <label className={labelCls}>Aumento no formal próprio</label>
            <select value={config.aumentoFormal} onChange={e => setConfigField("aumentoFormal", e.target.value)} className={inputCls + " cursor-pointer"}>
              {FRACOES_FORMAL.map(f => <option key={f.value} value={f.value}>{f.label}</option>)}
            </select>
          </div>
          <div>
            <label className={labelCls}>Aumento no crime continuado</label>
            <select value={config.aumentoContinuado} onChange={e => setConfigField("aumentoContinuado", e.target.value)} className={inputCls + " cursor-pointer"}>
              {FRACOES_CONTINUADO.map(f => <option key={f.value} value={f.value}>{f.label}</option>)}
            </select>
          </div>
        </div>
      </div>

      {/* Penas individuais */}
      <div className="space-y-3">
        <h2 className="font-bold text-base text-[#212529]">3. Penas individuais já dosimetradas</h2>
        {crimes.map((c) => (
          <div key={c.id} className="bg-white rounded-[4px] p-4 border border-[#dee2e6]">
            <div className="mb-4">
              <label className={labelCls}>Selecionar crime (auto-preenchimento)</label>
              <select value={c.nome} onChange={e => handleCrimeSelect(c.id, e.target.value)}
                className={inputCls + " cursor-pointer"}>
                <option value="">-- Selecione um crime --</option>
                {crimesList.map((crime, i) => (
                  <option key={i} value={crime.nome}>{crime.nome}</option>
                ))}
                <option value="__outro__">Outro (digite manualmente)</option>
              </select>
              {c.observacao.trim() && (
                <div className="mt-3">
                  <Info color="yellow" title="Observação do crime selecionado">{c.observacao}</Info>
                </div>
              )}
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
              <div>
                <label className={labelCls}>Crime / descrição manual</label>
                <input value={c.nome === "__outro__" ? "" : c.nome}
                  onChange={e => updateCrime(c.id, "nome", e.target.value)}
                  className={inputCls} placeholder="Ex: Roubo art. 157" />
              </div>
              <div>
                <label className={labelCls}>Tipo</label>
                <select value={c.tipo} onChange={e => updateCrime(c.id, "tipo", e.target.value)}
                  className={inputCls + " cursor-pointer"}>
                  <option value="reclusão">Reclusão</option>
                  <option value="detenção">Detenção</option>
                  <option value="prisão simples">Prisão simples</option>
                </select>
              </div>
              <div>
                <label className={labelCls}>Pena mínima (anos)</label>
                <input type="number" min="0" step="0.5" value={c.penaMin}
                  onChange={e => updateCrime(c.id, "penaMin", e.target.value)}
                  className={inputCls} placeholder="0" />
              </div>
              <div>
                <label className={labelCls}>Pena máxima (anos)</label>
                <input type="number" min="0" step="0.5" value={c.penaMax}
                  onChange={e => updateCrime(c.id, "penaMax", e.target.value)}
                  className={inputCls} placeholder="0" />
              </div>
            </div>
            <div className="mb-3">
              <label className={labelCls}>Pena definitiva individual (anos) — obrigatória</label>
              <input type="number" min="0" step="0.01" value={c.penaDef}
                onChange={e => updateCrime(c.id, "penaDef", e.target.value)}
                className={inputCls} placeholder="Informe a pena já calculada na dosimetria" />
              {!parseFloat(c.penaDef || "0") && (
                <p className="mt-1 text-xs text-red-600">Sem pena definitiva este crime não entra no cálculo do concurso.</p>
              )}
            </div>
            <button onClick={() => removeCrime(c.id)}
              className="text-sm font-medium text-red-500 hover:text-red-600 transition-colors">Remover crime</button>
          </div>
        ))}
      </div>

      <button onClick={addCrime}
        className="text-sm font-medium text-brand-600 hover:text-brand-700 transition-colors">+ Adicionar crime ao concurso</button>

      {resultado && (
        <div className="bg-white rounded-[4px] p-4 border border-brand-100 space-y-3">
          <div className="border-b border-brand-100 pb-3">
            <h3 className="font-bold text-[#212529] text-base">Resultado do Concurso</h3>
            <p className="text-sm text-[#868e96]">Comparação didática entre os principais critérios de unificação.</p>
          </div>
          <div className="space-y-2">
            <div className="bg-brand-50 rounded-[4px] p-3 border border-brand-200">
              <p className="text-sm text-brand-700 font-medium">Concurso material (Art. 69 CP)</p>
              <p className="text-[#212529] font-bold text-base">{fmt(resultado.material)}</p>
              <p className="text-xs text-[#868e96]">Soma das penas unificada ao limite de 40 anos (Art. 75, CP)</p>
            </div>
            <div className="bg-brand-50 rounded-[4px] p-3 border border-brand-200">
              <p className="text-sm text-brand-700 font-medium">Concurso formal (Art. 70 CP)</p>
              <p className="text-[#212529] font-bold text-base">{fmt(resultado.formal)}</p>
              <p className="text-xs text-[#868e96]">Pena mais grave com aumento selecionado.</p>
            </div>
            <div className="bg-brand-50 rounded-[4px] p-3 border border-brand-200">
              <p className="text-sm text-brand-700 font-medium">Crime continuado (Art. 71 CP)</p>
              <p className="text-[#212529] font-bold text-base">{fmt(resultado.continuado)}</p>
              <p className="text-xs text-[#868e96]">Pena mais grave com aumento de 1/6 a 2/3.</p>
            </div>
            <div className="bg-[#f8f9fa] rounded-[4px] p-3 border border-[#dee2e6]">
              <p className="text-sm text-[#495057] font-medium">Resultado pela modalidade selecionada</p>
              <p className="text-[#212529] font-bold text-base">{fmt(resultado.resultadoEscolhido)}</p>
              <p className="text-xs text-[#868e96]">{resultado.fundamentoEscolhido}</p>
            </div>
          </div>
          {resultado.penasIncompletas > 0 && (
            <div className="bg-red-50 border border-red-200 rounded-[4px] p-3 text-sm text-red-700">
              {resultado.penasIncompletas} crime(s) sem pena definitiva foram ignorados no cálculo.
            </div>
          )}
          <div className="bg-[#f8f9fa] border border-[#dee2e6] rounded-[4px] p-4">
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-bold text-[#212529]">Relatório do concurso</h4>
              <button type="button" onClick={handleCopy}
                className="inline-flex items-center h-[36px] px-4 text-sm font-semibold bg-brand-500 hover:bg-brand-600 text-white rounded-[4px] transition-colors">
                {copied ? "Copiado!" : "Copiar"}
              </button>
            </div>
            <pre className="whitespace-pre-wrap text-[13px] text-[#212529] font-mono leading-relaxed bg-white rounded-[4px] p-3 border border-[#dee2e6]">{relatorio}</pre>
          </div>
        </div>
      )}
    </div>
  );
}
