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

const inputCls = "w-full h-[42px] px-3 text-sm rounded-[4px] border border-[#ced4da] bg-white text-[#212529] focus:outline-none focus:border-brand-500 transition-colors";
const labelCls = "block text-sm font-medium text-[#212529] mb-1";

export default function PrescricaoDetracao({
  detMeses, setDetMeses, penDef, penRem, hasData, tipoNorm, reincNorm, hediondo, perSaltum, reincEspec, presc, setPresc, medidaSeg, setMedidaSeg,
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
      <div className="bg-white rounded-[4px] p-4 border border-[#dee2e6]">
        <h2 className="font-bold text-base text-[#212529] mb-3">Medida de Segurança (Art. 98, CP)</h2>
        <Info color="yellow">
          Sistema vicariante: quando o agente é semi-imputável, a medida de segurança prejudica a dosimetria da pena privativa.
        </Info>
        <label className="flex items-center gap-3 text-sm text-[#212529] cursor-pointer mb-3">
          <input
            type="checkbox" checked={medidaSeg.ativa}
            onChange={e => setMedidaSeg(m => ({ ...m, ativa: e.target.checked }))}
            className="w-[18px] h-[18px] rounded-sm border-[#ced4da] text-brand-500 accent-brand-500"
          />
          <span>Semi-imputável com necessidade de tratamento curativo (Art. 98, CP)</span>
        </label>
        {medidaSeg.ativa && (
          <div className="ml-7 space-y-4">
            <div>
              <label className={labelCls}>Tipo de medida</label>
              <select value={medidaSeg.tipo} onChange={e => setMedidaSeg(m => ({ ...m, tipo: e.target.value }))}
                className={inputCls + " cursor-pointer"}>
                <option value="internação">Internação</option>
                <option value="tratamento ambulatorial">Tratamento ambulatorial</option>
              </select>
            </div>
            <div>
              <label className={labelCls}>Prazo (1 a 3 anos)</label>
              <input type="number" min="1" max="3" step="0.5" value={medidaSeg.prazo}
                onChange={e => setMedidaSeg(m => ({ ...m, prazo: e.target.value }))}
                className={inputCls} placeholder="ex: 2" />
            </div>
            <Info color="blue" title="Súmula 527/STJ">
              O tempo de duração da medida de segurança não deve ultrapassar o limite máximo da pena abstratamente cominada para o delito praticado.
            </Info>
          </div>
        )}
      </div>

      {/* Detração */}
      <div className="bg-white rounded-[4px] p-4 border border-[#dee2e6]">
        <h2 className="font-bold text-base text-[#212529] mb-3">Detração Penal (Art. 42, CP)</h2>
        <Info color="gray">
          Computa-se na pena privativa de liberdade o tempo de prisão provisória, prisão administrativa e internação.
        </Info>
        <div>
          <label className={labelCls}>Tempo de prisão provisória (meses)</label>
          <input type="number" min="0" value={detMeses} onChange={e => setDetMeses(e.target.value)}
            className={inputCls} placeholder="ex: 6" />
        </div>
        {detAnos > 0 && hasData && (
          <div className="mt-3 bg-brand-50 border border-brand-200 rounded-[4px] p-3 text-sm text-[#212529]">
            {fmt(penDef)} - {fmt(detAnos)} = <strong>{fmt(penRem)}</strong> (pena remanescente)
          </div>
        )}
        {regimeAlterado && regimePos && (
          <div className="mt-3 bg-emerald-50 border border-emerald-200 rounded-[4px] p-3 text-sm text-emerald-800">
            <strong>Regime pós-detração alterado:</strong> {regimePos.regime} ({regimePos.regiF})
          </div>
        )}
        {regimeOriginal && regimePos && !regimeAlterado && hasData && penRem > 0 && (
          <div className="mt-3 bg-amber-50 border border-amber-200 rounded-[4px] p-3 text-sm text-amber-800">
            <strong>Regime mantido</strong> após detração ({regimePos.regime}).
          </div>
        )}
      </div>

      {/* Prescrição avançada */}
      <div className="bg-white rounded-[4px] p-4 border border-[#dee2e6]">
        <h2 className="font-bold text-base text-[#212529] mb-3">Prescrição — Interrupção, Suspensão e Retroativa</h2>
        <div className="space-y-4">
          <label className="flex items-center gap-3 text-sm text-[#212529] cursor-pointer">
            <input type="checkbox" checked={presc.reducaoMetade}
              onChange={e => setPresc(p => ({ ...p, reducaoMetade: e.target.checked }))}
              className="w-[18px] h-[18px] rounded-sm border-[#ced4da] text-brand-500 accent-brand-500" />
            <span>Aplicar redução pela metade (art. 115 CP) — menor de 21 ao tempo do crime ou maior de 70 na sentença</span>
          </label>
          <label className="flex items-center gap-3 text-sm text-[#212529] cursor-pointer">
            <input type="checkbox" checked={presc.retroativa}
              onChange={e => setPresc(p => ({ ...p, retroativa: e.target.checked }))}
              className="w-[18px] h-[18px] rounded-sm border-[#ced4da] text-brand-500 accent-brand-500" />
            <span>Prescrição retroativa (art. 110, §1º CP) — usar pena definitiva</span>
          </label>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className={labelCls}>Data da denúncia</label>
              <input type="date" value={presc.dataDenuncia}
                onChange={e => setPresc(p => ({ ...p, dataDenuncia: e.target.value }))}
                className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>Data da sentença</label>
              <input type="date" value={presc.dataSentenca}
                onChange={e => setPresc(p => ({ ...p, dataSentenca: e.target.value }))}
                className={inputCls} />
            </div>
          </div>

          {interrupcao && (
            <div className="bg-brand-50 border border-brand-200 rounded-[4px] p-3 text-sm text-[#212529]">
              Interrupção: <strong>{interrupcao.dias} dias</strong> ({fmt(interrupcao.anos)}) entre denúncia e sentença.<br />
              Este período <strong>não computa</strong> para a prescrição (art. 117, CP).
            </div>
          )}

          <div>
            <label className={labelCls}>Período de fuga (dias)</label>
            <input type="number" min="0" value={presc.fugaDias}
              onChange={e => setPresc(p => ({ ...p, fugaDias: e.target.value }))}
              className={inputCls} placeholder="0" />
          </div>

          <div>
            <p className="text-sm font-medium text-[#212529] mb-2">Outras suspensões (outro processo, país estrangeiro)</p>
            {presc.periodosSuspensao.map((s, i) => (
              <div key={i} className="flex flex-col sm:flex-row gap-2 mb-2 sm:items-center">
                <input value={s.motivo}
                  onChange={e => { const next = [...presc.periodosSuspensao]; next[i] = { ...next[i], motivo: e.target.value }; setPresc(p => ({ ...p, periodosSuspensao: next })); }}
                  className="w-full min-w-0 sm:flex-1 h-[42px] px-3 text-sm rounded-[4px] border border-[#ced4da] bg-white text-[#212529] focus:outline-none focus:border-brand-500 transition-colors"
                  placeholder="Motivo (ex: outro crime, extradição pendente)" />
                <input type="number" min="0" value={s.dias}
                  onChange={e => { const next = [...presc.periodosSuspensao]; next[i] = { ...next[i], dias: e.target.value }; setPresc(p => ({ ...p, periodosSuspensao: next })); }}
                  className="w-full sm:w-20 sm:shrink-0 h-[42px] px-3 text-sm rounded-[4px] border border-[#ced4da] bg-white text-[#212529] focus:outline-none focus:border-brand-500 transition-colors"
                  placeholder="dias" />
                <button onClick={() => { const next = presc.periodosSuspensao.filter((_, j) => j !== i); setPresc(p => ({ ...p, periodosSuspensao: next })); }}
                  className="w-9 h-9 rounded-[4px] flex items-center justify-center text-[#868e96] hover:bg-red-50 hover:text-red-500 transition-colors text-lg flex-shrink-0">×</button>
              </div>
            ))}
            <button onClick={() => setPresc(p => ({ ...p, periodosSuspensao: [...p.periodosSuspensao, { motivo: "", dias: "" }] }))}
              className="text-sm font-medium text-brand-600 hover:text-brand-700 transition-colors">+ Adicionar período de suspensão</button>
          </div>

          {totalSuspensao > 0 && (
            <div className="bg-amber-50 border border-amber-200 rounded-[4px] p-3 text-sm text-amber-800">
              Total de dias suspensos: <strong>{totalSuspensao} dias</strong>. Estes períodos não computam para a prescrição (art. 117, CP).
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
