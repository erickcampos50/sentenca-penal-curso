import { Info, Pill } from "./InfoPill";
import { fmt, calcRegime, FV } from "./utils";
import type { PrescricaoConfig, MedidaSeguranca } from "./types";

interface Props {
  detMeses: string;
  setDetMeses: React.Dispatch<React.SetStateAction<string>>;
  penDef: number;
  penRem: number;
  hasData: boolean;
  tipoNorm: string;
  reincNorm: boolean;
  hediondo: boolean;
  perSaltum: boolean;
  reincEspec: boolean;
  presc: PrescricaoConfig;
  setPresc: React.Dispatch<React.SetStateAction<PrescricaoConfig>>;
  medidaSeg: MedidaSeguranca;
  setMedidaSeg: React.Dispatch<React.SetStateAction<MedidaSeguranca>>;
}

export default function PrescricaoDetracao({
  detMeses,
  setDetMeses,
  penDef,
  penRem,
  hasData,
  tipoNorm,
  reincNorm,
  hediondo,
  perSaltum,
  reincEspec,
  presc,
  setPresc,
  medidaSeg,
  setMedidaSeg,
}: Props) {
  const detMesesNum = parseFloat(detMeses);
  const detAnos = !isNaN(detMesesNum) && detMesesNum >= 0 ? detMesesNum / 12 : 0;

  const regimeOriginal = hasData ? calcRegime(penDef, tipoNorm, reincNorm, hediondo, reincEspec, perSaltum) : null;
  const regimePos = hasData && penRem > 0 ? calcRegime(penRem, tipoNorm, reincNorm, hediondo, reincEspec, perSaltum) : null;
  const regimeAlterado = regimeOriginal && regimePos && regimeOriginal.regime !== regimePos.regime;

  const calcInterrupcao = () => {
    if (!presc.dataDenuncia || !presc.dataSentenca) return null;
    const d1 = new Date(presc.dataDenuncia);
    const d2 = new Date(presc.dataSentenca);
    if (isNaN(d1.getTime()) || isNaN(d2.getTime())) return null;
    const diff = Math.max(0, d2.getTime() - d1.getTime());
    const dias = Math.floor(diff / (1000 * 60 * 60 * 24));
    const anos = dias / 360;
    return { dias, anos };
  };

  const interrupcao = calcInterrupcao();

  const suspensaoTotal = presc.periodosSuspensao.reduce((sum, p) => {
    const d = parseFloat(p.dias);
    return sum + (!isNaN(d) && d > 0 ? d : 0);
  }, 0);
  const fugaDias = parseFloat(presc.fugaDias) || 0;
  const totalSuspensao = suspensaoTotal + fugaDias;

  return (
    <div className="space-y-4">
      {/* Medida de segurança */}
      <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
        <h2 className="font-bold text-sm mb-2">Medida de Segurança (Art. 98, CP)</h2>
        <Info color="yellow">
          Sistema vicariante: quando o agente é semi-imputável, a medida de segurança prejudica a dosimetria da pena privativa. A substituição da pena por medida de segurança independe do total dosimetrado.
        </Info>
        <label className="flex items-center gap-2 text-xs text-gray-700 cursor-pointer mb-3">
          <input
            type="checkbox"
            checked={medidaSeg.ativa}
            onChange={e => setMedidaSeg(m => ({ ...m, ativa: e.target.checked }))}
            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
          />
          <span>Semi-imputável com necessidade de tratamento curativo (Art. 98, CP)</span>
        </label>
        {medidaSeg.ativa && (
          <div className="ml-5 space-y-3">
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Tipo de medida</label>
              <select
                value={medidaSeg.tipo}
                onChange={e => setMedidaSeg(m => ({ ...m, tipo: e.target.value }))}
                className="w-full border border-gray-300 rounded px-2 py-1.5 text-sm bg-white focus:outline-none focus:border-blue-400"
              >
                <option value="internação">Internação</option>
                <option value="tratamento ambulatorial">Tratamento ambulatorial</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Prazo (1 a 3 anos)</label>
              <input
                type="number"
                min="1"
                max="3"
                step="0.5"
                value={medidaSeg.prazo}
                onChange={e => setMedidaSeg(m => ({ ...m, prazo: e.target.value }))}
                className="w-full border border-gray-300 rounded px-2 py-1.5 text-sm focus:outline-none focus:border-blue-400"
                placeholder="ex: 2"
              />
            </div>
            <Info color="blue" title="Súmula 527/STJ">
              O tempo de duração da medida de segurança não deve ultrapassar o limite máximo da pena abstratamente cominada para o delito praticado.
            </Info>
          </div>
        )}
      </div>

      {/* Detração */}
      <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
        <h2 className="font-bold text-sm mb-1">Detração Penal (Art. 42, CP)</h2>
        <Info color="gray">
          Computa-se na pena privativa de liberdade o tempo de prisão provisória, prisão administrativa e internação. A detração pode alterar o regime inicial e os marcos de progressão de regime.
        </Info>
        <div>
          <label className="block text-xs font-semibold text-gray-600 mb-1">Tempo de prisão provisória (meses)</label>
          <input
            type="number"
            min="0"
            value={detMeses}
            onChange={e => setDetMeses(e.target.value)}
            className="w-full border border-gray-300 rounded px-2 py-1.5 text-sm focus:outline-none focus:border-blue-400"
            placeholder="ex: 6"
          />
        </div>
        {detAnos > 0 && hasData && (
          <div className="mt-2 bg-blue-50 border border-blue-200 rounded p-2 text-xs">
            {fmt(penDef)} - {fmt(detAnos)} = <strong>{fmt(penRem)}</strong> (pena remanescente)
          </div>
        )}
        {regimeAlterado && regimePos && (
          <div className="mt-2 bg-green-50 border border-green-200 rounded p-2 text-xs text-green-800">
            <strong>Regime pós-detração alterado:</strong> {regimePos.regime} ({regimePos.regiF})
          </div>
        )}
        {regimeOriginal && regimePos && !regimeAlterado && hasData && penRem > 0 && (
          <div className="mt-2 bg-yellow-50 border border-yellow-200 rounded p-2 text-xs text-yellow-800">
            <strong>Regime mantido</strong> após detração ({regimePos.regime}). A reincidência ou circunstâncias negativas impedem a redução de regime.
          </div>
        )}
      </div>

      {/* Prescrição avançada */}
      <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
        <h2 className="font-bold text-sm mb-2">Prescrição — Interrupção, Suspensão e Retroativa</h2>
        <div className="space-y-3">
          <label className="flex items-center gap-2 text-xs text-gray-700 cursor-pointer">
            <input
              type="checkbox"
              checked={presc.reducaoMetade}
              onChange={e => setPresc(p => ({ ...p, reducaoMetade: e.target.checked }))}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <span>Aplicar redução pela metade (art. 115 CP) — menor de 21 ao tempo do crime ou maior de 70 na sentença, salvo violência sexual contra a mulher</span>
          </label>
          <label className="flex items-center gap-2 text-xs text-gray-700 cursor-pointer">
            <input
              type="checkbox"
              checked={presc.retroativa}
              onChange={e => setPresc(p => ({ ...p, retroativa: e.target.checked }))}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <span>Prescrição retroativa (art. 110, §1º CP) — usar pena definitiva</span>
          </label>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Data da denúncia</label>
              <input
                type="date"
                value={presc.dataDenuncia}
                onChange={e => setPresc(p => ({ ...p, dataDenuncia: e.target.value }))}
                className="w-full border border-gray-300 rounded px-2 py-1.5 text-sm focus:outline-none focus:border-blue-400"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Data da sentença</label>
              <input
                type="date"
                value={presc.dataSentenca}
                onChange={e => setPresc(p => ({ ...p, dataSentenca: e.target.value }))}
                className="w-full border border-gray-300 rounded px-2 py-1.5 text-sm focus:outline-none focus:border-blue-400"
              />
            </div>
          </div>

          {interrupcao && (
            <div className="bg-blue-50 border border-blue-200 rounded p-2 text-xs">
              Interrupção: <strong>{interrupcao.dias} dias</strong> ({fmt(interrupcao.anos)}) entre denúncia e sentença.
              <br />
              Este período <strong>não computa</strong> para a prescrição (art. 117, CP).
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">Período de fuga (dias)</label>
            <input
              type="number"
              min="0"
              value={presc.fugaDias}
              onChange={e => setPresc(p => ({ ...p, fugaDias: e.target.value }))}
              className="w-full border border-gray-300 rounded px-2 py-1.5 text-sm focus:outline-none focus:border-blue-400"
              placeholder="0"
            />
          </div>

          <div>
            <p className="text-xs font-semibold text-gray-600 mb-1">Outras suspensões (outro processo, país estrangeiro)</p>
            {presc.periodosSuspensao.map((s, i) => (
              <div key={i} className="flex flex-col sm:flex-row gap-2 mb-2 sm:items-center">
                <input
                  value={s.motivo}
                  onChange={e => {
                    const next = [...presc.periodosSuspensao];
                    next[i] = { ...next[i], motivo: e.target.value };
                    setPresc(p => ({ ...p, periodosSuspensao: next }));
                  }}
                  className="w-full min-w-0 sm:flex-1 border border-gray-300 rounded px-2 py-1 text-xs focus:outline-none"
                  placeholder="Motivo (ex: outro crime, extradição pendente)"
                />
                <input
                  type="number"
                  min="0"
                  value={s.dias}
                  onChange={e => {
                    const next = [...presc.periodosSuspensao];
                    next[i] = { ...next[i], dias: e.target.value };
                    setPresc(p => ({ ...p, periodosSuspensao: next }));
                  }}
                  className="w-full sm:w-20 sm:shrink-0 border border-gray-300 rounded px-2 py-1 text-xs focus:outline-none"
                  placeholder="dias"
                />
                <button
                  onClick={() => {
                    const next = presc.periodosSuspensao.filter((_, j) => j !== i);
                    setPresc(p => ({ ...p, periodosSuspensao: next }));
                  }}
                  className="self-end sm:self-auto text-red-400 font-bold text-sm"
                >
                  ✕
                </button>
              </div>
            ))}
            <button
              onClick={() => setPresc(p => ({ ...p, periodosSuspensao: [...p.periodosSuspensao, { motivo: "", dias: "" }] }))}
              className="text-xs text-blue-500 hover:underline"
            >
              + Adicionar período de suspensão
            </button>
          </div>

          {totalSuspensao > 0 && (
            <div className="bg-yellow-50 border border-yellow-200 rounded p-2 text-xs text-yellow-800">
              Total de dias suspensos: <strong>{totalSuspensao} dias</strong>. Estes períodos não computam para a prescrição (art. 117, CP).
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
