import { useState, useEffect } from "react";
import { Info, Pill } from "./dosimetria/InfoPill";
import {
  VETORES, AGRAVANTES_LIST, ATENUANTES_LIST, MAJORANTES_LIST, MINORANTES_LIST,
  SUMULAS, PRESCRICAO, FRACS, COLOR_MAP
} from "./dosimetria/data";
import {
  FV, fmt, prescPrazo, parseCrimeCSV, calcRegime, regCorMap, fmtAnosCompact
} from "./dosimetria/utils";
import ResultadoFinal from "./dosimetria/ResultadoFinal";
import PrescricaoDetracao from "./dosimetria/PrescricaoDetracao";
import ConcursoSection from "./dosimetria/ConcursoSection";
import MultaSection from "./dosimetria/MultaSection";
import type { Color, Crime, RowItem, PrescricaoConfig, MedidaSeguranca, MultaConfig, ConcursoCrime, ConcursoConfig } from "./dosimetria/types";

export default function DosimetriaPenal() {
  const [tab, setTab] = useState("calc");
  const [penMin, setPenMin] = useState("");
  const [penMax, setPenMax] = useState("");
  const [tipo, setTipo] = useState("reclusão");
  const [reincidente, setReincidente] = useState("nao");
  const [violencia, setViolencia] = useState("nao");
  const [classi, setClassi] = useState<string[]>(Array(8).fill("neutro"));
  const [obs, setObs] = useState<string[]>(Array(8).fill(""));
  const [agravs, setAgravs] = useState<RowItem[]>([]);
  const [atens, setAtens] = useState<RowItem[]>([]);
  const [majors, setMajors] = useState<RowItem[]>([]);
  const [minors, setMinors] = useState<RowItem[]>([]);
  const [detMeses, setDetMeses] = useState("");
  const [tentativa, setTentativa] = useState(false);
  const [tentativaFrac, setTentativaFrac] = useState("1/2");
  const [hediondo, setHediondo] = useState(false);
  const [reincEspec, setReincEspec] = useState(false);
  const [openV, setOpenV] = useState<number | null>(null);

  // Accordion state — which phase is expanded (null = all collapsed)
  const [expandedPhase, setExpandedPhase] = useState<number | null>(1);
  const [openReferenceAccordion, setOpenReferenceAccordion] = useState<"refs" | "sumulas" | null>(null);
  // Info toggle per phase
  const [showInfo, setShowInfo] = useState<Record<number, boolean>>({ 1: false, 2: false, 3: false });

  // Novos estados
  const [perSaltum, setPerSaltum] = useState(false);
  const [medidaSeg, setMedidaSeg] = useState<MedidaSeguranca>({ ativa: false, tipo: "internação", prazo: "1" });
  const [presc, setPresc] = useState<PrescricaoConfig>({
    reducaoMetade: false,
    retroativa: false,
    dataDenuncia: "",
    dataSentenca: "",
    periodosSuspensao: [],
    fugaDias: "",
  });
  const [multa, setMulta] = useState<MultaConfig>({ diasMulta: "", valorDiaMulta: "", salarioMinimo: "", fracaoSalario: "" });
  const [crimesList, setCrimesList] = useState<Crime[]>([]);
  const [crimeSelecionado, setCrimeSelecionado] = useState("");
  const [concursoCrimes, setConcursoCrimes] = useState<ConcursoCrime[]>([]);
  const [concursoConfig, setConcursoConfig] = useState<ConcursoConfig>({
    modalidade: "material",
    aumentoFormal: String(1 / 6),
    aumentoContinuado: String(1 / 6),
    umaConduta: "",
    designiosAutonomos: "",
    mesmaEspecie: "",
    mesmasCondicoes: "",
  });

  // Carregar crimes CSV
  useEffect(() => {
    fetch("/crimes.csv")
      .then(r => r.text())
      .then(text => setCrimesList(parseCrimeCSV(text)))
      .catch(() => setCrimesList([]));
  }, []);

  const selectedCrime = crimesList.find(c => c.nome === crimeSelecionado);

  // Validação de inputs numéricos
  const minVal = parseFloat(penMin);
  const maxVal = parseFloat(penMax);
  const isValidMin = !isNaN(minVal) && minVal >= 0;
  const isValidMax = !isNaN(maxVal) && maxVal >= 0 && maxVal >= minVal;
  const min = isValidMin ? minVal : 0;
  const max = isValidMax ? maxVal : 0;
  const intv = Math.max(max - min, 0);
  const hasData = isValidMin && isValidMax && min > 0 && max > 0;

  // Normalização de campos categóricos
  const tipoNorm = tipo.trim().toLowerCase();
  const reincNorm = reincidente.trim().toLowerCase() === "sim";
  const violNorm = violencia.trim().toLowerCase() === "sim";

  // Fase 1
  const negN = classi.filter(c => c === "desfavoravel").length;
  const acPorVetor = negN > 0 && intv > 0 ? intv / 8 : 0;
  const penBase = hasData ? Math.min(min + negN * acPorVetor, max) : 0;

  // Fase 2
  const agAtivos = agravs.filter(a => a.desc?.trim() && a.frac in FV);
  const atAtivos = atens.filter(a => a.desc?.trim() && a.frac in FV);
  const agSum = agAtivos.reduce((s, a) => s + penBase * FV[a.frac], 0);
  const atSum = atAtivos.reduce((s, a) => s + penBase * FV[a.frac], 0);
  const penInter = hasData ? Math.min(Math.max(penBase + agSum - atSum, min), max) : 0;

  const minAtivos = minors.filter(m => m.desc?.trim() && m.frac in FV);
  const majAtivos = majors.filter(m => m.desc?.trim() && m.frac in FV);

  // Fase 3
  let penDef = penInter;
  minAtivos.forEach(m => { penDef = penDef * (1 - FV[m.frac]); });
  if (tentativa && penDef > 0 && tentativaFrac in FV) {
    penDef = penDef * (1 - FV[tentativaFrac]);
  }
  majAtivos.forEach(m => { penDef = penDef * (1 + FV[m.frac]); });
  penDef = Math.max(penDef, 0);

  // Detração
  const detMesesNum = parseFloat(detMeses);
  const detAnos = !isNaN(detMesesNum) && detMesesNum >= 0 ? detMesesNum / 12 : 0;
  const penRem = Math.max(penDef - detAnos, 0);

  // Regime
  const penaParaRegime = detAnos > 0 ? penRem : penDef;
  const regimeData = hasData
    ? penaParaRegime > 0
      ? calcRegime(penaParaRegime, tipoNorm, reincNorm, hediondo, reincEspec, perSaltum)
      : { regime: "Pena integralmente detraída", regiF: "CPP, art. 387, § 2º — a prisão provisória, administrativa ou internação é computada para determinar o regime inicial." }
    : { regime: "—", regiF: "" };
  const regime = regimeData.regime;
  const regiF = regimeData.regiF;

  // Substituição
  const cabeSub = penDef > 0 && penDef <= 4 && !violNorm && !reincNorm;
  const subCondicional = penDef > 0 && penDef <= 4 && !violNorm && reincNorm;

  const subTxt = cabeSub
    ? "Cabe substituição por restritivas de direitos (art. 44, CP)"
    : subCondicional
    ? "Substituição condicionada ao art. 44, § 3º, CP"
    : "Não cabe substituição";

  const subQuant = cabeSub
    ? penDef <= 1
      ? "multa ou 1 pena restritiva de direitos (art. 44, § 2º, CP)"
      : "1 restritiva + multa ou 2 penas restritivas de direitos (art. 44, § 2º, CP)"
    : "";

  // Sursis
  const sursis = penDef > 0 && penDef <= 2 && !reincNorm;
  const sursisEt = penDef > 0 && penDef <= 4 && !reincNorm;

  // Prescrição
  const prescAbst = max > 0 ? prescPrazo(max) : null;
  const prescConc = penDef > 0 ? prescPrazo(penDef) : null;

  const addRow = (set: React.Dispatch<React.SetStateAction<RowItem[]>>) => set(p => [...p, { desc: "", frac: "1/6" }]);
  const remRow = (set: React.Dispatch<React.SetStateAction<RowItem[]>>, i: number) => set(p => p.filter((_, j) => j !== i));
  const updRow = (set: React.Dispatch<React.SetStateAction<RowItem[]>>, i: number, k: keyof RowItem, v: string) => set(p => { const n = [...p]; n[i] = { ...n[i], [k]: v }; return n; });

  const handleCrimeChange = (nome: string) => {
    setCrimeSelecionado(nome);
    const crime = crimesList.find(c => c.nome === nome);
    if (crime) {
      setPenMin(String(crime.pena_min));
      setPenMax(String(crime.pena_max));
      setTipo(crime.tipo);
      setViolencia(crime.violento ? "sim" : "nao");
    }
  };

  const addPenaAtualAoConcurso = () => {
    if (!hasData || penDef <= 0) return;
    const nextId = concursoCrimes.length > 0 ? Math.max(...concursoCrimes.map(c => c.id)) + 1 : 1;
    setConcursoCrimes(prev => [...prev, {
      id: nextId,
      nome: selectedCrime?.nome || crimeSelecionado || "Crime dosimetrado",
      tipo,
      penaMin: penMin,
      penaMax: penMax,
      penaDef: penDef.toFixed(4),
      observacao: selectedCrime?.observacao || "Pena definitiva importada da aba Calculadora",
    }]);
    setTab("concurso");
  };

  const audit = hasData ? [
    `MOLDURA: min = ${min} anos | max = ${max} anos | intervalo = ${intv.toFixed(4)} anos`,
    `INTERVALO ÷ 8 = ${(intv/8).toFixed(4)} anos por vetor negativo`,
    `FASE 1: ${negN} vetor(es) negativo(s) x ${(intv/8).toFixed(4)} = +${(negN*acPorVetor).toFixed(4)} anos`,
    `PENA-BASE: ${min} + ${(negN*acPorVetor).toFixed(4)} = ${penBase.toFixed(4)} anos -> ${fmt(penBase)}`,
    agAtivos.length ? `AGRAVANTES: penBase(${penBase.toFixed(4)}) x [${agAtivos.map(a=>a.frac).join(" + ")}] = +${agSum.toFixed(4)} anos` : null,
    atAtivos.length ? `ATENUANTES: penBase(${penBase.toFixed(4)}) x [${atAtivos.map(a=>a.frac).join(" + ")}] = -${atSum.toFixed(4)} anos (minimo ${min} anos — Súmula 231/STJ)` : null,
    `PENA INTERMEDIARIA: ${penBase.toFixed(4)} + ${agSum.toFixed(4)} - ${atSum.toFixed(4)} = ${penInter.toFixed(4)} anos -> ${fmt(penInter)}`,
    ...minAtivos.map((m,i)=>`MINORANTE ${i+1} (${m.frac}): x ${(1-FV[m.frac]).toFixed(4)}`),
    tentativa && tentativaFrac in FV ? `TENTATIVA (art. 14, paragrafo unico, CP) (${tentativaFrac}): x ${(1-FV[tentativaFrac]).toFixed(4)}` : null,
    ...majAtivos.map((m,i)=>`MAJORANTE ${i+1} (${m.frac}): x ${(1+FV[m.frac]).toFixed(4)}`),
    `PENA DEFINITIVA: ${penDef.toFixed(4)} anos -> ${fmt(penDef)}`,
    detAnos > 0 ? `DETRACAO (art. 42): ${penDef.toFixed(4)} - ${detAnos.toFixed(4)} = ${penRem.toFixed(4)} anos -> ${fmt(penRem)}` : null,
    `REGIME INICIAL: ${regime} (${regiF})`,
    `SUBSTITUICAO (art. 44): ${subTxt}`,
    sursis ? `SURSIS (art. 77): Cabivel — sursis simples (pena <= 2 anos)` : sursisEt ? `SURSIS (art. 77, § 2º): Verificar sursis etario ou humanitario (pena <= 4 anos)` : `SURSIS (art. 77): Nao cabe`,
    prescAbst ? `PRESCRICAO ABSTRATA (art. 109 CP): pena max. ${max} anos -> prazo de ${prescAbst} anos` : null,
    prescConc ? `PRESCRICAO CONCRETA (art. 109 CP): pena def. ${penDef.toFixed(2)} anos -> prazo de ${prescConc} anos` : null,
  ].filter((line): line is string => line !== null) : [];

  const tabs = [
    { id: "calc", label: "Calculadora" },
    { id: "concurso", label: "Concurso de crimes" },
    { id: "audit", label: "Auditoria dos cálculos" },
  ];

  const togglePhase = (n: number) => setExpandedPhase(expandedPhase === n ? null : n);
  const toggleReferenceAccordion = (id: "refs" | "sumulas") => setOpenReferenceAccordion(openReferenceAccordion === id ? null : id);
  const toggleInfo = (n: number) => setShowInfo(prev => ({ ...prev, [n]: !prev[n] }));

  const phaseDotBg: Record<number, string> = { 1: "bg-brand-50 text-brand-600 border-brand-200", 2: "bg-amber-50 text-amber-600 border-amber-200", 3: "bg-emerald-50 text-emerald-600 border-emerald-200" };
  const phaseAccent: Record<number, string> = { 1: "border-brand-500", 2: "border-amber-500", 3: "border-emerald-500" };
  const phaseResultColor: Record<number, string> = { 1: "text-brand-600", 2: "text-amber-600", 3: "text-emerald-600" };
  const phaseInfoBg: Record<number, string> = { 1: "bg-brand-50 border-brand-200", 2: "bg-amber-50 border-amber-200", 3: "bg-emerald-50 border-emerald-200" };
  const phaseInfoBtn: Record<number, string> = { 1: "hover:border-brand-300 hover:text-brand-600 border-brand-200 text-brand-600 bg-brand-50", 2: "hover:border-amber-300 hover:text-amber-600 border-amber-200 text-amber-600 bg-amber-50", 3: "hover:border-emerald-300 hover:text-emerald-600 border-emerald-200 text-emerald-600 bg-emerald-50" };
  const phaseResultBg: Record<number, string> = { 1: "bg-brand-50 border-brand-200 text-brand-700", 2: "bg-amber-50 border-amber-200 text-amber-700", 3: "bg-emerald-50 border-emerald-200 text-emerald-700" };

  // Mantine shared input class
  const inputCls = "w-full h-[42px] px-3 text-sm rounded-[4px] border border-[#ced4da] bg-white text-[#212529] placeholder:text-[#adb5bd] focus:outline-none focus:border-brand-500 transition-colors duration-100";
  const selectCls = "w-full h-[42px] px-3 text-sm rounded-[4px] border border-[#ced4da] bg-white text-[#212529] cursor-pointer focus:outline-none focus:border-brand-500 transition-colors duration-100";
  const labelCls = "block text-sm font-medium text-[#212529] mb-1";

  return (
    <div className=" mx-auto px-4 py-6 font-sans text-sm bg-[#f8f9fa] min-h-screen">
      <div className="text-center mb-6">
        <h1 className="text-[22px] font-extrabold text-[#212529] tracking-tight">Dosimetria Penal</h1>
        <p className="text-sm text-[#868e96] mt-1">Sistema Trifásico · Art. 68, CP · Cálculo auditável</p>
      </div>

      {/* Mantine Tabs — full-width underline with bold active state */}
      <div className="border-b border-[#dee2e6] mb-6">
        <div className="flex -mb-px">
          {tabs.map(t => (
            <button key={t.id} onClick={() => setTab(t.id)}
              className={`flex-1 relative px-3 py-3 text-[15px] font-semibold transition-all duration-100 ${
                tab === t.id
                  ? "text-[#1c7ed6] bg-[#e7f5ff] before:absolute before:bottom-[-1px] before:left-0 before:right-0 before:h-[3px] before:bg-[#1c7ed6] before:rounded-t-sm"
                  : "text-[#868e96] hover:text-[#495057] hover:bg-[#f1f3f5]"
              }`}>
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* ========== CALCULADORA ========== */}
      {tab === "calc" && (
        <div className="space-y-5">
          <Info color="gray">
            <strong>Convenção de cálculo:</strong> 1 ano = 360 dias (ano comercial) · 1 mês = 30 dias. As conversões para anos/meses/dias seguem a prática forense e podem divergir do calendário civil em cerca de 5 dias por ano.
          </Info>

          {/* Moldura Penal — Mantine Paper */}
          <div className="bg-white rounded-[4px] p-4 border border-[#dee2e6]">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-bold text-base text-[#212529]">Moldura Penal</h2>
              <button
                onClick={() => toggleInfo(0)}
                className={`w-[28px] h-[28px] rounded-[4px] border text-[13px] font-bold flex items-center justify-center transition-colors ${
                  showInfo[0] ? 'border-brand-300 text-brand-600 bg-brand-50' : 'border-[#dee2e6] text-[#868e96] hover:border-brand-300 hover:text-brand-600 hover:bg-brand-50'
                }`}
              >ℹ</button>
            </div>

            {showInfo[0] && (
              <div className="mb-4 p-3 text-[13px] text-[#212529] leading-relaxed rounded-[4px] bg-brand-50 border border-brand-200 animate-[fadeIn_0.2s_ease]">
                <strong>Identifique o tipo penal aplicável.</strong> Se houver qualificadora, use a pena da forma qualificada — ela altera a própria moldura, não entra na 3ª fase.
              </div>
            )}

            <div className="mb-4">
              <label className={labelCls}>Selecionar crime</label>
              <input
                list="crimes-options"
                value={crimeSelecionado}
                onChange={e => handleCrimeChange(e.target.value)}
                className={inputCls}
                placeholder="Digite para buscar ou escolha na lista"
              />
              <datalist id="crimes-options">
                {crimesList.map((c, i) => (
                  <option key={i} value={c.nome}>{c.nome}</option>
                ))}
              </datalist>
              <p className="mt-1.5 text-xs text-[#868e96]">Comece a digitar para filtrar ou abra as sugestões do navegador.</p>
              {selectedCrime?.observacao.trim() && (
                <div className="mt-3">
                  <Info color="yellow" title="Observação do crime selecionado">
                    {selectedCrime.observacao}
                  </Info>
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
              <div>
                <label className={labelCls}>Pena mínima (anos)</label>
                <div className="relative">
                  <input type="number" min="0" step="0.5" value={penMin} onChange={e => setPenMin(e.target.value)}
                    className={inputCls + " pr-[140px]"} placeholder="ex: 1" />
                  {isValidMin && minVal > 0 && minVal % 1 !== 0 && (
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[#adb5bd] text-sm pointer-events-none select-none truncate max-w-[130px] text-right">
                      {fmtAnosCompact(minVal)}
                    </span>
                  )}
                </div>
              </div>
              <div>
                <label className={labelCls}>Pena máxima (anos)</label>
                <div className="relative">
                  <input type="number" min="0" step="0.5" value={penMax} onChange={e => setPenMax(e.target.value)}
                    className={inputCls + " pr-[140px]"} placeholder="ex: 4" />
                  {isValidMax && maxVal > 0 && maxVal % 1 !== 0 && (
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[#adb5bd] text-sm pointer-events-none select-none truncate max-w-[130px] text-right">
                      {fmtAnosCompact(maxVal)}
                    </span>
                  )}
                </div>
              </div>
              <div>
                <label className={labelCls}>Tipo de pena</label>
                <select value={tipo} onChange={e => setTipo(e.target.value)} className={selectCls}>
                  <option value="reclusão">Reclusão</option>
                  <option value="detenção">Detenção</option>
                  <option value="prisão simples">Prisão simples</option>
                </select>
              </div>
              <div>
                <label className={labelCls}>Reincidente?</label>
                <select value={reincidente} onChange={e => setReincidente(e.target.value)} className={selectCls}>
                  <option value="nao">Não (primário)</option>
                  <option value="sim">Sim (reincidente)</option>
                </select>
              </div>
            </div>
            <div className="mb-4">
              <label className={labelCls}>Crime com violência ou grave ameaça?</label>
              <select value={violencia} onChange={e => setViolencia(e.target.value)} className={selectCls}>
                <option value="nao">Não</option>
                <option value="sim">Sim</option>
              </select>
            </div>
            <div className="space-y-3">
              <label className="flex items-center gap-3 text-sm text-[#212529] cursor-pointer">
                <input type="checkbox" checked={hediondo} onChange={e => setHediondo(e.target.checked)}
                  className="w-[18px] h-[18px] rounded-sm border-[#ced4da] text-brand-500 focus:ring-brand-500 accent-brand-500" />
                <span>Crime hediondo/equiparado</span>
              </label>
              <label className="flex items-center gap-3 text-sm text-[#212529] cursor-pointer">
                <input type="checkbox" checked={reincEspec} onChange={e => setReincEspec(e.target.checked)}
                  className="w-[18px] h-[18px] rounded-sm border-[#ced4da] text-brand-500 accent-brand-500" />
                <span>Reincidente específico em crime doloso</span>
              </label>
              <label className="flex items-center gap-3 text-sm text-[#212529] cursor-pointer">
                <input type="checkbox" checked={perSaltum} onChange={e => setPerSaltum(e.target.checked)}
                  className="w-[18px] h-[18px] rounded-sm border-[#ced4da] text-brand-500 accent-brand-500" />
                <span>Permitir regime fechado para pena &lt;= 4 anos (per saltum)</span>
              </label>
              {perSaltum && (
                <Info color="yellow">
                  Controvérsia doutrinária: STJ admite regime fechado (per saltum) para reincidentes com pena &lt;= 4 anos e circunstâncias judiciais desfavoráveis.
                </Info>
              )}
            </div>
            {!isValidMax && penMax && (
              <div className="mt-3 bg-red-50 border border-red-200 rounded-[4px] p-3 text-sm text-red-700">
                A pena máxima deve ser maior ou igual à pena mínima.
              </div>
            )}
            {hasData && (
              <div className="mt-4 bg-[#f8f9fa] rounded-[4px] p-3 text-xs text-[#868e96] border border-[#f1f3f5]">
                Intervalo: <strong className="text-[#212529]">{fmt(intv)}</strong> · Cada vetor negativo acresce: <strong className="text-[#212529]">{fmt(intv/8)}</strong> (intervalo ÷ 8)
              </div>
            )}
          </div>

          {/* ===== FASE 1: MANTINE ACCORDION ===== */}
          <div className={`bg-white rounded-[4px] border transition-colors duration-150 overflow-hidden ${
            expandedPhase === 1 ? 'border-brand-500' : 'border-[#dee2e6]'
          }`}>
            <button onClick={() => togglePhase(1)} className="w-full flex items-center gap-3 px-4 py-4 text-left hover:bg-[#f8f9fa] transition-colors">
              <span className={`w-9 h-9 rounded-[4px] border flex items-center justify-center font-extrabold text-sm flex-shrink-0 ${phaseDotBg[1]}`}>1</span>
              <div className="flex-1 min-w-0">
                <div className="font-semibold text-sm text-[#212529]">Pena-Base</div>
                <div className="text-xs text-[#868e96]">Art. 59, CP · 8 circunstâncias judiciais</div>
              </div>
              <div className="text-right flex-shrink-0">
                {hasData && <div className="text-xl font-extrabold text-brand-600">{fmt(penBase)}</div>}
                {!hasData && <div className="text-sm text-[#adb5bd]">—</div>}
              </div>
              <span className={`text-[#868e96] transition-transform duration-200 text-sm ${expandedPhase === 1 ? 'rotate-180' : ''}`}>▼</span>
            </button>
            {expandedPhase === 1 && (
              <div className="px-4 pb-4 border-t border-[#dee2e6] animate-[fadeIn_0.25s_ease]">
                <div className="flex items-center justify-between mt-4 mb-3">
                  <p className="text-[13px] text-[#868e96]">Clique em cada vetor para expandir os detalhes.</p>
                  <button onClick={() => toggleInfo(1)}
                    className={`w-[28px] h-[28px] rounded-[4px] border text-[13px] font-bold flex items-center justify-center flex-shrink-0 transition-colors ${
                      showInfo[1] ? phaseInfoBtn[1] : 'border-[#dee2e6] text-[#868e96] hover:border-[#ced4da] hover:text-[#495057] hover:bg-[#f8f9fa]'
                    }`}>ℹ</button>
                </div>
                {showInfo[1] && (
                  <div className={`mb-4 p-3 text-[13px] text-[#212529] leading-relaxed rounded-[4px] border animate-[fadeIn_0.2s_ease] ${phaseInfoBg[1]}`}>
                    <strong>Art. 59, CP:</strong> O juiz fixa a pena-base conforme 8 circunstâncias judiciais. Cada vetor desfavorável acresce 1/8 do intervalo ao mínimo legal.<br/>
                    <strong className="text-red-600">Bis in idem:</strong> não usar o mesmo fato em mais de um vetor.
                  </div>
                )}
                <div className="space-y-2">
                  {VETORES.map((v, i) => (
                    <div key={i} className="border border-[#dee2e6] rounded-[4px] overflow-hidden">
                      <div className="flex flex-col sm:flex-row sm:items-center gap-2 p-3 cursor-pointer hover:bg-[#f8f9fa] transition-colors"
                        onClick={() => setOpenV(openV === i ? null : i)}>
                        <span className="text-sm font-medium text-[#212529] w-full sm:w-44 sm:shrink-0">{v.name}</span>
                        <select value={classi[i]}
                          onClick={e => e.stopPropagation()}
                          onChange={e => { const n=[...classi]; n[i]=e.target.value; setClassi(n); }}
                          className="w-full min-w-0 sm:w-auto h-[42px] px-3 text-sm rounded-[4px] border border-[#ced4da] bg-white text-[#212529] focus:outline-none focus:border-brand-500 transition-colors duration-100">
                          <option value="neutro">Neutro</option>
                          <option value="favoravel">Favorável</option>
                          <option value="desfavoravel">Desfavorável ↑</option>
                        </select>
                        {classi[i]==="desfavoravel" && <Pill color="red">+{fmt(acPorVetor)}</Pill>}
                        {classi[i]==="favoravel" && <Pill color="green">Favorável</Pill>}
                        <span className="self-end sm:self-auto sm:ml-auto text-[#adb5bd] text-xs">{openV===i?"▲":"▼"}</span>
                      </div>
                      {openV===i && (
                        <div className="bg-[#f8f9fa] border-t border-[#dee2e6] p-4 text-sm space-y-2">
                          <p><strong className="text-[#212529]">Base legal:</strong> {v.art}</p>
                          <p><strong className="text-[#212529]">O que avalia:</strong> {v.desc}</p>
                          <p><strong className="text-red-600">Desfavorável quando:</strong> {v.desfavoravel}</p>
                          <div className="bg-amber-50 border border-amber-200 rounded-[4px] p-3 text-[13px] text-amber-800">
                            <strong>Alerta:</strong> {v.alerta}
                          </div>
                          <div>
                            <label className={labelCls}>Fundamento fático nos autos:</label>
                            <input className={inputCls}
                              placeholder="Descreva o fato concreto..."
                              value={obs[i]} onChange={e => { const n=[...obs]; n[i]=e.target.value; setObs(n); }} />
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
                {hasData && (
                  <div className={`mt-4 rounded-[4px] p-4 space-y-1 border ${phaseResultBg[1]}`}>
                    <p className="text-xs">Vetores negativos: <strong>{negN}</strong> de 8</p>
                    <p className="text-xs opacity-75">min + (N × intervalo ÷ 8)</p>
                    <p className="font-extrabold text-lg">Pena-base: {fmt(penBase)}</p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* ===== FASE 2: MANTINE ACCORDION ===== */}
          <div className={`bg-white rounded-[4px] border transition-colors duration-150 overflow-hidden ${
            expandedPhase === 2 ? 'border-amber-500' : 'border-[#dee2e6]'
          }`}>
            <button onClick={() => togglePhase(2)} className="w-full flex items-center gap-3 px-4 py-4 text-left hover:bg-[#f8f9fa] transition-colors">
              <span className={`w-9 h-9 rounded-[4px] border flex items-center justify-center font-extrabold text-sm flex-shrink-0 ${phaseDotBg[2]}`}>2</span>
              <div className="flex-1 min-w-0">
                <div className="font-semibold text-sm text-[#212529]">Agravantes e Atenuantes</div>
                <div className="text-xs text-[#868e96]">Arts. 61–66, CP</div>
              </div>
              <div className="text-right flex-shrink-0">
                {hasData && <div className="text-xl font-extrabold text-amber-600">{fmt(penInter)}</div>}
                {!hasData && <div className="text-sm text-[#adb5bd]">—</div>}
              </div>
              <span className={`text-[#868e96] transition-transform duration-200 text-sm ${expandedPhase === 2 ? 'rotate-180' : ''}`}>▼</span>
            </button>
            {expandedPhase === 2 && (
              <div className="px-4 pb-4 border-t border-[#dee2e6] animate-[fadeIn_0.25s_ease]">
                <div className="flex items-center justify-between mt-4 mb-3">
                  <p className="text-[13px] text-[#868e96]">Ajuste da pena-base conforme circunstâncias legais.</p>
                  <button onClick={() => toggleInfo(2)}
                    className={`w-[28px] h-[28px] rounded-[4px] border text-[13px] font-bold flex items-center justify-center flex-shrink-0 transition-colors ${
                      showInfo[2] ? phaseInfoBtn[2] : 'border-[#dee2e6] text-[#868e96] hover:border-[#ced4da] hover:text-[#495057] hover:bg-[#f8f9fa]'
                    }`}>ℹ</button>
                </div>
                {showInfo[2] && (
                  <div className={`mb-4 p-3 text-[13px] text-[#212529] leading-relaxed rounded-[4px] border space-y-1 animate-[fadeIn_0.2s_ease] ${phaseInfoBg[2]}`}>
                    <p><strong>Súmula 231/STJ:</strong> Atenuante não reduz abaixo do mínimo legal.</p>
                    <p><strong>Súmula 241/STJ:</strong> Reincidência não pode ser agravante e circunstância judicial.</p>
                    <p><strong>Fração padrão STJ:</strong> 1/6 quando a lei não fixa fração específica.</p>
                    <p><strong>Art. 67, CP:</strong> Circunstâncias preponderantes prevalecem no concurso.</p>
                  </div>
                )}
                <div className="mb-4">
                  <p className="text-sm font-bold text-red-600 mb-3">Agravantes (arts. 61–62, CP)</p>
                  {agravs.map((a, i) => (
                    <div key={i} className="flex flex-col sm:flex-row gap-2 mb-3 sm:items-center">
                      <select value={a.desc} onChange={e => updRow(setAgravs, i, "desc", e.target.value)} className={selectCls + " flex-1"}>
                        <option value="">-- selecione a agravante --</option>
                        {AGRAVANTES_LIST.map(ag => (
                          <option key={ag.code+ag.desc} value={`${ag.code}: ${ag.desc}`}>{ag.code}: {ag.desc}</option>
                        ))}
                        <option value="Legislação especial">Legislação especial</option>
                      </select>
                      <select value={a.frac} onChange={e => updRow(setAgravs, i, "frac", e.target.value)} className={selectCls + " sm:w-[72px] text-center flex-shrink-0"}>
                        {FRACS.map(f => <option key={f}>{f}</option>)}
                      </select>
                      <button onClick={() => remRow(setAgravs, i)} className="w-9 h-9 rounded-[4px] flex items-center justify-center text-[#868e96] hover:bg-red-50 hover:text-red-500 transition-colors text-lg flex-shrink-0">×</button>
                    </div>
                  ))}
                  <button onClick={() => addRow(setAgravs)} className="text-sm font-medium text-brand-600 hover:text-brand-700 transition-colors">+ Adicionar agravante</button>
                </div>
                <div>
                  <p className="text-sm font-bold text-green-600 mb-3">Atenuantes (arts. 65–66, CP)</p>
                  {atens.map((a, i) => (
                    <div key={i} className="flex flex-col sm:flex-row gap-2 mb-3 sm:items-center">
                      <select value={a.desc} onChange={e => updRow(setAtens, i, "desc", e.target.value)} className={selectCls + " flex-1"}>
                        <option value="">-- selecione a atenuante --</option>
                        {ATENUANTES_LIST.map(at => (
                          <option key={at.code+at.desc} value={`${at.code}: ${at.desc}`}>{at.code}: {at.desc}</option>
                        ))}
                      </select>
                      <select value={a.frac} onChange={e => updRow(setAtens, i, "frac", e.target.value)} className={selectCls + " sm:w-[72px] text-center flex-shrink-0"}>
                        {FRACS.map(f => <option key={f}>{f}</option>)}
                      </select>
                      <button onClick={() => remRow(setAtens, i)} className="w-9 h-9 rounded-[4px] flex items-center justify-center text-[#868e96] hover:bg-red-50 hover:text-red-500 transition-colors text-lg flex-shrink-0">×</button>
                    </div>
                  ))}
                  <button onClick={() => addRow(setAtens)} className="text-sm font-medium text-brand-600 hover:text-brand-700 transition-colors">+ Adicionar atenuante</button>
                </div>
                {hasData && (
                  <div className={`mt-4 rounded-[4px] p-4 space-y-1 border ${phaseResultBg[2]}`}>
                    <p className="text-xs">Pena-base: {fmt(penBase)}</p>
                    {agAtivos.length > 0 && <p className="text-sm text-red-600">+ Agravantes: +{fmt(agSum)}</p>}
                    {atAtivos.length > 0 && <p className="text-sm text-green-600">- Atenuantes: -{fmt(atSum)} (mín. {fmt(min)})</p>}
                    <p className="font-extrabold text-lg">Pena intermediária: {fmt(penInter)}</p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* ===== FASE 3: MANTINE ACCORDION ===== */}
          <div className={`bg-white rounded-[4px] border transition-colors duration-150 overflow-hidden ${
            expandedPhase === 3 ? 'border-emerald-500' : 'border-[#dee2e6]'
          }`}>
            <button onClick={() => togglePhase(3)} className="w-full flex items-center gap-3 px-4 py-4 text-left hover:bg-[#f8f9fa] transition-colors">
              <span className={`w-9 h-9 rounded-[4px] border flex items-center justify-center font-extrabold text-sm flex-shrink-0 ${phaseDotBg[3]}`}>3</span>
              <div className="flex-1 min-w-0">
                <div className="font-semibold text-sm text-[#212529]">Causas de Aumento e Diminuição</div>
                <div className="text-xs text-[#868e96]">Art. 68, CP</div>
              </div>
              <div className="text-right flex-shrink-0">
                {hasData && <div className="text-xl font-extrabold text-emerald-600">{fmt(penDef)}</div>}
                {!hasData && <div className="text-sm text-[#adb5bd]">—</div>}
              </div>
              <span className={`text-[#868e96] transition-transform duration-200 text-sm ${expandedPhase === 3 ? 'rotate-180' : ''}`}>▼</span>
            </button>
            {expandedPhase === 3 && (
              <div className="px-4 pb-4 border-t border-[#dee2e6] animate-[fadeIn_0.25s_ease]">
                <div className="flex items-center justify-between mt-4 mb-3">
                  <p className="text-[13px] text-[#868e96]">Causas da Parte Geral e Especial. Pena pode sair da moldura.</p>
                  <button onClick={() => toggleInfo(3)}
                    className={`w-[28px] h-[28px] rounded-[4px] border text-[13px] font-bold flex items-center justify-center flex-shrink-0 transition-colors ${
                      showInfo[3] ? phaseInfoBtn[3] : 'border-[#dee2e6] text-[#868e96] hover:border-[#ced4da] hover:text-[#495057] hover:bg-[#f8f9fa]'
                    }`}>ℹ</button>
                </div>
                {showInfo[3] && (
                  <div className={`mb-4 p-3 text-[13px] text-[#212529] leading-relaxed rounded-[4px] border space-y-1 animate-[fadeIn_0.2s_ease] ${phaseInfoBg[3]}`}>
                    <p>Na 3ª fase a pena <strong>pode ultrapassar o máximo</strong> ou <strong>ficar abaixo do mínimo</strong> legal.</p>
                    <p><strong>Ordem:</strong> primeiro minorantes (incluindo tentativa), depois majorantes.</p>
                    <p><strong>Art. 68, parágrafo único:</strong> no concurso de causas de aumento da Parte Especial, o juiz pode limitar-se a um só aumento.</p>
                  </div>
                )}
                <div className="mb-4 bg-[#f8f9fa] border border-[#dee2e6] rounded-[4px] p-4">
                  <label className="flex items-center gap-3 text-sm text-[#212529] cursor-pointer">
                    <input type="checkbox" checked={tentativa} onChange={e => setTentativa(e.target.checked)}
                      className="w-[18px] h-[18px] rounded-sm border-[#ced4da] text-brand-500 accent-brand-500" />
                    <span>Crime tentado (art. 14, II e parágrafo único, CP)</span>
                  </label>
                  {tentativa && (
                    <div className="mt-3 ml-7">
                      <label className={labelCls}>Redução da pena</label>
                      <select value={tentativaFrac} onChange={e => setTentativaFrac(e.target.value)} className={selectCls}>
                        <option value="2/3">2/3 — iter criminis muito distante da consumação</option>
                        <option value="1/2">1/2 — iter criminis intermediário</option>
                        <option value="1/3">1/3 — iter criminis próximo da consumação</option>
                      </select>
                    </div>
                  )}
                </div>
                <div className="mb-4">
                  <p className="text-sm font-bold text-red-600 mb-3">Causas de Aumento (Majorantes)</p>
                  {majors.map((m, i) => (
                    <div key={i}>
                      <div className="flex flex-col sm:flex-row gap-2 mb-2 sm:items-center">
                        <select value={m.desc.startsWith("Outra:") ? "Outra" : m.desc} onChange={e => {
                          const val = e.target.value;
                          if (val === "Outra") updRow(setMajors, i, "desc", "Outra: ");
                          else updRow(setMajors, i, "desc", val);
                        }} className={selectCls + " flex-1"}>
                          <option value="">-- selecione a majorante --</option>
                          {MAJORANTES_LIST.map(ma => (
                            <option key={ma.code+ma.desc} value={`${ma.code}: ${ma.desc}`}>{ma.code}: {ma.desc}</option>
                          ))}
                          <option value="Outra">Outra (digite manualmente)</option>
                        </select>
                        <select value={m.frac} onChange={e => updRow(setMajors, i, "frac", e.target.value)} className={selectCls + " sm:w-[72px] text-center flex-shrink-0"}>
                          {FRACS.map(f => <option key={f}>{f}</option>)}
                        </select>
                        <button onClick={() => remRow(setMajors, i)} className="w-9 h-9 rounded-[4px] flex items-center justify-center text-[#868e96] hover:bg-red-50 hover:text-red-500 transition-colors text-lg flex-shrink-0">×</button>
                      </div>
                      {m.desc.startsWith("Outra:") && (
                        <input type="text" value={m.desc.replace("Outra: ", "")}
                          onChange={e => updRow(setMajors, i, "desc", "Outra: " + e.target.value)}
                          className={inputCls + " mb-3"}
                          placeholder="Digite a causa de aumento (ex: Art. 157, § 2º-A)" />
                      )}
                    </div>
                  ))}
                  <button onClick={() => addRow(setMajors)} className="text-sm font-medium text-brand-600 hover:text-brand-700 transition-colors">+ Adicionar majorante</button>
                </div>
                <div>
                  <p className="text-sm font-bold text-green-600 mb-3">Causas de Diminuição (Minorantes)</p>
                  {minors.map((m, i) => (
                    <div key={i}>
                      <div className="flex flex-col sm:flex-row gap-2 mb-2 sm:items-center">
                        <select value={m.desc.startsWith("Outra:") ? "Outra" : m.desc} onChange={e => {
                          const val = e.target.value;
                          if (val === "Outra") updRow(setMinors, i, "desc", "Outra: ");
                          else updRow(setMinors, i, "desc", val);
                        }} className={selectCls + " flex-1"}>
                          <option value="">-- selecione a minorante --</option>
                          {MINORANTES_LIST.map(mi => (
                            <option key={mi.code+mi.desc} value={`${mi.code}: ${mi.desc}`}>{mi.code}: {mi.desc}</option>
                          ))}
                          <option value="Outra">Outra (digite manualmente)</option>
                        </select>
                        <select value={m.frac} onChange={e => updRow(setMinors, i, "frac", e.target.value)} className={selectCls + " sm:w-[72px] text-center flex-shrink-0"}>
                          {FRACS.map(f => <option key={f}>{f}</option>)}
                        </select>
                        <button onClick={() => remRow(setMinors, i)} className="w-9 h-9 rounded-[4px] flex items-center justify-center text-[#868e96] hover:bg-red-50 hover:text-red-500 transition-colors text-lg flex-shrink-0">×</button>
                      </div>
                      {m.desc.startsWith("Outra:") && (
                        <input type="text" value={m.desc.replace("Outra: ", "")}
                          onChange={e => updRow(setMinors, i, "desc", "Outra: " + e.target.value)}
                          className={inputCls + " mb-3"} placeholder="Digite a causa de diminuição" />
                      )}
                    </div>
                  ))}
                  <button onClick={() => addRow(setMinors)} className="text-sm font-medium text-brand-600 hover:text-brand-700 transition-colors">+ Adicionar minorante</button>
                </div>
                {hasData && (
                  <div className={`mt-4 rounded-[4px] p-4 space-y-1 border ${phaseResultBg[3]}`}>
                    <p className="text-xs">Pena intermediária: {fmt(penInter)}</p>
                    {minAtivos.map((m,i) => <p key={i} className="text-sm text-green-600">Minorante {m.frac}: × {(1-FV[m.frac]).toFixed(4)}</p>)}
                    {tentativa && tentativaFrac in FV && <p className="text-sm text-green-600">Tentativa {tentativaFrac}: × {(1-FV[tentativaFrac]).toFixed(4)}</p>}
                    {majAtivos.map((m,i) => <p key={i} className="text-sm text-red-600">Majorante {m.frac}: × {(1+FV[m.frac]).toFixed(4)}</p>)}
                    <p className="font-extrabold text-lg">Pena definitiva: {fmt(penDef)}</p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Multa */}
          <MultaSection multa={multa} setMulta={setMulta} />

          {/* Prescrição e Detração */}
          <PrescricaoDetracao
            detMeses={detMeses}
            setDetMeses={setDetMeses}
            penDef={penDef}
            penRem={penRem}
            hasData={hasData}
            tipoNorm={tipoNorm}
            reincNorm={reincNorm}
            hediondo={hediondo}
            perSaltum={perSaltum}
            reincEspec={reincEspec}
            presc={presc}
            setPresc={setPresc}
            medidaSeg={medidaSeg}
            setMedidaSeg={setMedidaSeg}
          />

          {/* Resultado Final */}
          <ResultadoFinal
            penBase={penBase} penInter={penInter} penDef={penDef} penRem={penRem}
            detAnos={detAnos} detMeses={detMeses} negN={negN} min={min} max={max}
            hasData={hasData} regime={regime} regiF={regiF}
            cabeSub={cabeSub} subCondicional={subCondicional}
            sursis={sursis} sursisEt={sursisEt}
            prescAbst={prescAbst} prescConc={prescConc}
            classi={classi} obs={obs} agravs={agravs} atens={atens}
            majors={majors} minors={minors} tipoNorm={tipoNorm}
            reincNorm={reincNorm} hediondo={hediondo}
            tentativa={tentativa} tentativaFrac={tentativaFrac}
            multa={multa} medidaSeg={medidaSeg} presc={presc}
          />

          {hasData && (
            <div className="bg-white rounded-[4px] p-5 border border-brand-100 text-center">
              <p className="text-sm text-[#495057] mb-3">Use a pena definitiva calculada aqui como pena individual de um dos crimes na aba Concurso.</p>
              <button
                type="button"
                onClick={addPenaAtualAoConcurso}
                className="inline-flex items-center h-[42px] px-5 bg-brand-500 hover:bg-brand-600 text-white font-semibold text-sm rounded-[4px] transition-colors"
              >
                Adicionar pena ao concurso
              </button>
            </div>
          )}
        </div>
      )}

      {/* ========== CONCURSO ========== */}
      {tab === "concurso" && <ConcursoSection crimesList={crimesList} crimes={concursoCrimes} setCrimes={setConcursoCrimes} config={concursoConfig} setConfig={setConcursoConfig} />}

      {/* ========== REFERÊNCIAS E SÚMULAS ========== */}
      {tab === "calc" && (
        <div className="space-y-3 mt-5">
          <div className={`bg-white rounded-[4px] border transition-colors duration-150 overflow-hidden ${
            openReferenceAccordion === "refs" ? "border-brand-500" : "border-[#dee2e6]"
          }`}>
            <button
              onClick={() => toggleReferenceAccordion("refs")}
              className="w-full flex items-center gap-3 px-4 py-4 text-left hover:bg-[#f8f9fa] transition-colors"
            >
              <div className="flex-1 min-w-0">
                <div className="font-semibold text-sm text-[#212529]">Leis de referência</div>
                <div className="text-xs text-[#868e96]">Bases legais, regime inicial e prescrição</div>
              </div>
              <span className={`text-[#868e96] transition-transform duration-200 text-sm ${openReferenceAccordion === "refs" ? "rotate-180" : ""}`}>▼</span>
            </button>
            {openReferenceAccordion === "refs" && (
              <div className="px-4 pb-4 border-t border-[#dee2e6] animate-[fadeIn_0.25s_ease]">
                <div className="space-y-3 mt-4">
          {[
            { t: "Art. 59, CP — Circunstâncias Judiciais (1ª Fase)",
              c: "O juiz, atendendo à culpabilidade, aos antecedentes, à conduta social, à personalidade do agente, aos motivos, às circunstâncias e consequências do crime, bem como ao comportamento da vítima, estabelecerá, conforme seja necessário e suficiente para reprovação e prevenção do crime:\nI – as penas aplicáveis;\nII – a quantidade de pena aplicável dentro dos limites previstos;\nIII – o regime inicial de cumprimento da pena;\nIV – a substituição da pena privativa de liberdade." },
            { t: "Art. 68, CP — Sistema Trifásico",
              c: "A pena-base será fixada atendendo-se ao critério do art. 59 deste Código; em seguida serão consideradas as circunstâncias atenuantes e agravantes; por último, as causas de diminuição e de aumento.\n\nParágrafo único: No concurso de causas de aumento ou de diminuição previstas na Parte Especial, pode o juiz limitar-se a um só aumento ou a uma só diminuição, prevalecendo, todavia, a causa que mais aumente ou diminua." },
            { t: "Arts. 61–62, CP — Circunstâncias Agravantes (2ª Fase)",
              c: "Art. 61. São circunstâncias que sempre agravam a pena:\nI – a reincidência;\nII – ter o agente cometido o crime: a) por motivo torpe; b) por motivo fútil; c) para facilitar ou assegurar execução, ocultação, impunidade ou vantagem de outro crime; d) à traição, de emboscada, ou mediante dissimulação; e) com emprego de veneno, fogo, explosivo, tortura ou meio cruel; f) contra ascendente, descendente, irmão ou cônjuge; g) com abuso de autoridade, relação doméstica, coabitação ou hospitalidade; h) com abuso de poder ou violação de dever; i) contra criança, maior de 60 anos, enfermo ou mulher grávida; j) quando o ofendido estava sob proteção da autoridade; l) em ocasião de calamidade pública; m) em estado de embriaguez preordenada.\n\nArt. 62. Agravam-se ainda a pena do agente que: I) promoveu ou organizou a cooperação; II) coagiu ou induziu outrem; III) instigou a cometer o crime; IV) executou mediante paga." },
            { t: "Arts. 65–66, CP — Circunstâncias Atenuantes (2ª Fase)",
              c: "Art. 65. São circunstâncias que sempre atenuam a pena:\nI – ser o agente menor de 21 anos na data do fato, ou maior de 70 na sentença, salvo se o crime envolver violência sexual contra a mulher;\nII – o desconhecimento da lei;\nIII – ter o agente: a) cometido o crime por motivo de relevante valor social ou moral; b) procurado, por sua espontânea vontade, com eficiência, evitar ou minorar as consequências do crime, ou ter, antes do julgamento, reparado o dano; c) cometido o crime sob coação resistível, em cumprimento de ordem de autoridade superior, ou sob influência de violenta emoção provocada por ato injusto da vítima; d) confessado espontaneamente a autoria do crime perante a autoridade; e) cometido o crime sob a influência de multidão em tumulto, se não o provocou.\n\nArt. 66. A pena poderá ser ainda atenuada em razão de qualquer outra circunstância relevante, anterior ou posterior ao crime, embora não prevista expressamente em lei." },
            { t: "Art. 67, CP — Concurso de Agravantes e Atenuantes",
              c: "No concurso de agravantes e atenuantes, a pena deve aproximar-se do limite indicado pelas circunstâncias preponderantes, entendendo-se como tais as que resultam dos motivos determinantes do crime, da personalidade do agente e da reincidência." },
            { t: "Art. 33, CP — Regimes de Cumprimento",
              c: "A pena de reclusão deve ser cumprida em regime fechado, semiaberto ou aberto. A de detenção, em regime semiaberto ou aberto, salvo necessidade de transferência a regime fechado.\n\n§ 2º – Critérios:\na) pena > 8 anos → regime fechado obrigatório;\nb) não reincidente, pena 4–8 anos → pode iniciar em semiaberto;\nc) não reincidente, pena ≤ 4 anos → pode iniciar em aberto.\n\n§ 3º – A determinação do regime inicial far-se-á com observância dos critérios do art. 59 (circunstâncias judiciais)." },
            { t: "Art. 44, CP — Substituição por Restritivas de Direitos",
              c: "Requisitos cumulativos:\nI – pena ≤ 4 anos e crime sem violência ou grave ameaça (ou qualquer pena se culposo);\nII – réu não reincidente em crime doloso;\nIII – culpabilidade, antecedentes, conduta social, personalidade, motivos e circunstâncias indiquem suficiência.\n\n§ 2º: pena ≤ 1 ano → multa ou uma restritiva; pena > 1 ano → uma restritiva + multa ou duas restritivas.\n§ 3º: Reincidente pode ser substituído se socialmente recomendável e a reincidência não ocorreu pela prática do mesmo crime.\n\nEspécies (art. 43): prestação pecuniária, perda de bens e valores, limitação de fim de semana, prestação de serviço à comunidade ou entidades públicas, interdição temporária de direitos." },
            { t: "Art. 77, CP — Sursis (Suspensão Condicional da Pena)",
              c: "A execução da pena privativa de liberdade não superior a 2 anos poderá ser suspensa por 2 a 4 anos.\nRequisitos: não reincidente em crime doloso; circunstâncias do art. 59 indiquem suficiência.\n\nSursis etário (§ 2º): pena ≤ 4 anos → condenado maior de 70 anos.\nSursis humanitário (§ 2º): pena ≤ 4 anos → razões de saúde." },
            { t: "Art. 42, CP — Detração Penal",
              c: "Computam-se, na pena privativa de liberdade e na medida de segurança, o tempo de prisão provisória, no Brasil ou no estrangeiro, o de prisão administrativa e o de internação em qualquer dos estabelecimentos referidos no artigo anterior." },
            { t: "Art. 98, CP — Medida de Segurança",
              c: "Na hipótese do parágrafo único do art. 26 e necessitando o condenado de especial tratamento curativo, a pena privativa de liberdade pode ser substituída por internação ou tratamento ambulatorial, pelo prazo mínimo de 1 a 3 anos." },
            { t: "Art. 49, CP — Multa",
              c: "A pena de multa consiste no pagamento ao fundo penitenciário da quantia fixada na sentença e calculada em dias-multa.\n\nCaput: mínimo de 10 e máximo de 360 dias-multa.\n§ 1º: o valor do dia-multa não pode ser inferior a 1/30 do maior salário mínimo mensal vigente ao tempo do fato, nem superior a 5 vezes esse salário.\n§ 2º: o valor da multa será atualizado, quando da execução, pelos índices de correção monetária." },
            { t: "Art. 112, LEP — Progressão de Regime",
              c: "Regra de execução penal fora dos arquivos CP/CPP de referência. Use esta seção como estimativa e confira a Lei de Execução Penal vigente antes de usar em peça ou sentença." },
            { t: "Art. 109, CP — Prescrição da Pretensão Punitiva",
              c: "A prescrição regula-se pelo máximo da pena privativa de liberdade cominada ao crime:\nI – 20 anos, se o máximo > 12 anos;\nII – 16 anos, se > 8 até 12 anos;\nIII – 12 anos, se > 4 até 8 anos;\nIV – 8 anos, se > 2 até 4 anos;\nV – 4 anos, se igual a 1 ano ou, sendo superior, não excede 2 anos;\nVI – 3 anos, se < 1 ano.\n\nArt. 115, CP: redução à metade para réu menor de 21 anos ao tempo do crime ou maior de 70 na sentença, salvo violência sexual contra a mulher.\nArt. 110, § 1º: prescrição retroativa regula-se pela pena aplicada." },
            { t: "Art. 14, II e parágrafo único, CP — Tentativa",
              c: "Diz-se o crime:\nII – tentado, quando iniciada a execução, não se consuma por circunstâncias alheias à vontade do agente.\n\nParágrafo único: Pune-se a tentativa com a pena correspondente ao crime consumado, diminuída de 1/3 a 2/3.\n\nCritério: quanto mais próximo da consumação, menor a fração de redução. Quanto mais distante, maior a redução." },
          ].map((r,i) => (
            <div key={i} className="bg-white rounded-[4px] p-4 border border-[#dee2e6]">
              <h3 className="font-bold text-brand-600 text-sm mb-2">{r.t}</h3>
              <pre className="text-sm text-[#212529] whitespace-pre-wrap font-sans leading-relaxed">{r.c}</pre>
            </div>
          ))}

          {/* Tabela Regime */}
          <div className="bg-white rounded-[4px] p-4 border border-[#dee2e6]">
            <h3 className="font-bold text-brand-600 text-sm mb-3">Tabela — Regime Inicial (Art. 33, § 2º, CP)</h3>
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="bg-[#f8f9fa]">
                  <th className="border border-[#dee2e6] p-2 text-left font-medium">Pena definitiva</th>
                  <th className="border border-[#dee2e6] p-2 text-center font-medium">Primário (reclusão)</th>
                  <th className="border border-[#dee2e6] p-2 text-center font-medium">Reincidente (reclusão)</th>
                  <th className="border border-[#dee2e6] p-2 text-center font-medium">Detenção</th>
                </tr>
              </thead>
              <tbody>
                {[
                  ["Até 4 anos", "Aberto", "Semiaberto*", "Aberto"],
                  ["4 a 8 anos", "Semiaberto", "Semiaberto/Fechado*", "Semiaberto"],
                  ["Acima de 8 anos", "Fechado", "Fechado", "Semiaberto**"],
                ].map(([p, pr, re, det], i) => (
                  <tr key={i} className={i%2===0?"":"bg-[#f8f9fa]"}>
                    <td className="border border-[#dee2e6] p-2 font-semibold text-[#212529]">{p}</td>
                    {[pr, re, det].map((v,j) => (
                      <td key={j} className={`border border-[#dee2e6] p-2 text-center font-semibold ${v==="Fechado"?"text-red-600":v==="Semiaberto"||v==="Semiaberto*"||v==="Fechado*"?"text-amber-600":"text-emerald-600"}`}>{v}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
            <p className="text-xs text-[#868e96] mt-2">* Súmula 269/STJ: reincidente ≤ 4 anos pode ter semiaberto se favoráveis as circ. judiciais. ** Detenção não admite fechado como regime inicial (art. 33, caput).</p>
          </div>

          {/* Tabela Prescrição */}
          <div className="bg-white rounded-[4px] p-4 border border-[#dee2e6]">
            <h3 className="font-bold text-brand-600 text-sm mb-3">Tabela — Prescrição (Art. 109, CP)</h3>
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="bg-[#f8f9fa]">
                  <th className="border border-[#dee2e6] p-2 text-left font-medium">Pena máxima abstrata / concreta</th>
                  <th className="border border-[#dee2e6] p-2 text-center font-medium">Prazo</th>
                  <th className="border border-[#dee2e6] p-2 text-center font-medium">Reduzido à metade (art. 115)</th>
                </tr>
              </thead>
              <tbody>
                {PRESCRICAO.map((r,i) => (
                  <tr key={i} className={i%2===0?"":"bg-[#f8f9fa]"}>
                    <td className="border border-[#dee2e6] p-2 text-[#212529]">{r.faixa}</td>
                    <td className="border border-[#dee2e6] p-2 text-center font-bold text-[#212529]">{r.prazo} anos</td>
                    <td className="border border-[#dee2e6] p-2 text-center text-brand-600">{r.prazo/2} anos</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <p className="text-xs text-[#868e96] mt-2">Art. 115: redução à metade se o réu era menor de 21 anos ao tempo do crime ou maior de 70 na sentença.</p>
          </div>
                </div>
              </div>
            )}
          </div>

          <div className={`bg-white rounded-[4px] border transition-colors duration-150 overflow-hidden ${
            openReferenceAccordion === "sumulas" ? "border-brand-500" : "border-[#dee2e6]"
          }`}>
            <button
              onClick={() => toggleReferenceAccordion("sumulas")}
              className="w-full flex items-center gap-3 px-4 py-4 text-left hover:bg-[#f8f9fa] transition-colors"
            >
              <div className="flex-1 min-w-0">
                <div className="font-semibold text-sm text-[#212529]">Súmulas utilizadas</div>
                <div className="text-xs text-[#868e96]">Entendimentos aplicados à dosimetria</div>
              </div>
              <span className={`text-[#868e96] transition-transform duration-200 text-sm ${openReferenceAccordion === "sumulas" ? "rotate-180" : ""}`}>▼</span>
            </button>
            {openReferenceAccordion === "sumulas" && (
              <div className="px-4 pb-4 border-t border-[#dee2e6] animate-[fadeIn_0.25s_ease]">
                <div className="space-y-3 mt-4">
          <Info color="blue" title="Entenda a utilização das súmulas">
            Cada súmula indica a fase em que é aplicada. Verifique se o fundamento da circunstância já foi usado em outra fase (bis in idem) antes de aplicar.
          </Info>
          {SUMULAS.map((s,i) => (
            <div key={i} className="bg-white rounded-[4px] p-4 border border-[#dee2e6]">
              <div className="flex items-center gap-2 mb-2">
                <span className="font-bold text-brand-600 text-sm">{s.id}</span>
                <Pill color={s.cor as Color}>{s.fase}</Pill>
              </div>
              <p className="text-sm text-[#212529] leading-relaxed italic">"{s.text}"</p>
            </div>
          ))}
          <div className="bg-white rounded-[4px] p-4 border border-[#dee2e6]">
            <h3 className="font-bold text-base text-[#212529] mb-3">Outros entendimentos relevantes</h3>
            <div className="space-y-3 text-sm text-[#212529] leading-relaxed">
              <p><strong>Art. 64, I, CP — Período depurador:</strong> Não prevalece a condenação anterior se entre a data do cumprimento ou extinção da pena e a infração posterior tiver decorrido período de tempo superior a 5 anos. Após o período depurador, a condenação gera maus antecedentes (1ª fase), não reincidência (2ª fase).</p>
              <p><strong>Progressão de regime (art. 112, LEP):</strong> Não reincidente em crime doloso → 1/6 da pena. Reincidente → 1/4 da pena. Crimes hediondos sem resultado morte (primário) → 2/5. Crimes hediondos com resultado morte (primário) → 3/5.</p>
              <p><strong>Maus antecedentes:</strong> Inquéritos e ações em curso não servem (Súmula 444/STJ). Exige condenação transitada em julgado fora do período depurador.</p>
              <p><strong>Confissão qualificada (STJ):</strong> O réu que confessa o fato mas alega excludente de ilicitude ou culpabilidade também tem direito à atenuante, desde que a confissão tenha sido usada para a condenação (Súmula 545/STJ).</p>
            </div>
          </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========== AUDITORIA ========== */}
      {tab === "audit" && (
        <div className="space-y-4">
          <Info color="blue" title="Como auditar">
            Esta seção reproduz cada passo do cálculo com os valores exatos em anos decimais (base: 1 ano = 360 dias = 12 meses). Use-a para confrontar com a sentença ou identificar divergências.
          </Info>
          {!hasData ? (
            <div className="bg-white rounded-[4px] p-8 text-center text-[#868e96] border border-[#dee2e6] text-sm">
              Preencha a moldura penal na aba Calculadora para ver o log de auditoria.
            </div>
          ) : (
            <>
              <div className="bg-[#1a1b1e] rounded-[4px] p-4">
                <h3 className="text-xs font-bold text-[#909296] uppercase tracking-wider mb-3">Log de Cálculo</h3>
                <div className="space-y-1 font-mono">
                  {audit.map((line, i) => (
                    <p key={i} className={`text-[13px] ${line.startsWith("PENA")||line.startsWith("REGIME")||line.startsWith("SUBSTITUICAO")||line.startsWith("SURSIS")||line.startsWith("PRESCRICAO") ? "text-amber-400 font-bold" : "text-emerald-400"}`}>
                      {String(i+1).padStart(2,"0")}. {line}
                    </p>
                  ))}
                </div>
              </div>

              <div className="bg-white rounded-[4px] p-4 border border-[#dee2e6]">
                <h3 className="font-bold text-base text-[#212529] mb-3">Vetores do Art. 59 — Classificação e Fundamento</h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm border-collapse">
                    <thead>
                      <tr className="bg-[#f8f9fa]">
                        <th className="border border-[#dee2e6] p-2 text-left font-medium">Vetor</th>
                        <th className="border border-[#dee2e6] p-2 text-center font-medium">Classificação</th>
                        <th className="border border-[#dee2e6] p-2 text-left font-medium">Fundamento fático</th>
                        <th className="border border-[#dee2e6] p-2 text-center font-medium">Impacto</th>
                      </tr>
                    </thead>
                    <tbody>
                      {VETORES.map((v,i) => (
                        <tr key={i} className={i%2===0?"":"bg-[#f8f9fa]"}>
                          <td className="border border-[#dee2e6] p-2 font-semibold text-[#212529]">{v.name}</td>
                          <td className={`border border-[#dee2e6] p-2 text-center font-semibold ${classi[i]==="desfavoravel"?"text-red-600":classi[i]==="favoravel"?"text-emerald-600":"text-[#868e96]"}`}>
                            {classi[i]==="desfavoravel"?"Desfavorável":classi[i]==="favoravel"?"Favorável":"Neutro"}
                          </td>
                          <td className="border border-[#dee2e6] p-2 text-[#495057]">{obs[i]||"—"}</td>
                          <td className="border border-[#dee2e6] p-2 text-center">
                            {classi[i]==="desfavoravel" ? <span className="text-red-600 font-semibold">+{fmt(acPorVetor)}</span> : "—"}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="bg-white rounded-[4px] p-4 border border-[#dee2e6]">
                <h3 className="font-bold text-base text-[#212529] mb-3">Fórmulas Utilizadas</h3>
                <div className="bg-[#f8f9fa] rounded-[4px] p-4 font-mono text-sm text-[#212529] space-y-1.5 leading-relaxed">
                  <p><strong>1ª fase (pena-base):</strong> min + (N_neg × intervalo ÷ 8)</p>
                  <p><strong>Agravante:</strong> penBase × fração</p>
                  <p><strong>Atenuante:</strong> penBase × fração → resultado ≥ mínimo e ≤ máximo legal (Súm. 231/STJ)</p>
                  <p><strong>2ª fase (pena intermediária):</strong> penBase + Σagravantes − Σatenuantes → limitada ao intervalo legal</p>
                  <p><strong>Minorante:</strong> penAnterior × (1 − fração)</p>
                  <p><strong>Majorante:</strong> penAnterior × (1 + fração)</p>
                  <p><strong>3ª fase (pena definitiva):</strong> após todas as causas (pode sair da moldura)</p>
                  <p><strong>Tentativa (art. 14, parágrafo único):</strong> minorante automática conforme iter criminis</p>
                  <p><strong>Detração:</strong> penDef − (meses ÷ 12)</p>
                  <p><strong>Prescrição abstrata:</strong> tabela art. 109 sobre pena máxima do tipo penal</p>
                  <p><strong>Prescrição concreta:</strong> tabela art. 109 sobre pena definitiva aplicada</p>
                </div>
                <div className="mt-3 bg-brand-50 border border-brand-200 rounded-[4px] p-3 text-sm text-brand-800">
                  <p><strong>Convenções:</strong> 1 ano = 12 meses = 360 dias (ano comercial) · Fração STJ (2ª fase): 1/6 padrão</p>
                </div>
                <div className="mt-2 bg-amber-50 border border-amber-200 rounded-[4px] p-3 text-sm text-amber-800">
                  <p><strong>Nota sobre prescrição:</strong> O cálculo da prescrição abstrata usa a "pena máxima" inserida acima. Ajuste o campo se a moldura aplicável for diferente do tipo penal em abstrato (Art. 109, CP).</p>
                </div>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
