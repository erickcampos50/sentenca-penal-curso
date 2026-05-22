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
        ...c,
        nome: crime.nome,
        tipo: crime.tipo,
        penaMin: String(crime.pena_min),
        penaMax: String(crime.pena_max),
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
    "Nota didática: o concurso deve ser calculado após a dosimetria individual de cada crime. A escolha da modalidade depende dos fatos: número de condutas, desígnios autônomos, mesma espécie e condições de tempo, lugar e modo de execução.",
  ].join("\n") : "";

  const handleCopy = async () => {
    if (!relatorio) return;
    try {
      await navigator.clipboard.writeText(relatorio);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  };

  return (
    <div className="space-y-4">
      <Info color="blue" title="Concurso de Crimes (Arts. 69-71, CP)">
        Adicione as penas definitivas individuais depois da dosimetria trifásica de cada crime. A aba compara cenários, mas a modalidade depende dos fatos do caso.
      </Info>

      <div className="bg-white rounded-lg p-3 shadow-sm border border-gray-200 space-y-3">
        <h2 className="font-bold text-sm">1. Diagnóstico da modalidade</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">Houve uma só ação ou omissão?</label>
            <select value={config.umaConduta} onChange={e => setConfigField("umaConduta", e.target.value)} className="w-full border border-gray-300 rounded px-2 py-1 text-xs bg-white">
              <option value="">Não sei informar</option>
              <option value="sim">Sim</option>
              <option value="nao">Não</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">Havia desígnios autônomos?</label>
            <select value={config.designiosAutonomos} onChange={e => setConfigField("designiosAutonomos", e.target.value)} className="w-full border border-gray-300 rounded px-2 py-1 text-xs bg-white">
              <option value="">Não sei informar</option>
              <option value="sim">Sim</option>
              <option value="nao">Não</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">Os crimes são da mesma espécie?</label>
            <select value={config.mesmaEspecie} onChange={e => setConfigField("mesmaEspecie", e.target.value)} className="w-full border border-gray-300 rounded px-2 py-1 text-xs bg-white">
              <option value="">Não sei informar</option>
              <option value="sim">Sim</option>
              <option value="nao">Não</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">Tempo, lugar e modo indicam continuidade?</label>
            <select value={config.mesmasCondicoes} onChange={e => setConfigField("mesmasCondicoes", e.target.value)} className="w-full border border-gray-300 rounded px-2 py-1 text-xs bg-white">
              <option value="">Não sei informar</option>
              <option value="sim">Sim</option>
              <option value="nao">Não</option>
            </select>
          </div>
        </div>
        {sugestao && (
          <div className="bg-blue-50 border border-blue-200 rounded p-2 text-xs text-blue-800">
            <strong>Sugestão didática:</strong> {sugestao.motivo}
            <button type="button" onClick={() => setConfigField("modalidade", sugestao.modalidade)} className="ml-2 underline font-semibold">Aplicar</button>
          </div>
        )}
      </div>

      <div className="bg-white rounded-lg p-3 shadow-sm border border-gray-200 space-y-3">
        <h2 className="font-bold text-sm">2. Regra aplicável ao caso</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">Modalidade</label>
            <select value={config.modalidade} onChange={e => setConfigField("modalidade", e.target.value)} className="w-full border border-gray-300 rounded px-2 py-1 text-xs bg-white">
              <option value="material">Concurso material (art. 69)</option>
              <option value="formal-proprio">Concurso formal próprio (art. 70)</option>
              <option value="formal-improprio">Concurso formal impróprio (art. 70)</option>
              <option value="continuado">Crime continuado (art. 71)</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">Aumento no formal próprio</label>
            <select value={config.aumentoFormal} onChange={e => setConfigField("aumentoFormal", e.target.value)} className="w-full border border-gray-300 rounded px-2 py-1 text-xs bg-white">
              {FRACOES_FORMAL.map(f => <option key={f.value} value={f.value}>{f.label}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">Aumento no crime continuado</label>
            <select value={config.aumentoContinuado} onChange={e => setConfigField("aumentoContinuado", e.target.value)} className="w-full border border-gray-300 rounded px-2 py-1 text-xs bg-white">
              {FRACOES_CONTINUADO.map(f => <option key={f.value} value={f.value}>{f.label}</option>)}
            </select>
          </div>
        </div>
      </div>

      <div className="space-y-3">
        <h2 className="font-bold text-sm">3. Penas individuais já dosimetradas</h2>
        {crimes.map((c) => (
          <div key={c.id} className="bg-white rounded-lg p-3 shadow-sm border border-gray-200">
            <div className="mb-2">
              <label className="block text-xs font-semibold text-gray-600 mb-1">Selecionar crime (auto-preenchimento)</label>
              <select
                value={c.nome}
                onChange={e => handleCrimeSelect(c.id, e.target.value)}
                className="w-full border border-gray-300 rounded px-2 py-1 text-xs bg-white focus:outline-none"
              >
                <option value="">-- Selecione um crime --</option>
                {crimesList.map((crime, i) => (
                  <option key={i} value={crime.nome}>{crime.nome}</option>
                ))}
                <option value="__outro__">Outro (digite manualmente)</option>
              </select>
              {c.observacao.trim() && (
                <div className="mt-2">
                  <Info color="yellow" title="Observação do crime selecionado">
                    {c.observacao}
                  </Info>
                </div>
              )}
            </div>
            <div className="grid grid-cols-2 gap-2 mb-2">
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Crime / descrição manual</label>
                <input
                  value={c.nome === "__outro__" ? "" : c.nome}
                  onChange={e => updateCrime(c.id, "nome", e.target.value)}
                  className="w-full border border-gray-300 rounded px-2 py-1 text-xs focus:outline-none"
                  placeholder="Ex: Roubo art. 157"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Tipo</label>
                <select
                  value={c.tipo}
                  onChange={e => updateCrime(c.id, "tipo", e.target.value)}
                  className="w-full border border-gray-300 rounded px-2 py-1 text-xs bg-white focus:outline-none"
                >
                  <option value="reclusão">Reclusão</option>
                  <option value="detenção">Detenção</option>
                  <option value="prisão simples">Prisão simples</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Pena mínima (anos)</label>
                <input
                  type="number"
                  min="0"
                  step="0.5"
                  value={c.penaMin}
                  onChange={e => updateCrime(c.id, "penaMin", e.target.value)}
                  className="w-full border border-gray-300 rounded px-2 py-1 text-xs focus:outline-none"
                  placeholder="0"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Pena máxima (anos)</label>
                <input
                  type="number"
                  min="0"
                  step="0.5"
                  value={c.penaMax}
                  onChange={e => updateCrime(c.id, "penaMax", e.target.value)}
                  className="w-full border border-gray-300 rounded px-2 py-1 text-xs focus:outline-none"
                  placeholder="0"
                />
              </div>
            </div>
            <div className="mb-2">
              <label className="block text-xs font-semibold text-gray-600 mb-1">Pena definitiva individual (anos) — obrigatória</label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={c.penaDef}
                onChange={e => updateCrime(c.id, "penaDef", e.target.value)}
                className="w-full border border-gray-300 rounded px-2 py-1 text-xs focus:outline-none"
                placeholder="Informe a pena já calculada na dosimetria"
              />
              {!parseFloat(c.penaDef || "0") && (
                <p className="mt-1 text-[11px] text-red-600">Sem pena definitiva este crime não entra no cálculo do concurso.</p>
              )}
            </div>
            <button onClick={() => removeCrime(c.id)} className="text-xs text-red-500 hover:underline">
              Remover crime
            </button>
          </div>
        ))}
      </div>

      <button onClick={addCrime} className="text-xs text-blue-500 hover:underline">
        + Adicionar crime ao concurso
      </button>

      {resultado && (
        <div className="bg-white rounded-xl p-4 shadow-sm border border-blue-100 text-xs space-y-2">
          <div className="border-b border-blue-100 pb-2 mb-2">
            <h3 className="font-bold text-gray-900">Resultado do Concurso</h3>
            <p className="text-gray-500">Comparação didática entre os principais critérios de unificação.</p>
          </div>
          <div className="grid grid-cols-1 gap-2">
            <div className="bg-blue-50 rounded-lg p-2 border border-blue-100">
              <p className="text-blue-700 font-medium">Concurso material (Art. 69 CP)</p>
              <p className="text-gray-900 font-bold">{fmt(resultado.material)}</p>
              <p className="text-gray-600">Soma das penas unificada ao limite de 40 anos (Art. 75, CP)</p>
            </div>
            <div className="bg-blue-50 rounded-lg p-2 border border-blue-100">
              <p className="text-blue-700 font-medium">Concurso formal (Art. 70 CP)</p>
              <p className="text-gray-900 font-bold">{fmt(resultado.formal)}</p>
              <p className="text-gray-600">Pena mais grave com aumento selecionado, limitada pela soma quando mais benéfico.</p>
            </div>
            <div className="bg-blue-50 rounded-lg p-2 border border-blue-100">
              <p className="text-blue-700 font-medium">Crime continuado (Art. 71 CP)</p>
              <p className="text-gray-900 font-bold">{fmt(resultado.continuado)}</p>
              <p className="text-gray-600">Pena mais grave com aumento de 1/6 a 2/3.</p>
            </div>
            <div className="bg-gray-50 rounded-lg p-2 border border-gray-200">
              <p className="text-gray-700 font-medium">Resultado pela modalidade selecionada</p>
              <p className="text-gray-900 font-bold">{fmt(resultado.resultadoEscolhido)}</p>
              <p className="text-gray-600">{resultado.fundamentoEscolhido}</p>
            </div>
          </div>
          {resultado.penasIncompletas > 0 && (
            <div className="bg-red-50 border border-red-200 rounded p-2 text-red-700">
              {resultado.penasIncompletas} crime(s) sem pena definitiva foram ignorados no cálculo.
            </div>
          )}
          <div className="bg-gray-50 border border-gray-200 rounded p-3">
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-bold text-gray-800">Relatório do concurso</h4>
              <button type="button" onClick={handleCopy} className="text-xs bg-blue-600 hover:bg-blue-700 text-white px-2 py-1 rounded">
                {copied ? "Copiado!" : "Copiar"}
              </button>
            </div>
            <pre className="whitespace-pre-wrap text-[11px] text-gray-700 font-mono leading-relaxed">{relatorio}</pre>
          </div>
        </div>
      )}
    </div>
  );
}
