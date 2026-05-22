import { useState } from "react";
import { Info, Pill } from "./InfoPill";
import { fmt, regCorMap, calcProgressao, generateRelatorio, FV } from "./utils";
import type { RowItem, PrescricaoConfig, MedidaSeguranca, MultaConfig } from "./types";

interface Props {
  penBase: number;
  penInter: number;
  penDef: number;
  penRem: number;
  detAnos: number;
  detMeses: string;
  negN: number;
  min: number;
  max: number;
  hasData: boolean;
  regime: string;
  regiF: string;
  cabeSub: boolean;
  subCondicional: boolean;
  sursis: boolean;
  sursisEt: boolean;
  prescAbst: number | null;
  prescConc: number | null;
  classi: string[];
  obs: string[];
  agravs: RowItem[];
  atens: RowItem[];
  majors: RowItem[];
  minors: RowItem[];
  tipoNorm: string;
  reincNorm: boolean;
  hediondo: boolean;
  tentativa: boolean;
  tentativaFrac: string;
  multa: MultaConfig;
  medidaSeg: MedidaSeguranca;
  presc: PrescricaoConfig;
}

export default function ResultadoFinal(props: Props) {
  const [copied, setCopied] = useState(false);

  const {
    penBase, penInter, penDef, penRem, detAnos, detMeses, negN, min, max,
    hasData, regime, regiF, cabeSub, subCondicional, sursis, sursisEt,
    prescAbst, prescConc, classi, obs, agravs, atens, majors, minors,
    tipoNorm, reincNorm, hediondo, tentativa, tentativaFrac, multa, medidaSeg, presc,
  } = props;

  const agAtivos = agravs.filter(a => a.desc?.trim() && a.frac in FV);
  const atAtivos = atens.filter(a => a.desc?.trim() && a.frac in FV);
  const agSum = agAtivos.reduce((s, a) => s + penBase * FV[a.frac], 0);
  const atSum = atAtivos.reduce((s, a) => s + penBase * FV[a.frac], 0);

  const diasMulta = parseFloat(multa.diasMulta) || 0;
  const valorDia = parseFloat(multa.valorDiaMulta) || 0;
  const multaTotal = diasMulta * valorDia;
  const multaFormatted = multaTotal > 0
    ? new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(multaTotal)
    : "R$ 0,00";

  const progressao = calcProgressao(penDef, tipoNorm, reincNorm, hediondo);

  const subTxt = cabeSub
    ? "Cabe substituição por restritivas de direitos (art. 44, CP)"
    : subCondicional
    ? "Substituição condicional (reincidente não específico — art. 44, § 3º, CP)"
    : "Não cabe substituição";

  const subQuant = cabeSub
    ? penDef <= 1
      ? "1 pena restritiva de direitos ou multa (art. 44, § 2º, I)"
      : "2 penas restritivas de direitos ou 1 restritiva + multa (art. 44, § 2º, II)"
    : "";

  const relatorio = generateRelatorio(
    min, max, negN, (max - min) / 8, penBase,
    agravs, atens, agSum, atSum, penInter,
    minors, majors, penDef, detAnos, penRem,
    regime, regiF, cabeSub, subCondicional, sursis, sursisEt,
    prescAbst, prescConc, classi, obs, tipoNorm, reincNorm, hediondo,
    tentativa, tentativaFrac, multaFormatted, progressao
  );

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(relatorio);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  };

  if (!hasData) return null;

  return (
    <div className="bg-gray-900 rounded-xl p-4 shadow-lg">
      <div className="flex items-center justify-between border-b border-gray-700 pb-2 mb-3">
        <h2 className="font-bold text-white text-sm">Resultado Final</h2>
        <button
          onClick={handleCopy}
          className="text-xs bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded transition-colors"
        >
          {copied ? "Copiado!" : "Copiar relatório"}
        </button>
      </div>

      <div className="space-y-2 text-xs">
        {[
          ["Pena-base (1ª fase)", fmt(penBase), `Art. 59, CP · ${negN} vetor(es) negativo(s)`],
          ["Pena intermediária (2ª fase)", fmt(penInter), "Agravantes/Atenuantes · Súmula 231/STJ aplicada"],
          ["Pena definitiva (3ª fase)", fmt(penDef), "Causas de aumento/diminuição · Art. 68, CP"],
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
            <p className={`font-bold text-sm ${regCorMap(regime)}`}>{regime}</p>
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
              {sursis ? "Cabeível — sursis simples (<= 2 anos)" : sursisEt ? "Verificar sursis etário/humanitário" : "Não cabe"}
            </p>
          </div>
          <div className="bg-gray-800 rounded-lg p-2">
            <p className="text-gray-400 text-xs">Prescrição (art. 109)</p>
            <p className="text-blue-300 font-bold text-xs mt-1">Abstrata: {prescAbst} anos</p>
            {prescConc && <p className="text-blue-200 text-xs">Concreta: {prescConc} anos</p>}
            {presc.reducaoMetade && prescAbst && (
              <p className="text-green-300 text-xs">Reduzida (art. 115): {prescAbst / 2} anos</p>
            )}
          </div>
        </div>

        {/* Progressão de regime */}
        <div className="bg-gray-800 rounded-lg p-2 mt-2">
          <p className="text-gray-400 text-xs">Progressão de Regime (Art. 112, LEP)</p>
          <p className="text-yellow-300 font-bold text-sm">{progressao.frac}</p>
          <p className="text-gray-500 text-xs">Marco: {progressao.tempo} ({progressao.estimativa})</p>
        </div>

        {/* Multa */}
        {multaTotal > 0 && (
          <div className="bg-gray-800 rounded-lg p-2 mt-2">
            <p className="text-gray-400 text-xs">Multa (Art. 76, CP)</p>
            <p className="text-yellow-300 font-bold text-sm">{multaFormatted}</p>
            <p className="text-gray-500 text-xs">{diasMulta} dias-multa x {new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(valorDia)}</p>
          </div>
        )}

        {/* Medida de segurança */}
        {medidaSeg.ativa && (
          <div className="bg-gray-800 rounded-lg p-2 mt-2">
            <p className="text-gray-400 text-xs">Medida de Segurança (Art. 98, CP)</p>
            <p className="text-orange-300 font-bold text-sm">{medidaSeg.tipo}</p>
            <p className="text-gray-500 text-xs">Prazo: {medidaSeg.prazo} anos · Súmula 527/STJ</p>
          </div>
        )}
      </div>

      <p className="text-xs text-gray-500 mt-3 border-t border-gray-700 pt-2">
        Cálculo estimativo. A dosimetria definitiva depende de fundamentação concreta nos autos e discricionariedade judicial motivada.
      </p>
    </div>
  );
}
