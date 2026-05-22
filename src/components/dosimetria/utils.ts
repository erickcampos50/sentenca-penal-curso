import { FRACS } from "./data";
import type { Crime, Color, RowItem, ConcursoCrime, ConcursoConfig, ConcursoModalidade } from "./types";

export const FV: Record<string, number> = { "1/8":1/8,"1/6":1/6,"1/5":1/5,"1/4":1/4,"1/3":1/3,"1/2":1/2,"2/3":2/3 };

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
  void hediondo;
  if (tipoNorm === "prisão simples") {
    return {
      regime: "Aberto",
      regiF: "Prisão simples é matéria da Lei de Contravenções Penais, fora do art. 33 do CP; não há regime fechado inicial.",
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
        regime: "Semiaberto ou Fechado",
        regiF: "Art. 33, § 2º, b, reserva o semiaberto ao não reincidente; para reincidente, o regime depende do art. 33, § 3º c/c art. 59, CP.",
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

export function calcConcurso(crimes: ConcursoCrime[], config: ConcursoConfig) {
  const ativos = crimes.filter(c => {
    const pena = parseFloat(c.penaDef);
    return !isNaN(pena) && pena > 0;
  });
  if (ativos.length === 0) return null;

  const penas = ativos.map(c => parseFloat(c.penaDef) || 0);
  const maxPena = Math.max(...penas);
  const soma = penas.reduce((s, p) => s + p, 0);
  const materialUnificado = Math.min(soma, 40);
  const formalFrac = parseFloat(config.aumentoFormal) || 1 / 6;
  const continuadoFrac = parseFloat(config.aumentoContinuado) || 1 / 6;
  const formalExasperado = maxPena * (1 + formalFrac);
  const formalAplicavel = Math.min(formalExasperado, soma, 40);
  const continuadoExasperado = maxPena * (1 + continuadoFrac);
  const continuadoAplicavel = Math.min(continuadoExasperado, 40);
  const ideal = maxPena;
  const modalidadeResultado: Record<ConcursoModalidade, number> = {
    material: materialUnificado,
    "formal-proprio": formalAplicavel,
    "formal-improprio": materialUnificado,
    continuado: continuadoAplicavel,
  };
  const modalidadeFundamento: Record<ConcursoModalidade, string> = {
    material: "Art. 69, CP — duas ou mais ações ou omissões: somam-se as penas.",
    "formal-proprio": "Art. 70, caput, 1ª parte, CP — uma ação ou omissão sem desígnios autônomos: pena mais grave aumentada.",
    "formal-improprio": "Art. 70, caput, 2ª parte, CP — ação ou omissão com desígnios autônomos: aplica-se a soma.",
    continuado: "Art. 71, CP — crimes da mesma espécie nas mesmas condições: pena mais grave aumentada.",
  };

  return {
    material: materialUnificado,
    formal: formalAplicavel,
    formalExasperado,
    continuado: continuadoAplicavel,
    continuadoExasperado,
    ideal,
    maxPena,
    soma,
    penasValidas: ativos.length,
    penasIncompletas: crimes.length - ativos.length,
    resultadoEscolhido: modalidadeResultado[config.modalidade],
    fundamentoEscolhido: modalidadeFundamento[config.modalidade],
  };
}

export function sugerirModalidadeConcurso(config: ConcursoConfig): { modalidade: ConcursoModalidade; motivo: string } | null {
  if (config.umaConduta === "sim") {
    if (config.designiosAutonomos === "sim") {
      return { modalidade: "formal-improprio", motivo: "Uma só conduta com desígnios autônomos aponta para concurso formal impróprio e soma das penas." };
    }
    if (config.designiosAutonomos === "nao") {
      return { modalidade: "formal-proprio", motivo: "Uma só conduta sem desígnios autônomos aponta para concurso formal próprio." };
    }
  }
  if (config.umaConduta === "nao" && config.mesmaEspecie === "sim" && config.mesmasCondicoes === "sim") {
    return { modalidade: "continuado", motivo: "Várias condutas com crimes da mesma espécie e condições semelhantes apontam para continuidade delitiva." };
  }
  if (config.umaConduta === "nao") {
    return { modalidade: "material", motivo: "Várias ações ou omissões sem continuidade delitiva apontam para concurso material." };
  }
  return null;
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
  const vetorNomes = ["Culpabilidade","Antecedentes","Conduta Social","Personalidade","Motivos","Circunstâncias do Crime","Consequências do Crime","Comportamento da Vítima"];
  const lines: string[] = [];

  // Cabeçalho educativo
  lines.push("═══════════════════════════════════════════════════════════════");
  lines.push("  RELATÓRIO DE DOSIMETRIA DA PENA — SISTEMA TRIFÁSICO");
  lines.push("  Art. 68, CP · Metodologia tradicional (8 vetores do Art. 59)");
  lines.push("═══════════════════════════════════════════════════════════════");
  lines.push("");
  lines.push("RESUMO EXECUTIVO");
  lines.push(`  • Pena-base:        ${fmt(penBase)}`);
  lines.push(`  • Pena intermediária:${fmt(penInter)}`);
  lines.push(`  • Pena definitiva:  ${fmt(penDef)}`);
  if (detAnos > 0) lines.push(`  • Após detração:    ${fmt(penRem)}`);
  lines.push(`  • Regime indicado:  ${regime}`);
  lines.push(`  • Substituição:     ${cabeSub ? "cabível" : subCondicional ? "condicionada" : "não cabível"}`);
  lines.push(`  • Sursis:           ${sursis ? "cabível" : sursisEt ? "verificar etário/humanitário" : "não cabível"}`);
  lines.push("");
  lines.push("COMO FUNCIONA A DOSIMETRIA?");
  lines.push("  Antes das fases, define-se a moldura penal aplicável ao tipo.");
  lines.push("  O sistema trifásico divide o cálculo da pena em três fases:");
  lines.push("  1ª FASE: pena-base (Art. 59) — partindo do mínimo, sobe conforme");
  lines.push("           vetores desfavoráveis (máx. 1/8 do intervalo cada);");
  lines.push("  2ª FASE: agravantes e atenuantes (Arts. 61-66) — acrescem ou");
  lines.push("           reduzem sobre a pena-base, limitados ao mínimo/máximo;");
  lines.push("  3ª FASE: majorantes e minorantes (Art. 68) — podem extrapolar");
  lines.push("           o máximo ou ficar abaixo do mínimo.");
  lines.push("  Depois vêm efeitos pós-dosimetria, como detração, regime, sursis,");
  lines.push("  substituição, prescrição, multa e concurso de crimes.");
  lines.push("");
  lines.push("  ⚠️ IMPORTANTE: este aplicativo adota método QUANTITATIVO. A");
  lines.push("     valoração QUALITATIVA (peso diferenciado por intensidade)");
  lines.push("     é responsabilidade do juiz e não pode ser automatizada.");
  lines.push("");

  // Moldura preliminar
  lines.push("┌─────────────────────────────────────────────────────────────┐");
  lines.push("│ ETAPA PRELIMINAR — MOLDURA PENAL                            │");
  lines.push("└─────────────────────────────────────────────────────────────┘");
  lines.push(`   • Pena mínima:  ${fmt(min)}`);
  lines.push(`   • Pena máxima:  ${fmt(max)}`);
  lines.push(`   • Intervalo:    ${fmt(max - min)}`);
  lines.push(`   • Tipo penal:   ${tipoNorm}`);
  lines.push(`   • Reincidente:  ${reincNorm ? "Sim" : "Não (primário)"}`);
  lines.push(`   • Hediondo:     ${hediondo ? "Sim" : "Não"}`);
  lines.push("");

  // 1. Fase 1
  lines.push("┌─────────────────────────────────────────────────────────────┐");
  lines.push("│ 1. PRIMEIRA FASE — PENA-BASE (Art. 59, CP)                  │");
  lines.push("└─────────────────────────────────────────────────────────────┘");
  lines.push(`   Fórmula: min + (N_negativos × intervalo ÷ 8)`);
  lines.push(`   Cálculo: ${fmt(min)} + (${negN} × ${fmt((max - min) / 8)}) = ${fmt(penBase)}`);
  lines.push(`   Vetores desfavoráveis: ${negN} de 8`);
  lines.push("   Classificação:");
  for (let i = 0; i < 8; i++) {
    const status = classi[i] === "desfavoravel" ? "DESFAVORÁVEL ↑" : classi[i] === "favoravel" ? "Favorável" : "Neutro";
    lines.push(`     ${i + 1}. ${vetorNomes[i]}: ${status}`);
    if (classi[i] === "desfavoravel" && obs[i]?.trim()) {
      lines.push(`        Fundamento: ${obs[i]}`);
    }
  }
  lines.push(`   RESULTADO → Pena-base: ${fmt(penBase)}`);
  lines.push("");

  // 2. Fase 2
  lines.push("┌─────────────────────────────────────────────────────────────┐");
  lines.push("│ 2. SEGUNDA FASE — AGRAVANTES E ATENUANTES (Arts. 61-66)     │");
  lines.push("└─────────────────────────────────────────────────────────────┘");
  lines.push(`   Base de cálculo: pena-base = ${fmt(penBase)}`);
  const agAtivos = agravs.filter(a => a.desc?.trim() && a.frac in FV);
  const atAtivos = atens.filter(a => a.desc?.trim() && a.frac in FV);
  if (agAtivos.length) {
    lines.push("   Agravantes reconhecidas:");
    agAtivos.forEach(a => lines.push(`     + ${a.desc} — ${a.frac} de ${fmt(penBase)} = +${fmt(penBase * FV[a.frac])}`));
    lines.push(`     Total agravantes: +${fmt(agSum)}`);
  } else {
    lines.push("   Agravantes: nenhuma reconhecida.");
  }
  if (atAtivos.length) {
    lines.push("   Atenuantes reconhecidas:");
    atAtivos.forEach(a => lines.push(`     - ${a.desc} — ${a.frac} de ${fmt(penBase)} = -${fmt(penBase * FV[a.frac])}`));
    lines.push(`     Total atenuantes: -${fmt(atSum)}`);
    lines.push(`     (limitado ao mínimo legal — Súmula 231/STJ)`);
  } else {
    lines.push("   Atenuantes: nenhuma reconhecida.");
  }
  lines.push(`   RESULTADO → Pena intermediária: ${fmt(penInter)}`);
  lines.push("");

  // 3. Fase 3
  lines.push("┌─────────────────────────────────────────────────────────────┐");
  lines.push("│ 3. TERCEIRA FASE — CAUSAS DE AUMENTO E DIMINUIÇÃO (Art. 68) │");
  lines.push("└─────────────────────────────────────────────────────────────┘");
  lines.push("   Ordem adotada: primeiro minorantes, incluindo tentativa, depois majorantes.");
  lines.push("   (nesta fase a pena pode ultrapassar o máximo ou ficar abaixo do mínimo legal)");
  const majAtivos = majors.filter(m => m.desc?.trim() && m.frac in FV);
  const minAtivos = minors.filter(m => m.desc?.trim() && m.frac in FV);
  if (minAtivos.length) {
    lines.push("   Minorantes (diminuem a pena):");
    minAtivos.forEach(m => lines.push(`     × ${m.desc} — ${m.frac} (pena × ${(1 - FV[m.frac]).toFixed(4)})`));
  } else {
    lines.push("   Minorantes: nenhuma aplicada.");
  }
  if (tentativa && tentativaFrac in FV) {
    lines.push(`   Tentativa (art. 14, parágrafo único, CP): redução de ${tentativaFrac} (pena × ${(1 - FV[tentativaFrac]).toFixed(4)})`);
  }
  if (majAtivos.length) {
    lines.push("   Majorantes (aumentam a pena):");
    majAtivos.forEach(m => lines.push(`     × ${m.desc} — ${m.frac} (pena × ${(1 + FV[m.frac]).toFixed(4)})`));
  } else {
    lines.push("   Majorantes: nenhuma aplicada.");
  }
  lines.push(`   RESULTADO → Pena definitiva: ${fmt(penDef)}`);
  if (penDef > max) {
    lines.push(`   ⚠️ Atenção: pena definitiva (${fmt(penDef)}) ultrapassa o máximo legal (${fmt(max)}).`);
    lines.push(`      Isso é permitido na 3ª fase quando há majorantes específicas.`);
  }
  if (penDef > 0 && penDef < min) {
    lines.push(`   ⚠️ Atenção: pena definitiva (${fmt(penDef)}) ficou abaixo do mínimo legal (${fmt(min)}).`);
    lines.push(`      Isso é permitido na 3ª fase quando há minorantes, como tentativa.`);
  }
  lines.push("");

  // Pós-dosimetria: Detração
  lines.push("┌─────────────────────────────────────────────────────────────┐");
  lines.push("│ PÓS-DOSIMETRIA — DETRAÇÃO (Art. 42, CP)                     │");
  lines.push("└─────────────────────────────────────────────────────────────┘");
  if (detAnos > 0) {
    lines.push(`   Tempo de prisão provisória: ${fmt(detAnos)}`);
    lines.push(`   Fórmula: pena definitiva - prisao provisoria`);
    lines.push(`   Calculo: ${fmt(penDef)} - ${fmt(detAnos)} = ${fmt(penRem)}`);
    lines.push(`   RESULTADO → Pena remanescente: ${fmt(penRem)}`);
  } else {
    lines.push("   Não há detração a aplicar.");
    lines.push(`   Pena remanescente = pena definitiva = ${fmt(penDef)}`);
  }
  lines.push("");

  // Pós-dosimetria: Regime
  lines.push("┌─────────────────────────────────────────────────────────────┐");
  lines.push("│ PÓS-DOSIMETRIA — REGIME INICIAL (Art. 33, CP)               │");
  lines.push("└─────────────────────────────────────────────────────────────┘");
  lines.push(`   Regime: ${regime}`);
  lines.push(`   Fundamento: ${regiF}`);
  if (penRem > 0 && penRem !== penDef) {
    const remReg = calcRegime(penRem, tipoNorm, reincNorm, hediondo, false, false);
    lines.push(`   Regime se considerada apenas pena remanescente: ${remReg.regime}`);
    lines.push(`   (${remReg.regiF})`);
    if (remReg.regime !== regime) {
      lines.push(`   ⚠️ A detração alteraria o regime, mas a reincidência/circunstâncias`);
      lines.push(`      judiciais desfavoráveis podem impedir o abrandamento.`);
    }
  }
  lines.push("");

  // Execução penal: Progressão
  lines.push("┌─────────────────────────────────────────────────────────────┐");
  lines.push("│ EXECUÇÃO PENAL — PROGRESSÃO DE REGIME (Art. 112, LEP)       │");
  lines.push("└─────────────────────────────────────────────────────────────┘");
  lines.push(`   Fração: ${progressao.frac}`);
  lines.push(`   Tempo a cumprir: ${progressao.tempo}`);
  lines.push(`   Estimativa: ${progressao.estimativa}`);
  lines.push("   (o condenado deve demonstrar bom comportamento carcerário)");
  lines.push("");

  // Pós-dosimetria: Substituição e Sursis
  lines.push("┌─────────────────────────────────────────────────────────────┐");
  lines.push("│ PÓS-DOSIMETRIA — SUBSTITUIÇÃO E SURSIS                      │");
  lines.push("└─────────────────────────────────────────────────────────────┘");
  lines.push(`   Substituição por restritivas (Art. 44, CP):`);
  lines.push(`     → ${cabeSub ? "CABÍVEL — não reincidente em crime doloso, pena ≤ 4 anos, sem violência ou grave ameaça" : subCondicional ? "CONDICIONAL — art. 44, § 3º, se socialmente recomendável e sem reincidência pelo mesmo crime" : "NÃO CABE"}`);
  if (cabeSub) {
    lines.push(`     → Quantidade: ${penDef <= 1 ? "1 restritiva ou multa" : "2 restritivas ou 1 restritiva + multa"}`);
  }
  lines.push(`   Sursis — Suspensão Condicional da Pena (Art. 77, CP):`);
  lines.push(`     → ${sursis ? "CABE — sursis simples (pena ≤ 2 anos, não reincidente em crime doloso)" : sursisEt ? "VERIFICAR — sursis etário (> 70 anos) ou humanitário (doença grave), pena ≤ 4 anos" : "NÃO CABE"}`);
  lines.push("");

  // Pós-dosimetria: Prescrição
  lines.push("┌─────────────────────────────────────────────────────────────┐");
  lines.push("│ PÓS-DOSIMETRIA — PRESCRIÇÃO (Art. 109, CP)                  │");
  lines.push("└─────────────────────────────────────────────────────────────┘");
  lines.push("   A prescrição se calcula sobre a pena MÁXIMA em abstrato,");
  lines.push("   não sobre a pena aplicada ao réu.");
  if (prescAbst !== null) lines.push(`   • Prescrição abstrata: ${prescAbst} anos`);
  if (prescConc !== null) lines.push(`   • Prescrição concreta: ${prescConc} anos`);
  lines.push("   (a prescrição concreta/retroativa regula-se pela pena definitiva)");
  lines.push("");

  // Pena de multa
  if (multaTotal && multaTotal !== "R$ 0,00") {
    lines.push("┌─────────────────────────────────────────────────────────────┐");
    lines.push("│ PENA DE MULTA (Art. 49, CP)                                 │");
    lines.push("└─────────────────────────────────────────────────────────────┘");
    lines.push(`   Valor total: ${multaTotal}`);
    lines.push("   (os dias-multa variam de 10 a 360; o valor do dia-multa");
    lines.push("    varia de 1/30 a 5 vezes o salário mínimo vigente ao tempo do fato)");
    lines.push("");
  }

  // Rodapé
  lines.push("═══════════════════════════════════════════════════════════════");
  lines.push("  NOTAS FINAIS");
  lines.push("═══════════════════════════════════════════════════════════════");
  lines.push("  • Este relatório foi gerado automaticamente pelo sistema");
  lines.push("    trifásico de dosimetria, que adota metodologia quantitativa.");
  lines.push("  • A dosimetria definitiva depende de fundamentação concreta");
  lines.push("    nos autos e discricionariedade judicial motivada.");
  lines.push("  • O juiz deve valorar QUALITATIVAMENTE as circunstâncias,");
  lines.push("    considerando a intensidade de cada vetor no caso concreto.");
  lines.push("  • Os campos deste relatório ensinam a lógica do cálculo, mas não");
  lines.push("    substituem a fundamentação individualizada exigida na sentença.");
  lines.push("  • Súmulas e leis especiais citadas devem ser verificadas quanto à vigência.");
  lines.push("═══════════════════════════════════════════════════════════════");

  return lines.join("\n");
}

export function regCorMap(regime: string): string {
  const map: Record<string, string> = {
    Aberto: "text-green-700",
    Semiaberto: "text-amber-700",
    Fechado: "text-red-700",
    "Fechado ou Semiaberto": "text-orange-700",
    "Semiaberto ou Fechado": "text-orange-700",
    "Pena integralmente detraída": "text-green-700",
    "—": "text-gray-500",
  };
  return map[regime] || "text-gray-500";
}
