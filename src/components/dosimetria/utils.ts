import { FRACS } from "./data";
import type { Crime, Color, RowItem, ConcursoCrime } from "./types";

export const FV: Record<string, number> = { "1/8":1/8,"1/6":1/6,"1/5":1/5,"1/4":1/4,"1/3":1/3,"1/2":1/2 };

export function prescPrazo(anos: number): number {
  if (anos > 12) return 20;
  if (anos > 8) return 16;
  if (anos > 4) return 12;
  if (anos > 2) return 8;
  if (anos >= 1) return 4;
  return 3;
}

export function fmt(anos: number): string {
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

function convertToYears(val: number, unit: string): number {
  const u = unit.trim().toLowerCase();
  if (u === "anos" || u === "ano") return val;
  if (u === "meses" || u === "mês" || u === "mes") return val / 12;
  if (u === "dias" || u === "dia") return val / 360;
  return val;
}

export function parseCrimeCSV(text: string): Crime[] {
  const lines = text.trim().split("\n");
  const data = lines.slice(1);
  const result: Crime[] = [];
  for (const line of data) {
    const parts = line.split(",");
    if (parts.length === 6) {
      result.push({
        nome: parts[0],
        tipo: parts[1],
        pena_min: parseFloat(parts[2]) || 0,
        pena_max: parseFloat(parts[3]) || 0,
        violento: parts[4].trim() === "sim",
        observacao: parts[5] || "",
      });
    } else if (parts.length === 8) {
      const minVal = parseFloat(parts[2]) || 0;
      const maxVal = parseFloat(parts[4]) || 0;
      result.push({
        nome: parts[0],
        tipo: parts[1],
        pena_min: convertToYears(minVal, parts[3]),
        pena_max: convertToYears(maxVal, parts[5]),
        violento: parts[6].trim() === "sim",
        observacao: parts[7] || "",
      });
    }
  }
  return result;
}

export function calcRegime(
  penDef: number,
  tipoNorm: string,
  reincNorm: boolean,
  hediondo: boolean,
  reincEspec: boolean,
  perSaltum: boolean
): { regime: string; regiF: string } {
  if (hediondo) {
    return {
      regime: "Fechado",
      regiF: "Art. 33, § 1º-A, Lei 13.964/2019 — crime hediondo com resultado morte/lesão grave: regime fechado obrigatório.",
    };
  }
  if (tipoNorm === "prisão simples") {
    return {
      regime: "Aberto",
      regiF: "Art. 34, CP — prisão simples admite apenas regime aberto.",
    };
  }
  if (tipoNorm === "detenção") {
    return {
      regime: penDef <= 4 ? "Aberto" : "Semiaberto",
      regiF: "Art. 33, caput — detenção não admite regime fechado inicial.",
    };
  }
  if (penDef > 8) {
    return {
      regime: "Fechado",
      regiF: "Art. 33, § 2º, a — pena > 8 anos → fechado obrigatório.",
    };
  }
  if (penDef > 4) {
    if (reincNorm) {
      return {
        regime: "Fechado",
        regiF: "Art. 33, § 2º, b c/c § 3º. Reincidente pode ter regime agravado. Súm. 269/STJ: semiaberto cabível se favoráveis as circunstâncias.",
      };
    }
    return {
      regime: "Semiaberto",
      regiF: "Art. 33, § 2º, b — pena 4–8 anos, réu primário → semiaberto.",
    };
  }
  // pena <= 4 anos
  if (perSaltum && reincNorm) {
    return {
      regime: "Fechado",
      regiF: "Regime fechado (per saltum) — entendimento controvertido, admitido em alguns julgados do STJ quando há circunstâncias judiciais desfavoráveis e reincidência.",
    };
  }
  if (reincNorm && reincEspec) {
    return {
      regime: "Fechado ou Semiaberto",
      regiF: "Art. 33, § 3º c/c Lei 13.964/2019 — reincidente específico em crime doloso: regime fixado pelo juiz (fechado ou semiaberto).",
    };
  }
  if (reincNorm) {
    return {
      regime: "Semiaberto",
      regiF: "Art. 33, § 2º, c c/c § 3º — reincidente não inicia em aberto. Súm. 269/STJ: semiaberto se favoráveis as circunstâncias judiciais.",
    };
  }
  return {
    regime: "Aberto",
    regiF: "Art. 33, § 2º, c — pena ≤ 4 anos, réu primário → aberto.",
  };
}

export function calcProgressao(
  penDef: number,
  tipoNorm: string,
  reincNorm: boolean,
  hediondo: boolean
): { frac: string; tempo: string; estimativa: string } {
  let progressFrac = 0;
  let label = "";

  if (hediondo) {
    if (reincNorm) {
      progressFrac = 3 / 5;
      label = "3/5 da pena (hediondo reincidente)";
    } else {
      progressFrac = 2 / 5;
      label = "2/5 da pena (hediondo primário)";
    }
  } else if (tipoNorm === "reclusão") {
    if (penDef > 8) {
      progressFrac = 5 / 6;
      label = "5/6 da pena";
    } else if (penDef > 4) {
      progressFrac = 3 / 5;
      label = "3/5 da pena";
    } else {
      progressFrac = 1 / 2;
      label = "1/2 da pena";
    }
  } else {
    // detenção ou prisão simples
    progressFrac = 1 / 3;
    label = "1/3 da pena";
  }

  if (reincNorm && !hediondo) {
    progressFrac = 1 / 4;
    label = "1/4 da pena (reincidente)";
  }

  const anos = penDef * progressFrac;
  const totalD = Math.round(anos * 360);
  const a = Math.floor(totalD / 360);
  const m = Math.floor((totalD % 360) / 30);
  const d = totalD % 30;

  return {
    frac: label,
    tempo: fmt(anos),
    estimativa: `${a > 0 ? `${a} ano${a !== 1 ? "s" : ""}` : ""}${m > 0 ? ` ${m} ${m !== 1 ? "meses" : "mês"}` : ""}${d > 0 ? ` ${d} dia${d !== 1 ? "s" : ""}` : ""}`.trim() || "0 dias",
  };
}

export function calcConcurso(crimes: ConcursoCrime[]) {
  const ativos = crimes.filter(c => {
    const min = parseFloat(c.penaDef || c.penaMax);
    return !isNaN(min) && min > 0;
  });
  if (ativos.length === 0) return null;

  const penas = ativos.map(c => parseFloat(c.penaDef || c.penaMax) || 0);
  const maxPena = Math.max(...penas);
  const soma = penas.reduce((s, p) => s + p, 0);
  const material = Math.min(soma, 30);
  const formalMin = maxPena + (maxPena * 1 / 6);
  const formalMax = maxPena + (maxPena * 2 / 3);
  const ideal = maxPena;

  return { material, formalMin, formalMax, ideal, maxPena, soma };
}

export function generateRelatorio(
  min: number,
  max: number,
  negN: number,
  acPorVetor: number,
  penBase: number,
  agravs: RowItem[],
  atens: RowItem[],
  agSum: number,
  atSum: number,
  penInter: number,
  minors: RowItem[],
  majors: RowItem[],
  penDef: number,
  detAnos: number,
  penRem: number,
  regime: string,
  regiF: string,
  cabeSub: boolean,
  subCondicional: boolean,
  sursis: boolean,
  sursisEt: boolean,
  prescAbst: number | null,
  prescConc: number | null,
  classi: string[],
  obs: string[],
  tipoNorm: string,
  reincNorm: boolean,
  hediondo: boolean,
  tentativa: boolean,
  tentativaFrac: string,
  multaTotal: string,
  progressao: { frac: string; tempo: string; estimativa: string }
): string {
  const lines: string[] = [];
  lines.push("RELATÓRIO DE DOSIMETRIA DA PENA");
  lines.push("=" .repeat(40));
  lines.push("");
  lines.push("1. MOLDURA PENAL");
  lines.push(`   Pena mínima: ${fmt(min)}`);
  lines.push(`   Pena máxima: ${fmt(max)}`);
  lines.push(`   Tipo: ${tipoNorm}`);
  lines.push(`   Reincidente: ${reincNorm ? "Sim" : "Não"}`);
  lines.push(`   Hediondo: ${hediondo ? "Sim" : "Não"}`);
  lines.push("");
  lines.push("2. PRIMEIRA FASE — PENA-BASE (Art. 59, CP)");
  lines.push(`   Intervalo: ${fmt(max - min)}`);
  lines.push(`   Fração por vetor negativo: ${fmt((max - min) / 8)}`);
  lines.push(`   Vetores desfavoráveis: ${negN} de 8`);
  for (let i = 0; i < 8; i++) {
    if (classi[i] === "desfavoravel") {
      lines.push(`   - ${["Culpabilidade","Antecedentes","Conduta Social","Personalidade","Motivos","Circunstâncias do Crime","Consequências do Crime","Comportamento da Vítima"][i]}: Desfavorável (${obs[i] || "sem fundamento declarado"})`);
    }
  }
  lines.push(`   Pena-base: ${fmt(penBase)}`);
  lines.push("");
  lines.push("3. SEGUNDA FASE — AGRAVANTES E ATENUANTES (Arts. 61-66, CP)");
  const agAtivos = agravs.filter(a => a.desc?.trim() && a.frac in FV);
  const atAtivos = atens.filter(a => a.desc?.trim() && a.frac in FV);
  if (agAtivos.length) {
    agAtivos.forEach(a => lines.push(`   Agravante: ${a.desc} (${a.frac})`));
  } else {
    lines.push("   Nenhuma agravante reconhecida.");
  }
  if (atAtivos.length) {
    atAtivos.forEach(a => lines.push(`   Atenuante: ${a.desc} (${a.frac})`));
  } else {
    lines.push("   Nenhuma atenuante reconhecida.");
  }
  lines.push(`   Pena intermediária: ${fmt(penInter)}`);
  lines.push("");
  lines.push("4. TERCEIRA FASE — CAUSAS DE AUMENTO E DIMINUIÇÃO (Art. 68, CP)");
  const majAtivos = majors.filter(m => m.desc?.trim() && m.frac in FV);
  const minAtivos = minors.filter(m => m.desc?.trim() && m.frac in FV);
  if (majAtivos.length) {
    majAtivos.forEach(m => lines.push(`   Majorante: ${m.desc} (${m.frac})`));
  } else {
    lines.push("   Nenhuma majorante aplicada.");
  }
  if (minAtivos.length) {
    minAtivos.forEach(m => lines.push(`   Minorante: ${m.desc} (${m.frac})`));
  } else {
    lines.push("   Nenhuma minorante aplicada.");
  }
  if (tentativa) {
    lines.push(`   Tentativa (Art. 14, II, CP): redução de ${tentativaFrac}`);
  }
  lines.push(`   Pena definitiva: ${fmt(penDef)}`);
  lines.push("");
  lines.push("5. DETRAÇÃO (Art. 42, CP)");
  if (detAnos > 0) {
    lines.push(`   Tempo de prisão provisória deduzido: ${fmt(detAnos)}`);
    lines.push(`   Pena remanescente: ${fmt(penRem)}`);
  } else {
    lines.push("   Não há detração a aplicar.");
  }
  lines.push("");
  lines.push("6. REGIME INICIAL");
  lines.push(`   Regime: ${regime}`);
  lines.push(`   Fundamento: ${regiF}`);
  if (penRem > 0 && penRem !== penDef) {
    const remReg = calcRegime(penRem, tipoNorm, reincNorm, hediondo, false, false);
    lines.push(`   Regime pós-detração: ${remReg.regime} (${remReg.regiF})`);
  }
  lines.push("");
  lines.push("7. PROGRESSÃO DE REGIME (Art. 112, LEP)");
  lines.push(`   Marco: ${progressao.frac} = ${progressao.tempo}`);
  lines.push("");
  lines.push("8. SUBSTITUIÇÃO E SURSIS");
  lines.push(`   Substituição: ${cabeSub ? "Cabe (Art. 44, CP)" : subCondicional ? "Condicional (Art. 44, § 3º, CP)" : "Não cabe"}`);
  lines.push(`   Sursis: ${sursis ? "Cabe sursis simples (Art. 77, CP)" : sursisEt ? "Verificar sursis etário/humanitário (Art. 77, § 2º, CP)" : "Não cabe"}`);
  lines.push("");
  lines.push("9. PRESCRIÇÃO (Art. 109, CP)");
  if (prescAbst !== null) lines.push(`   Prescrição abstrata: ${prescAbst} anos`);
  if (prescConc !== null) lines.push(`   Prescrição concreta: ${prescConc} anos`);
  lines.push("");
  if (multaTotal && multaTotal !== "R$ 0,00") {
    lines.push("10. MULTA (Art. 76, CP)");
    lines.push(`    Valor total: ${multaTotal}`);
    lines.push("");
  }
  lines.push("=" .repeat(40));
  lines.push("Cálculo realizado pelo sistema trifásico (metodologia tradicional).");
  lines.push("A dosimetria definitiva depende de fundamentação concreta nos autos e discricionariedade judicial motivada.");
  return lines.join("\n");
}

export function regCorMap(regime: string): string {
  const map: Record<string, string> = {
    Aberto: "text-green-400",
    Semiaberto: "text-yellow-400",
    Fechado: "text-red-400",
    "Fechado ou Semiaberto": "text-orange-400",
    "—": "text-gray-400",
  };
  return map[regime] || "text-gray-400";
}
