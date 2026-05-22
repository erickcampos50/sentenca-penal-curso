import { useState, type ReactNode } from "react";

const VETORES = [
  { name: "Culpabilidade", art: "Art. 59, CP",
    desc: "Grau de reprovabilidade da conduta. Avalia a intensidade do dolo, a consciência da ilicitude e o nível de exigibilidade de conduta diversa. Não se confunde com culpabilidade como elemento do crime.",
    desfavoravel: "Dolo direto de elevada intensidade, premeditação acentuada, persistência na conduta ilícita, alta exigibilidade de conduta diversa.",
    alerta: "Não confundir com reincidência (2ª fase) nem com circunstâncias do crime. Elementos já usados como qualificadora não podem fundamentar este vetor." },
  { name: "Antecedentes", art: "Art. 59, CP",
    desc: "Vida pregressa criminal do réu. Considera condenações transitadas em julgado que não configurem reincidência (fora do período depurador de 5 anos — art. 64, I, CP).",
    desfavoravel: "Condenações anteriores transitadas em julgado que não gerem reincidência (período depurador expirado). Folha de antecedentes é suficiente (Súmula 636/STJ).",
    alerta: "Súmula 444/STJ: vedado uso de inquéritos e ações sem trânsito em julgado. Súmula 241/STJ: reincidência não pode ser agravante e circunstância judicial simultaneamente." },
  { name: "Conduta Social", art: "Art. 59, CP",
    desc: "Comportamento do réu no trabalho, família e comunidade. Avalia sua inserção social, relações familiares e vida profissional.",
    desfavoravel: "Histórico de condutas antissociais comprovadas nos autos, conflitos familiares graves, comportamento comunitário nocivo.",
    alerta: "Exige prova concreta. Meras suposições, estigmas sociais ou ausência de prova não fundamentam vetor negativo. Risco de estereotipagem." },
  { name: "Personalidade", art: "Art. 59, CP",
    desc: "Traços de caráter e temperamento revelados pelo comportamento: agressividade, impulsividade, frieza, calculismo.",
    desfavoravel: "Personalidade voltada ao crime, frieza durante execução, crueldade, calculismo extremo evidenciado nos autos.",
    alerta: "Vetor muito criticado doutrinariamente (direito penal do autor). Exige fundamento concreto. Alto risco de bis in idem com culpabilidade e circunstâncias do crime." },
  { name: "Motivos", art: "Art. 59, CP",
    desc: "Razão determinante da prática criminosa. Motivo torpe ou fútil agrava; motivo nobre pode favorecer; razão egoística neutra.",
    desfavoravel: "Motivo torpe, fútil, ganância excessiva, vingança desproporcional, discriminação.",
    alerta: "Verificar se o motivo já é elementar do tipo ou qualificadora (ex: motivo fútil no homicídio qualificado). Neste caso, vetor neutro — bis in idem." },
  { name: "Circunstâncias do Crime", art: "Art. 59, CP",
    desc: "Modo, lugar, tempo, instrumentos e demais aspectos que cercam o fato. Caráter residual — tudo que não se enquadra nas demais.",
    desfavoravel: "Modus operandi especialmente gravoso, local estratégico para dificultar socorro, tempo escolhido para facilitar impunidade.",
    alerta: "Não usar fatos que já fundamentam qualificadoras, majorantes ou outras circunstâncias judiciais. Bis in idem é o erro mais frequente neste vetor." },
  { name: "Consequências do Crime", art: "Art. 59, CP",
    desc: "Resultados concretos do crime além dos elementos do tipo penal. Dano moral, patrimonial, social acima do normal do delito.",
    desfavoravel: "Dano excepcionalmente elevado, sequelas permanentes, impacto social amplo, número elevado de vítimas.",
    alerta: "Consequências inerentes ao tipo não podem ser usadas (ex: morte no homicídio, subtração no furto). Apenas o que extrapola o resultado típico normal." },
  { name: "Comportamento da Vítima", art: "Art. 59, CP",
    desc: "Contribuição da vítima para o crime. Tipicamente favorável ao réu (quando houve provocação) ou neutro.",
    desfavoravel: "Raramente desfavorável ao réu. Vetor quase sempre neutro ou favorável.",
    alerta: "Se a vítima contribuiu para o crime, este vetor é FAVORÁVEL ao réu. Não usar negativamente sem fundamento sólido — seria punir o acusado pelo comportamento alheio." },
];

const AGRAVANTES_LIST = [
  { code: "Art. 61, I", desc: "Reincidência" },
  { code: "Art. 61, II, a", desc: "Motivo torpe" },
  { code: "Art. 61, II, b", desc: "Motivo fútil" },
  { code: "Art. 61, II, c", desc: "Facilitar ou assegurar execução, ocultação ou impunidade de outro crime" },
  { code: "Art. 61, II, d", desc: "Traição, emboscada, dissimulação ou recurso que dificultou a defesa" },
  { code: "Art. 61, II, e", desc: "Emprego de veneno, fogo, explosivo, tortura ou meio cruel" },
  { code: "Art. 61, II, f", desc: "Contra ascendente, descendente, irmão ou cônjuge" },
  { code: "Art. 61, II, g", desc: "Abuso de autoridade, relação doméstica, coabitação ou hospitalidade" },
  { code: "Art. 61, II, h", desc: "Abuso de poder ou violação de dever de cargo, ofício, ministério ou profissão" },
  { code: "Art. 61, II, i", desc: "Contra criança, maior de 60 anos, enfermo ou mulher grávida" },
  { code: "Art. 61, II, j", desc: "Quando o ofendido estava sob proteção imediata da autoridade" },
  { code: "Art. 61, II, l", desc: "Em ocasião de incêndio, naufrágio, inundação ou calamidade pública" },
  { code: "Art. 61, II, m", desc: "Em estado de embriaguez preordenada" },
  { code: "Art. 62, I", desc: "Promoveu ou organizou a cooperação no crime" },
  { code: "Art. 62, II", desc: "Coagiu ou induziu outrem à prática do crime" },
  { code: "Art. 62, III", desc: "Instigou ou determinou a cometer o crime" },
  { code: "Art. 62, IV", desc: "Executou mediante paga ou promessa de recompensa" },
];

const ATENUANTES_LIST = [
  { code: "Art. 65, I", desc: "Menor de 21 anos na data do fato" },
  { code: "Art. 65, I", desc: "Maior de 70 anos na data da sentença" },
  { code: "Art. 65, II", desc: "Desconhecimento da lei" },
  { code: "Art. 65, III, a", desc: "Motivo de relevante valor social ou moral" },
  { code: "Art. 65, III, b", desc: "Arrependimento eficaz ou arrependimento posterior" },
  { code: "Art. 65, III, c", desc: "Coação resistível ou cumprimento de ordem de superior hierárquico" },
  { code: "Art. 65, III, d", desc: "Confissão espontânea da autoria (Súmula 545/STJ)" },
  { code: "Art. 65, III, e", desc: "Influência de multidão em tumulto" },
  { code: "Art. 66", desc: "Circunstância relevante anterior ou posterior ao crime (inominada)" },
];

const SUMULAS = [
  { id: "Súmula 231/STJ", fase: "2ª fase", cor: "yellow",
    text: "A incidência da circunstância atenuante não pode conduzir à redução da pena abaixo do mínimo legal." },
  { id: "Súmula 241/STJ", fase: "1ª/2ª fase", cor: "yellow",
    text: "A reincidência penal não pode ser considerada como circunstância agravante e, simultaneamente, como circunstância judicial." },
  { id: "Súmula 269/STJ", fase: "Regime", cor: "green",
    text: "É admissível a adoção do regime prisional semi-aberto aos reincidentes condenados a pena igual ou inferior a quatro anos se favoráveis as circunstâncias judiciais." },
  { id: "Súmula 440/STJ", fase: "Regime", cor: "green",
    text: "Fixada a pena-base no mínimo legal, é vedado o estabelecimento de regime prisional mais gravoso do que o cabível em razão da sanção imposta, com base apenas na gravidade abstrata do delito." },
  { id: "Súmula 444/STJ", fase: "1ª fase", cor: "red",
    text: "É vedada a utilização de inquéritos policiais e ações penais em curso para agravar a pena-base." },
  { id: "Súmula 545/STJ", fase: "2ª fase", cor: "yellow",
    text: "Quando a confissão for utilizada para a formação do convencimento do julgador, o réu fará jus à atenuante prevista no art. 65, III, d, do CP." },
  { id: "Súmula 630/STJ", fase: "2ª fase", cor: "yellow",
    text: "A incidência da atenuante da confissão espontânea no crime de tráfico ilícito de entorpecentes exige o reconhecimento da traficância pelo acusado, não bastando a mera admissão da posse para uso próprio." },
  { id: "Súmula 636/STJ", fase: "1ª fase", cor: "red",
    text: "A folha de antecedentes criminais é documento suficiente a comprovar os maus antecedentes e a reincidência." },
  { id: "Súmula 718/STF", fase: "Regime", cor: "green",
    text: "A opinião do julgador sobre a gravidade em abstrato do crime não constitui motivação idônea para a imposição de regime mais severo do que o permitido segundo a pena aplicada." },
  { id: "Súmula 719/STF", fase: "Regime", cor: "green",
    text: "A imposição do regime de cumprimento mais severo do que a pena aplicada permitir exige motivação idônea." },
  { id: "Tema 585/STJ", fase: "2ª fase", cor: "yellow",
    text: "É possível a compensação integral da atenuante da confissão espontânea com a agravante da reincidência, seja ela específica ou não. Nos casos de multirreincidência, deve ser reconhecida a preponderância da reincidência." },
  { id: "Súmula 497/STF", fase: "Prescrição", cor: "blue",
    text: "Quando se tratar de crime continuado, a prescrição regula-se pela pena imposta na sentença, não se computando o acréscimo decorrente da continuação." },
];

const PRESCRICAO = [
  { faixa: "Acima de 12 anos", prazo: 20 },
  { faixa: "Acima de 8 até 12 anos", prazo: 16 },
  { faixa: "Acima de 4 até 8 anos", prazo: 12 },
  { faixa: "Acima de 2 até 4 anos", prazo: 8 },
  { faixa: "1 ano até 2 anos", prazo: 4 },
  { faixa: "Inferior a 1 ano", prazo: 3 },
];

const FRACS = ["1/8","1/6","1/5","1/4","1/3","1/2"] as const;
const FV: Record<string, number> = { "1/8":1/8,"1/6":1/6,"1/5":1/5,"1/4":1/4,"1/3":1/3,"1/2":1/2 };

function prescPrazo(anos: number): number {
  if (anos > 12) return 20;
  if (anos > 8) return 16;
  if (anos > 4) return 12;
  if (anos > 2) return 8;
  if (anos >= 1) return 4;
  return 3;
}

function fmt(anos: number): string {
  if (!anos || anos <= 0) return "0 dias";
  const totalD = Math.round(anos * 360);
  const a = Math.floor(totalD / 360);
  const m = Math.floor((totalD % 360) / 30);
  const d = totalD % 30;
  const p: string[] = [];
  if (a > 0) p.push(`${a} ano${a !== 1 ? "s" : ""}`);
  if (m > 0) p.push(`${m} ${m !== 1 ? "meses" : "mês"}`);
  if (d > 0) p.push(`${d} dia${d !== 1 ? "s" : ""}`);
  return p.join(", ") || "0 dias";
}

type Color = "blue" | "yellow" | "red" | "green" | "gray";

const COLOR_MAP: Record<Color, string> = {
  blue: "bg-blue-50 border-blue-200 text-blue-800",
  yellow: "bg-yellow-50 border-yellow-200 text-yellow-800",
  red: "bg-red-50 border-red-200 text-red-800",
  green: "bg-green-50 border-green-200 text-green-800",
  gray: "bg-gray-50 border-gray-200 text-gray-700",
};

const PILL_MAP: Record<Color, string> = {
  red: "bg-red-100 text-red-700",
  green: "bg-green-100 text-green-700",
  yellow: "bg-yellow-100 text-yellow-700",
  blue: "bg-blue-100 text-blue-700",
  gray: "bg-gray-100 text-gray-600",
};

interface InfoProps {
  color?: Color;
  title?: string;
  children: ReactNode;
}

interface PillProps {
  color: Color;
  children: ReactNode;
}

const Info = ({ color = "blue", title, children }: InfoProps) => {
  const c = COLOR_MAP[color];
  return <div className={`border rounded-lg p-3 text-xs ${c} mb-3`}>{title && <p className="font-bold mb-1">{title}</p>}{children}</div>;
};

const Pill = ({ color, children }: PillProps) => {
  const c = PILL_MAP[color];
  return <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${c}`}>{children}</span>;
};

interface RowItem {
  desc: string;
  frac: string;
}

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
  const [openV, setOpenV] = useState<number | null>(null);

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
  const acPorVetor = (negN > 0 && intv > 0) ? intv / 8 : 0;
  const penBase = hasData ? Math.min(min + negN * acPorVetor, max) : 0;

  // Fase 2 — com validação de frações e teto no máximo legal (Art. 68, § 2º, CP)
  const agAtivos = agravs.filter(a => a.desc?.trim() && a.frac in FV);
  const atAtivos = atens.filter(a => a.desc?.trim() && a.frac in FV);
  let agSum = 0, atSum = 0;
  agAtivos.forEach(a => { agSum += penBase * FV[a.frac]; });
  atAtivos.forEach(a => { atSum += penBase * FV[a.frac]; });
  const penInter = hasData ? Math.min(Math.max(penBase + agSum - atSum, min), max) : 0;

  // Fase 3 — com validação de frações
  let penDef = penInter;
  const minAtivos = minors.filter(m => m.desc?.trim() && m.frac in FV);
  const majAtivos = majors.filter(m => m.desc?.trim() && m.frac in FV);
  minAtivos.forEach(m => { penDef = penDef * (1 - FV[m.frac]); });
  majAtivos.forEach(m => { penDef = penDef * (1 + FV[m.frac]); });
  penDef = Math.max(penDef, 0);

  // Detração — com validação de não-negatividade
  const detMesesNum = parseFloat(detMeses);
  const detAnos = !isNaN(detMesesNum) && detMesesNum >= 0 ? detMesesNum / 12 : 0;
  const penRem = Math.max(penDef - detAnos, 0);

  // Regime — com tratamento de prisão simples (Art. 34, CP)
  let regime: string = "—", regiF = "";
  if (hasData) {
    if (tipoNorm === "prisão simples") {
      regime = "Aberto";
      regiF = "Art. 34, CP — prisão simples admite apenas regime aberto.";
    } else if (tipoNorm === "detenção") {
      regime = penDef <= 4 ? "Aberto" : "Semiaberto";
      regiF = "Art. 33, caput — detenção não admite regime fechado inicial.";
    } else if (penDef > 8) {
      regime = "Fechado"; regiF = "Art. 33, § 2º, a — pena > 8 anos → fechado obrigatório.";
    } else if (penDef > 4) {
      regime = reincNorm ? "Fechado" : "Semiaberto";
      regiF = reincNorm
        ? "Art. 33, § 2º, b c/c § 3º. Reincidente pode ter regime agravado. Súm. 269/STJ: semiaberto cabível se favoráveis as circunstâncias."
        : "Art. 33, § 2º, b — pena 4–8 anos, réu primário → semiaberto.";
    } else {
      regime = reincNorm ? "Semiaberto" : "Aberto";
      regiF = reincNorm
        ? "Art. 33, § 2º, c c/c § 3º — reincidente não inicia em aberto. Súm. 269/STJ: semiaberto se favoráveis as circunstâncias judiciais."
        : "Art. 33, § 2º, c — pena ≤ 4 anos, réu primário → aberto.";
    }
  }

  // Substituição
  const cabeSub = penDef > 0 && penDef <= 4 && !violNorm && !reincNorm;
  const subCondicional = penDef > 0 && penDef <= 4 && !violNorm && reincNorm;

  // Sursis
  const sursis = penDef > 0 && penDef <= 2 && !reincNorm;
  const sursisEt = penDef > 0 && penDef <= 4 && !reincNorm;

  // Prescrição
  const prescAbst = max > 0 ? prescPrazo(max) : null;
  const prescConc = penDef > 0 ? prescPrazo(penDef) : null;

  const addRow = (set: React.Dispatch<React.SetStateAction<RowItem[]>>) => set(p => [...p, { desc: "", frac: "1/6" }]);
  const remRow = (set: React.Dispatch<React.SetStateAction<RowItem[]>>, i: number) => set(p => p.filter((_, j) => j !== i));
  const updRow = (set: React.Dispatch<React.SetStateAction<RowItem[]>>, i: number, k: keyof RowItem, v: string) => set(p => { const n = [...p]; n[i] = { ...n[i], [k]: v }; return n; });

  const regCor: Record<string, string> = { Aberto:"text-green-400", Semiaberto:"text-yellow-400", Fechado:"text-red-400", "—":"text-gray-400" };

  const audit = hasData ? [
    `MOLDURA: min = ${min} anos | max = ${max} anos | intervalo = ${intv.toFixed(4)} anos`,
    `INTERVALO ÷ 8 = ${(intv/8).toFixed(4)} anos por vetor negativo`,
    `FASE 1: ${negN} vetor(es) negativo(s) × ${(intv/8).toFixed(4)} = +${(negN*acPorVetor).toFixed(4)} anos`,
    `PENA-BASE: ${min} + ${(negN*acPorVetor).toFixed(4)} = ${penBase.toFixed(4)} anos → ${fmt(penBase)}`,
    agAtivos.length ? `AGRAVANTES: penBase(${penBase.toFixed(4)}) × [${agAtivos.map(a=>a.frac).join(" + ")}] = +${agSum.toFixed(4)} anos` : null,
    atAtivos.length ? `ATENUANTES: penBase(${penBase.toFixed(4)}) × [${atAtivos.map(a=>a.frac).join(" + ")}] = -${atSum.toFixed(4)} anos (mínimo ${min} anos — Súmula 231/STJ)` : null,
    `PENA INTERMEDIÁRIA: ${penBase.toFixed(4)} + ${agSum.toFixed(4)} - ${atSum.toFixed(4)} = ${penInter.toFixed(4)} anos → ${fmt(penInter)}`,
    ...minAtivos.map((m,i)=>`MINORANTE ${i+1} (${m.frac}): × ${(1-FV[m.frac]).toFixed(4)}`),
    ...majAtivos.map((m,i)=>`MAJORANTE ${i+1} (${m.frac}): × ${(1+FV[m.frac]).toFixed(4)}`),
    `PENA DEFINITIVA: ${penDef.toFixed(4)} anos → ${fmt(penDef)}`,
    detAnos > 0 ? `DETRAÇÃO (art. 42): ${penDef.toFixed(4)} - ${detAnos.toFixed(4)} = ${penRem.toFixed(4)} anos → ${fmt(penRem)}` : null,
    `REGIME INICIAL: ${regime} (${regiF})`,
    `SUBSTITUIÇÃO (art. 44): ${subTxt}`,
    sursis ? `SURSIS (art. 77): Cabível — sursis simples (pena ≤ 2 anos)` : sursisEt ? `SURSIS (art. 77, § 2º): Verificar sursis etário ou humanitário (pena ≤ 4 anos)` : `SURSIS (art. 77): Não cabível`,
    prescAbst ? `PRESCRIÇÃO ABSTRATA (art. 109 CP): pena máx. ${max} anos → prazo de ${prescAbst} anos` : null,
    prescConc ? `PRESCRIÇÃO CONCRETA (art. 109 CP): pena def. ${penDef.toFixed(2)} anos → prazo de ${prescConc} anos` : null,
  ].filter((line): line is string => line !== null) : [];

  const tabs = [
    { id:"calc", label:"📐 Calculadora" },
    { id:"refs", label:"📖 Lei" },
    { id:"sumulas", label:"⚖️ Súmulas" },
    { id:"audit", label:"🔍 Auditoria" },
  ];

  return (
    <div className="max-w-3xl mx-auto p-3 font-sans text-sm text-gray-800 bg-gray-50 min-h-screen">
      <div className="text-center mb-4">
        <h1 className="text-xl font-bold text-gray-900">⚖️ Dosimetria Penal — Sistema Trifásico</h1>
        <p className="text-xs text-gray-500">Art. 68, CP · Método de Nelson Hungria · Cálculo auditável com fundamento legal</p>
      </div>

      <div className="flex gap-1 mb-4 bg-white rounded-lg p-1 shadow-sm border border-gray-200">
        {tabs.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className={`flex-1 text-xs py-1.5 rounded font-medium transition-colors ${tab===t.id ? "bg-blue-600 text-white" : "text-gray-600 hover:bg-gray-100"}`}>
            {t.label}
          </button>
        ))}
      </div>

      {/* ========== CALCULADORA ========== */}
      {tab === "calc" && (
        <div className="space-y-4">

          {/* Moldura */}
          <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
            <h2 className="font-bold text-sm mb-2">1. Moldura Penal</h2>
            <Info color="blue">
              Identifique o tipo penal aplicável. Se houver qualificadora, use a pena da forma qualificada — ela altera a própria moldura, não entra na 3ª fase.
            </Info>
            <div className="grid grid-cols-2 gap-3 mb-3">
              {[(["Pena mínima (anos)", penMin, setPenMin] as [string, string, React.Dispatch<React.SetStateAction<string>>]), (["Pena máxima (anos)", penMax, setPenMax] as [string, string, React.Dispatch<React.SetStateAction<string>>])].map(([lbl, val, set]) => (
                <div key={lbl}>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">{lbl}</label>
                  <input type="number" min="0" step="0.5" value={val} onChange={e => set(e.target.value)}
                    className="w-full border border-gray-300 rounded px-2 py-1.5 text-sm focus:outline-none focus:border-blue-400" placeholder="ex: 1" />
                </div>
              ))}
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Tipo de pena</label>
                <select value={tipo} onChange={e => setTipo(e.target.value)}
                  className="w-full border border-gray-300 rounded px-2 py-1.5 text-sm bg-white focus:outline-none focus:border-blue-400">
                  <option value="reclusão">Reclusão</option>
                  <option value="detenção">Detenção</option>
                  <option value="prisão simples">Prisão simples</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Reincidente?</label>
                <select value={reincidente} onChange={e => setReincidente(e.target.value)}
                  className="w-full border border-gray-300 rounded px-2 py-1.5 text-sm bg-white focus:outline-none focus:border-blue-400">
                  <option value="nao">Não (primário)</option>
                  <option value="sim">Sim (reincidente)</option>
                </select>
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Crime com violência ou grave ameaça?</label>
              <select value={violencia} onChange={e => setViolencia(e.target.value)}
                className="w-full border border-gray-300 rounded px-2 py-1.5 text-sm bg-white focus:outline-none focus:border-blue-400">
                <option value="nao">Não</option>
                <option value="sim">Sim</option>
              </select>
            </div>
            {hasData && (
              <div className="mt-3 bg-gray-50 rounded p-2 text-xs text-gray-600 border">
                Intervalo: <strong>{fmt(intv)}</strong> · Cada vetor negativo acresce: <strong>{fmt(intv/8)}</strong> (intervalo ÷ 8)
              </div>
            )}
          </div>

          {/* Fase 1 */}
          <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
            <h2 className="font-bold text-sm mb-1">2. Primeira Fase — Pena-Base (Art. 59, CP)</h2>
            <p className="text-xs text-gray-500 mb-3">Clique em cada vetor para ver o que o torna desfavorável e os riscos de bis in idem.</p>
            <div className="space-y-2">
              {VETORES.map((v, i) => (
                <div key={i} className="border border-gray-200 rounded-lg overflow-hidden">
                  <div className="flex items-center gap-2 p-2.5 cursor-pointer hover:bg-gray-50"
                    onClick={() => setOpenV(openV === i ? null : i)}>
                    <span className="text-xs font-semibold text-gray-700 w-44 shrink-0">{v.name}</span>
                    <select value={classi[i]}
                      onClick={e => e.stopPropagation()}
                      onChange={e => { const n=[...classi]; n[i]=e.target.value; setClassi(n); }}
                      className="border border-gray-300 rounded px-2 py-1 text-xs bg-white focus:outline-none">
                      <option value="neutro">Neutro</option>
                      <option value="favoravel">Favorável</option>
                      <option value="desfavoravel">Desfavorável ↑</option>
                    </select>
                    {classi[i]==="desfavoravel" && <Pill color="red">+{fmt(acPorVetor)}</Pill>}
                    {classi[i]==="favoravel" && <Pill color="green">Favorável</Pill>}
                    <span className="ml-auto text-gray-400 text-xs">{openV===i?"▲":"▼"}</span>
                  </div>
                  {openV===i && (
                    <div className="bg-gray-50 border-t border-gray-200 p-3 text-xs space-y-2">
                      <p><strong className="text-gray-700">Base legal:</strong> {v.art}</p>
                      <p><strong className="text-gray-700">O que avalia:</strong> {v.desc}</p>
                      <p><strong className="text-red-600">Desfavorável quando:</strong> {v.desfavoravel}</p>
                      <div className="bg-yellow-50 border border-yellow-200 rounded p-2 text-yellow-800">
                        ⚠️ <strong>Alerta:</strong> {v.alerta}
                      </div>
                      <div>
                        <label className="font-semibold text-gray-700 block mb-1">Fundamento fático nos autos (para auditoria):</label>
                        <input className="w-full border border-gray-300 rounded px-2 py-1 text-xs focus:outline-none"
                          placeholder="Descreva o fato concreto que sustenta a classificação..."
                          value={obs[i]} onChange={e => { const n=[...obs]; n[i]=e.target.value; setObs(n); }} />
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
            {hasData && (
              <div className="mt-3 bg-blue-50 border border-blue-200 rounded p-3 text-xs space-y-1">
                <p>Vetores negativos: <strong>{negN}</strong> de 8 · Fórmula: min + (N × intervalo ÷ 8)</p>
                <p>Cálculo: {min} + ({negN} × {(intv/8).toFixed(4)}) = {penBase.toFixed(4)} anos</p>
                <p className="font-bold text-blue-800 text-sm">Pena-base: {fmt(penBase)}</p>
              </div>
            )}
          </div>

          {/* Fase 2 */}
          <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
            <h2 className="font-bold text-sm mb-1">3. Segunda Fase — Agravantes e Atenuantes (Arts. 61–66, CP)</h2>
            <Info color="yellow" title="⚠️ Regras obrigatórias nesta fase">
              <ul className="space-y-1">
                <li>• <strong>Súmula 231/STJ:</strong> atenuante não reduz abaixo do mínimo legal.</li>
                <li>• <strong>Súmula 241/STJ:</strong> reincidência não pode ser agravante E circunstância judicial simultaneamente.</li>
                <li>• <strong>Fração padrão STJ:</strong> 1/6 quando a lei não fixa fração específica.</li>
                <li>• <strong>Tema 585/STJ:</strong> confissão espontânea compensa integralmente a agravante de reincidência (salvo multirreincidência).</li>
                <li>• <strong>Art. 67, CP:</strong> circunstâncias preponderantes (motivos determinantes, personalidade, reincidência) prevalecem no concurso.</li>
              </ul>
            </Info>
            <div className="mb-4">
              <p className="text-xs font-bold text-red-600 mb-2">Agravantes (arts. 61–62, CP)</p>
              {agravs.map((a, i) => (
                <div key={i} className="flex gap-2 mb-2 items-center">
                  <select value={a.desc} onChange={e => updRow(setAgravs, i, "desc", e.target.value)}
                    className="flex-1 border border-gray-300 rounded px-2 py-1 text-xs bg-white focus:outline-none">
                    <option value="">— selecione a agravante —</option>
                    {AGRAVANTES_LIST.map(ag => (
                      <option key={ag.code+ag.desc} value={`${ag.code}: ${ag.desc}`}>{ag.code}: {ag.desc}</option>
                    ))}
                    <option value="Legislação especial">Legislação especial</option>
                  </select>
                  <select value={a.frac} onChange={e => updRow(setAgravs, i, "frac", e.target.value)}
                    className="w-16 border border-gray-300 rounded px-1 py-1 text-xs bg-white">
                    {FRACS.map(f => <option key={f}>{f}</option>)}
                  </select>
                  <button onClick={() => remRow(setAgravs, i)} className="text-red-400 font-bold text-sm">✕</button>
                </div>
              ))}
              <button onClick={() => addRow(setAgravs)} className="text-xs text-blue-500 hover:underline">+ Adicionar agravante</button>
            </div>
            <div>
              <p className="text-xs font-bold text-green-600 mb-2">Atenuantes (arts. 65–66, CP)</p>
              {atens.map((a, i) => (
                <div key={i} className="flex gap-2 mb-2 items-center">
                  <select value={a.desc} onChange={e => updRow(setAtens, i, "desc", e.target.value)}
                    className="flex-1 border border-gray-300 rounded px-2 py-1 text-xs bg-white focus:outline-none">
                    <option value="">— selecione a atenuante —</option>
                    {ATENUANTES_LIST.map(at => (
                      <option key={at.code+at.desc} value={`${at.code}: ${at.desc}`}>{at.code}: {at.desc}</option>
                    ))}
                  </select>
                  <select value={a.frac} onChange={e => updRow(setAtens, i, "frac", e.target.value)}
                    className="w-16 border border-gray-300 rounded px-1 py-1 text-xs bg-white">
                    {FRACS.map(f => <option key={f}>{f}</option>)}
                  </select>
                  <button onClick={() => remRow(setAtens, i)} className="text-red-400 font-bold text-sm">✕</button>
                </div>
              ))}
              <button onClick={() => addRow(setAtens)} className="text-xs text-blue-500 hover:underline">+ Adicionar atenuante</button>
            </div>
            {hasData && (
              <div className="mt-3 bg-blue-50 border border-blue-200 rounded p-3 text-xs space-y-1">
                <p>Pena-base: {fmt(penBase)}</p>
                {agAtivos.length > 0 && <p className="text-red-700">+ Agravantes: +{fmt(agSum)}</p>}
                {atAtivos.length > 0 && <p className="text-green-700">- Atenuantes: -{fmt(atSum)} → limitado ao mínimo de {fmt(min)} (Súmula 231/STJ)</p>}
                <p className="font-bold text-blue-800 text-sm">Pena intermediária: {fmt(penInter)}</p>
              </div>
            )}
          </div>

          {/* Fase 3 */}
          <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
            <h2 className="font-bold text-sm mb-1">4. Terceira Fase — Causas de Aumento e Diminuição (Art. 68, CP)</h2>
            <Info color="blue" title="📌 Regras desta fase">
              <ul className="space-y-1">
                <li>• Na 3ª fase, a pena <strong>pode ultrapassar o máximo</strong> ou ficar <strong>abaixo do mínimo</strong> legal.</li>
                <li>• Ordem: aplica-se primeiro as minorantes, depois as majorantes.</li>
                <li>• <strong>Art. 68, parágrafo único:</strong> no concurso de causas de aumento da Parte Especial, o juiz pode limitar-se a um só aumento.</li>
                <li>• <strong>Tentativa (art. 14, II):</strong> redução de 1/3 a 2/3 conforme iter criminis percorrido — quanto mais próximo da consumação, menor a redução.</li>
              </ul>
            </Info>
            <div className="mb-4">
              <p className="text-xs font-bold text-red-600 mb-2">Causas de Aumento (Majorantes)</p>
              {majors.map((m, i) => (
                <div key={i} className="flex gap-2 mb-2 items-center">
                  <input value={m.desc} onChange={e => updRow(setMajors, i, "desc", e.target.value)}
                    className="flex-1 border border-gray-300 rounded px-2 py-1 text-xs focus:outline-none"
                    placeholder="Ex: Art. 157, § 2º, I — emprego de arma" />
                  <select value={m.frac} onChange={e => updRow(setMajors, i, "frac", e.target.value)}
                    className="w-16 border border-gray-300 rounded px-1 py-1 text-xs bg-white">
                    {FRACS.map(f => <option key={f}>{f}</option>)}
                  </select>
                  <button onClick={() => remRow(setMajors, i)} className="text-red-400 font-bold text-sm">✕</button>
                </div>
              ))}
              <button onClick={() => addRow(setMajors)} className="text-xs text-blue-500 hover:underline">+ Adicionar majorante</button>
            </div>
            <div>
              <p className="text-xs font-bold text-green-600 mb-2">Causas de Diminuição (Minorantes)</p>
              {minors.map((m, i) => (
                <div key={i} className="flex gap-2 mb-2 items-center">
                  <input value={m.desc} onChange={e => updRow(setMinors, i, "desc", e.target.value)}
                    className="flex-1 border border-gray-300 rounded px-2 py-1 text-xs focus:outline-none"
                    placeholder="Ex: Tentativa (art. 14, II, CP)" />
                  <select value={m.frac} onChange={e => updRow(setMinors, i, "frac", e.target.value)}
                    className="w-16 border border-gray-300 rounded px-1 py-1 text-xs bg-white">
                    {FRACS.map(f => <option key={f}>{f}</option>)}
                  </select>
                  <button onClick={() => remRow(setMinors, i)} className="text-red-400 font-bold text-sm">✕</button>
                </div>
              ))}
              <button onClick={() => addRow(setMinors)} className="text-xs text-blue-500 hover:underline">+ Adicionar minorante</button>
            </div>
            {hasData && (
              <div className="mt-3 bg-blue-50 border border-blue-200 rounded p-3 text-xs space-y-1">
                <p>Pena intermediária: {fmt(penInter)}</p>
                {minAtivos.map((m,i) => <p key={i} className="text-green-700">Minorante {m.frac}: × {(1-FV[m.frac]).toFixed(4)}</p>)}
                {majAtivos.map((m,i) => <p key={i} className="text-red-700">Majorante {m.frac}: × {(1+FV[m.frac]).toFixed(4)}</p>)}
                <p className="font-bold text-blue-800 text-sm">Pena definitiva: {fmt(penDef)}</p>
              </div>
            )}
          </div>

          {/* Detração */}
          <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
            <h2 className="font-bold text-sm mb-1">5. Detração Penal (Art. 42, CP)</h2>
            <Info color="gray">
              Computa-se na pena privativa de liberdade o tempo de prisão provisória, prisão administrativa e internação. A detração pode alterar o regime inicial e os marcos de progressão de regime.
            </Info>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Tempo de prisão provisória (meses)</label>
              <input type="number" min="0" value={detMeses} onChange={e => setDetMeses(e.target.value)}
                className="w-full border border-gray-300 rounded px-2 py-1.5 text-sm focus:outline-none focus:border-blue-400" placeholder="ex: 6" />
            </div>
            {detAnos > 0 && hasData && (
              <div className="mt-2 bg-blue-50 border border-blue-200 rounded p-2 text-xs">
                {fmt(penDef)} − {fmt(detAnos)} = <strong>{fmt(penRem)}</strong> (pena remanescente)
              </div>
            )}
          </div>

          {/* Resultado */}
          {hasData && (
            <div className="bg-gray-900 rounded-xl p-4 shadow-lg">
              <h2 className="font-bold text-white text-sm border-b border-gray-700 pb-2 mb-3">📋 Resultado Final</h2>
              <div className="space-y-2 text-xs">
                {[
                  ["Pena-base (1ª fase)", fmt(penBase), `Art. 59, CP · ${negN} vetor(es) negativo(s)`],
                  ["Pena intermediária (2ª fase)", fmt(penInter), `Agravantes/Atenuantes · Súmula 231/STJ aplicada`],
                  ["Pena definitiva (3ª fase)", fmt(penDef), `Causas de aumento/diminuição · Art. 68, CP`],
                  ...(detAnos > 0 ? [["Pena remanescente (pós-detração)", fmt(penRem), `Art. 42, CP · ${detMeses} meses deduzidos`]] : []),
                ].map(([lbl, val, sub]) => (
                  <div key={lbl as string} className="bg-gray-800 rounded-lg px-3 py-2">
                    <p className="text-gray-400">{lbl as string}</p>
                    <p className="text-lg font-bold text-yellow-300">{val as string}</p>
                    <p className="text-gray-500">{sub as string}</p>
                  </div>
                ))}
                <div className="grid grid-cols-2 gap-2 pt-1">
                  <div className="bg-gray-800 rounded-lg p-2">
                    <p className="text-gray-400 text-xs">Regime inicial</p>
                    <p className={`font-bold text-sm ${regCor[regime]}`}>{regime}</p>
                    <p className="text-gray-500 text-xs mt-1">{regiF}</p>
                  </div>
                  <div className="bg-gray-800 rounded-lg p-2">
                    <p className="text-gray-400 text-xs">Substituição (art. 44)</p>
                    <p className={`font-bold text-xs mt-1 ${cabeSub ? "text-green-400" : subCondicional ? "text-yellow-400" : "text-red-400"}`}>{subTxt}</p>
                    {subQuant && <p className="text-gray-500 text-xs mt-0.5">{subQuant}</p>}
                  </div>
                  <div className="bg-gray-800 rounded-lg p-2">
                    <p className="text-gray-400 text-xs">Sursis (art. 77)</p>
                    <p className={`font-bold text-xs mt-1 ${sursis ? "text-green-400" : sursisEt ? "text-yellow-400" : "text-red-400"}`}>
                      {sursis ? "✓ Cabível — sursis simples (≤ 2 anos)" : sursisEt ? "⚠ Verificar sursis etário/humanitário" : "✕ Não cabível"}
                    </p>
                  </div>
                  <div className="bg-gray-800 rounded-lg p-2">
                    <p className="text-gray-400 text-xs">Prescrição (art. 109)</p>
                    <p className="text-blue-300 font-bold text-xs mt-1">Abstrata: {prescAbst} anos</p>
                    {prescConc && <p className="text-blue-200 text-xs">Concreta: {prescConc} anos</p>}
                  </div>
                </div>
              </div>
              <p className="text-xs text-gray-500 mt-3 border-t border-gray-700 pt-2">
                ⚠️ Cálculo estimativo. A dosimetria definitiva depende de fundamentação concreta nos autos e discricionariedade judicial motivada.
              </p>
            </div>
          )}
        </div>
      )}

      {/* ========== REFERÊNCIAS LEGAIS ========== */}
      {tab === "refs" && (
        <div className="space-y-3">
          {[
            { t: "Art. 59, CP — Circunstâncias Judiciais (1ª Fase)",
              c: "O juiz, atendendo à culpabilidade, aos antecedentes, à conduta social, à personalidade do agente, aos motivos, às circunstâncias e consequências do crime, bem como ao comportamento da vítima, estabelecerá, conforme seja necessário e suficiente para reprovação e prevenção do crime:\nI – as penas aplicáveis;\nII – a quantidade de pena aplicável dentro dos limites previstos;\nIII – o regime inicial de cumprimento da pena;\nIV – a substituição da pena privativa de liberdade." },
            { t: "Art. 68, CP — Sistema Trifásico",
              c: "A pena-base será fixada atendendo-se ao critério do art. 59 deste Código; em seguida serão consideradas as circunstâncias atenuantes e agravantes; por último, as causas de diminuição e de aumento.\n\nParágrafo único: No concurso de causas de aumento ou de diminuição previstas na Parte Especial, pode o juiz limitar-se a um só aumento ou a uma só diminuição, prevalecendo, todavia, a causa que mais aumente ou diminua." },
            { t: "Arts. 61–62, CP — Circunstâncias Agravantes (2ª Fase)",
              c: "Art. 61. São circunstâncias que sempre agravam a pena:\nI – a reincidência;\nII – ter o agente cometido o crime: a) por motivo torpe; b) por motivo fútil; c) para facilitar ou assegurar execução, ocultação, impunidade ou vantagem de outro crime; d) à traição, de emboscada, ou mediante dissimulação; e) com emprego de veneno, fogo, explosivo, tortura ou meio cruel; f) contra ascendente, descendente, irmão ou cônjuge; g) com abuso de autoridade, relação doméstica, coabitação ou hospitalidade; h) com abuso de poder ou violação de dever; i) contra criança, maior de 60 anos, enfermo ou mulher grávida; j) quando o ofendido estava sob proteção da autoridade; l) em ocasião de calamidade pública; m) em estado de embriaguez preordenada.\n\nArt. 62. Agravam-se ainda a pena do agente que: I) promoveu ou organizou a cooperação; II) coagiu ou induziu outrem; III) instigou a cometer o crime; IV) executou mediante paga." },
            { t: "Arts. 65–66, CP — Circunstâncias Atenuantes (2ª Fase)",
              c: "Art. 65. São circunstâncias que sempre atenuam a pena:\nI – ser o agente menor de 21 anos na data do fato, ou maior de 70 na sentença;\nII – o desconhecimento da lei;\nIII – ter o agente: a) cometido o crime por motivo de relevante valor social ou moral; b) procurado, por sua espontânea vontade, com eficiência, evitar ou minorar as consequências do crime, ou ter, antes do julgamento, reparado o dano; c) cometido o crime sob coação resistível ou em cumprimento de ordem de autoridade superior; d) confessado espontaneamente a autoria do crime perante a autoridade; e) cometido o crime sob a influência de multidão em tumulto.\n\nArt. 66. A pena poderá ser ainda atenuada em razão de qualquer outra circunstância relevante, anterior ou posterior ao crime, embora não prevista expressamente em lei." },
            { t: "Art. 67, CP — Concurso de Agravantes e Atenuantes",
              c: "No concurso de agravantes e atenuantes, a pena deve aproximar-se do limite indicado pelas circunstâncias preponderantes, entendendo-se como tais as que resultam dos motivos determinantes do crime, da personalidade do agente e da reincidência." },
            { t: "Art. 33, CP — Regimes de Cumprimento",
              c: "A pena de reclusão deve ser cumprida em regime fechado, semiaberto ou aberto. A de detenção, em regime semiaberto ou aberto, salvo necessidade de transferência a regime fechado.\n\n§ 2º – Critérios:\na) pena > 8 anos → regime fechado obrigatório;\nb) não reincidente, pena 4–8 anos → pode iniciar em semiaberto;\nc) não reincidente, pena ≤ 4 anos → pode iniciar em aberto.\n\n§ 3º – A determinação do regime inicial far-se-á com observância dos critérios do art. 59 (circunstâncias judiciais)." },
            { t: "Art. 44, CP — Substituição por Restritivas de Direitos",
              c: "Requisitos cumulativos:\nI – pena ≤ 4 anos e crime sem violência ou grave ameaça (ou qualquer pena se culposo);\nII – réu não reincidente em crime doloso;\nIII – culpabilidade, antecedentes, conduta social, personalidade, motivos e circunstâncias indiquem suficiência.\n\n§ 2º: pena ≤ 1 ano → 1 restritiva ou multa; pena > 1 ano → 2 restritivas ou 1 restritiva + multa.\n§ 3º: Reincidente pode ser substituído se socialmente recomendável e reincidência não específica.\n\nEspécies (art. 43): prestação pecuniária, perda de bens, prestação de serviços, interdição temporária de direitos, limitação de fim de semana." },
            { t: "Art. 77, CP — Sursis (Suspensão Condicional da Pena)",
              c: "A execução da pena privativa de liberdade não superior a 2 anos poderá ser suspensa por 2 a 4 anos.\nRequisitos: não reincidente em crime doloso; circunstâncias do art. 59 indiquem suficiência.\n\nSursis etário (§ 2º): pena ≤ 4 anos → condenado maior de 70 anos.\nSursis humanitário (§ 2º): pena ≤ 4 anos → razões de saúde." },
            { t: "Art. 42, CP — Detração Penal",
              c: "Computam-se, na pena privativa de liberdade e na medida de segurança, o tempo de prisão provisória, no Brasil ou no estrangeiro, o de prisão administrativa e o de internação em qualquer dos estabelecimentos referidos no artigo anterior." },
            { t: "Art. 109, CP — Prescrição da Pretensão Punitiva",
              c: "A prescrição regula-se pelo máximo da pena privativa de liberdade cominada ao crime:\nI – 20 anos, se o máximo > 12 anos;\nII – 16 anos, se > 8 até 12 anos;\nIII – 12 anos, se > 4 até 8 anos;\nIV – 8 anos, se > 2 até 4 anos;\nV – 4 anos, se 1 a 2 anos;\nVI – 3 anos, se < 1 ano.\n\nArt. 115, CP: redução à metade para réu menor de 21 anos na data do fato ou maior de 70 na sentença.\nArt. 110, § 1º: prescrição retroativa regula-se pela pena concreta." },
            { t: "Art. 14, II, CP — Tentativa",
              c: "Diz-se o crime:\nII – tentado, quando iniciada a execução, não se consuma por circunstâncias alheias à vontade do agente.\n\nParágrafo único: Pune-se a tentativa com a pena correspondente ao crime consumado, diminuída de 1/3 a 2/3.\n\nCritério: quanto mais próximo da consumação, menor a fração de redução. Quanto mais distante, maior a redução." },
          ].map((r,i) => (
            <div key={i} className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
              <h3 className="font-bold text-blue-700 text-xs mb-2">{r.t}</h3>
              <pre className="text-xs text-gray-700 whitespace-pre-wrap font-sans leading-relaxed">{r.c}</pre>
            </div>
          ))}

          {/* Tabela Regime */}
          <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
            <h3 className="font-bold text-blue-700 text-xs mb-3">Tabela — Regime Inicial (Art. 33, § 2º, CP)</h3>
            <table className="w-full text-xs border-collapse">
              <thead>
                <tr className="bg-gray-100">
                  <th className="border border-gray-200 p-2 text-left">Pena definitiva</th>
                  <th className="border border-gray-200 p-2 text-center">Primário (reclusão)</th>
                  <th className="border border-gray-200 p-2 text-center">Reincidente (reclusão)</th>
                  <th className="border border-gray-200 p-2 text-center">Detenção</th>
                </tr>
              </thead>
              <tbody>
                {[
                  ["Até 4 anos", "Aberto", "Semiaberto*", "Aberto"],
                  ["4 a 8 anos", "Semiaberto", "Fechado*", "Semiaberto"],
                  ["Acima de 8 anos", "Fechado", "Fechado", "Semiaberto**"],
                ].map(([p, pr, re, det], i) => (
                  <tr key={i} className={i%2===0?"":"bg-gray-50"}>
                    <td className="border border-gray-200 p-2 font-semibold">{p}</td>
                    {[pr, re, det].map((v,j) => (
                      <td key={j} className={`border border-gray-200 p-2 text-center font-semibold ${v==="Fechado"?"text-red-700":v==="Semiaberto"||v==="Semiaberto*"||v==="Fechado*"?"text-yellow-700":"text-green-700"}`}>{v}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
            <p className="text-xs text-gray-500 mt-2">* Súmula 269/STJ: reincidente ≤ 4 anos pode ter semiaberto se favoráveis as circ. judiciais. ** Detenção não admite fechado como regime inicial (art. 33, caput).</p>
          </div>

          {/* Tabela Prescrição */}
          <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
            <h3 className="font-bold text-blue-700 text-xs mb-3">Tabela — Prescrição (Art. 109, CP)</h3>
            <table className="w-full text-xs border-collapse">
              <thead>
                <tr className="bg-gray-100">
                  <th className="border border-gray-200 p-2 text-left">Pena máxima abstrata / concreta</th>
                  <th className="border border-gray-200 p-2 text-center">Prazo</th>
                  <th className="border border-gray-200 p-2 text-center">Reduzido à metade (art. 115)</th>
                </tr>
              </thead>
              <tbody>
                {PRESCRICAO.map((r,i) => (
                  <tr key={i} className={i%2===0?"":"bg-gray-50"}>
                    <td className="border border-gray-200 p-2">{r.faixa}</td>
                    <td className="border border-gray-200 p-2 text-center font-bold">{r.prazo} anos</td>
                    <td className="border border-gray-200 p-2 text-center text-blue-700">{r.prazo/2} anos</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <p className="text-xs text-gray-500 mt-2">Art. 115: redução à metade se o réu era menor de 21 anos na data do fato ou maior de 70 na data da sentença condenatória.</p>
          </div>
        </div>
      )}

      {/* ========== SÚMULAS ========== */}
      {tab === "sumulas" && (
        <div className="space-y-3">
          <Info color="blue" title="Como usar">
            Cada súmula indica a fase em que é aplicada. Verifique se o fundamento da circunstância já foi usado em outra fase (bis in idem) antes de aplicar.
          </Info>
          {SUMULAS.map((s,i) => (
            <div key={i} className="bg-white rounded-lg p-3 shadow-sm border border-gray-200">
              <div className="flex items-center gap-2 mb-2">
                <span className="font-bold text-blue-700 text-xs">{s.id}</span>
                <Pill color={s.cor as Color}>{s.fase}</Pill>
              </div>
              <p className="text-xs text-gray-700 leading-relaxed italic">"{s.text}"</p>
            </div>
          ))}
          <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
            <h3 className="font-bold text-sm mb-3">Outros entendimentos relevantes</h3>
            <div className="space-y-2 text-xs text-gray-700">
              <p><strong>Art. 64, I, CP — Período depurador:</strong> Não prevalece a condenação anterior se entre a data do cumprimento ou extinção da pena e a infração posterior tiver decorrido período de tempo superior a 5 anos. Após o período depurador, a condenação gera maus antecedentes (1ª fase), não reincidência (2ª fase).</p>
              <p><strong>Progressão de regime (art. 112, LEP):</strong> Não reincidente em crime doloso → 1/6 da pena. Reincidente → 1/4 da pena. Crimes hediondos sem resultado morte (primário) → 2/5. Crimes hediondos com resultado morte (primário) → 3/5.</p>
              <p><strong>Maus antecedentes:</strong> Inquéritos e ações em curso não servem (Súmula 444/STJ). Exige condenação transitada em julgado fora do período depurador.</p>
              <p><strong>Confissão qualificada (STJ):</strong> O réu que confessa o fato mas alega excludente de ilicitude ou culpabilidade também tem direito à atenuante, desde que a confissão tenha sido usada para a condenação (Súmula 545/STJ).</p>
            </div>
          </div>
        </div>
      )}

      {/* ========== AUDITORIA ========== */}
      {tab === "audit" && (
        <div className="space-y-3">
          <Info color="blue" title="🔍 Como auditar">
            Esta seção reproduz cada passo do cálculo com os valores exatos em anos decimais (base: 1 ano = 360 dias = 12 meses). Use-a para confrontar com a sentença ou identificar divergências.
          </Info>
          {!hasData ? (
            <div className="bg-white rounded-lg p-8 text-center text-gray-400 border border-gray-200">
              Preencha a moldura penal na aba Calculadora para ver o log de auditoria.
            </div>
          ) : (
            <>
              <div className="bg-gray-900 rounded-lg p-4">
                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Log de Cálculo</h3>
                <div className="space-y-1 font-mono">
                  {audit.map((line, i) => (
                    <p key={i} className={`text-xs ${line.startsWith("PENA")||line.startsWith("REGIME")||line.startsWith("SUBSTITUIÇÃO")||line.startsWith("SURSIS")||line.startsWith("PRESCRIÇÃO") ? "text-yellow-300 font-bold" : "text-green-300"}`}>
                      {String(i+1).padStart(2,"0")}. {line}
                    </p>
                  ))}
                </div>
              </div>

              <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
                <h3 className="font-bold text-sm mb-3">Vetores do Art. 59 — Classificação e Fundamento</h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-xs border-collapse">
                    <thead>
                      <tr className="bg-gray-100">
                        <th className="border border-gray-200 p-1.5 text-left">Vetor</th>
                        <th className="border border-gray-200 p-1.5 text-center">Classificação</th>
                        <th className="border border-gray-200 p-1.5 text-left">Fundamento fático</th>
                        <th className="border border-gray-200 p-1.5 text-center">Impacto</th>
                      </tr>
                    </thead>
                    <tbody>
                      {VETORES.map((v,i) => (
                        <tr key={i} className={i%2===0?"":"bg-gray-50"}>
                          <td className="border border-gray-200 p-1.5 font-semibold">{v.name}</td>
                          <td className={`border border-gray-200 p-1.5 text-center font-semibold ${classi[i]==="desfavoravel"?"text-red-600":classi[i]==="favoravel"?"text-green-600":"text-gray-500"}`}>
                            {classi[i]==="desfavoravel"?"Desfavorável":classi[i]==="favoravel"?"Favorável":"Neutro"}
                          </td>
                          <td className="border border-gray-200 p-1.5 text-gray-600">{obs[i]||"—"}</td>
                          <td className="border border-gray-200 p-1.5 text-center">
                            {classi[i]==="desfavoravel" ? <span className="text-red-600 font-semibold">+{fmt(acPorVetor)}</span> : "—"}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
                <h3 className="font-bold text-sm mb-3">Fórmulas Utilizadas</h3>
                <div className="bg-gray-50 rounded p-3 font-mono text-xs text-gray-700 space-y-1.5">
                  <p><strong>1ª fase (pena-base):</strong> min + (N_neg × intervalo ÷ 8)</p>
                  <p><strong>Agravante:</strong> penBase × fração</p>
                  <p><strong>Atenuante:</strong> penBase × fração → resultado ≥ mínimo legal (Súm. 231/STJ)</p>
                  <p><strong>2ª fase (pena intermediária):</strong> penBase + Σagravantes − Σatenuantes</p>
                  <p><strong>Minorante:</strong> penAnterior × (1 − fração)</p>
                  <p><strong>Majorante:</strong> penAnterior × (1 + fração)</p>
                  <p><strong>3ª fase (pena definitiva):</strong> após todas as causas (pode sair da moldura)</p>
                  <p><strong>Detração:</strong> penDef − (meses ÷ 12)</p>
                  <p><strong>Prescrição abstrata:</strong> tabela art. 109 sobre pena máxima em abstrato</p>
                  <p><strong>Prescrição concreta/retroativa:</strong> tabela art. 109 sobre pena definitiva</p>
                </div>
                <div className="mt-3 bg-blue-50 rounded p-2 text-xs text-blue-800">
                  <p><strong>Convenções:</strong> 1 ano = 12 meses = 360 dias · Fração STJ (2ª fase): 1/6 padrão · Frações em anos decimais para precisão</p>
                </div>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
