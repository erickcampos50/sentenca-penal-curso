import { Info } from "./InfoPill";
import type { MultaConfig } from "./types";

interface Props {
  multa: MultaConfig;
  setMulta: React.Dispatch<React.SetStateAction<MultaConfig>>;
}

const FRACOES_SALARIO = [
  { label: "1/30 do salário mínimo", valor: 1/30 },
  { label: "1/10 do salário mínimo", valor: 1/10 },
  { label: "1/2 do salário mínimo", valor: 1/2 },
  { label: "1 salário mínimo", valor: 1 },
  { label: "2 salários mínimos", valor: 2 },
  { label: "5 salários mínimos", valor: 5 },
];

const inputCls = "w-full h-[42px] px-3 text-sm rounded-[4px] border border-[#ced4da] bg-white text-[#212529] focus:outline-none focus:border-brand-500 transition-colors";
const labelCls = "block text-sm font-medium text-[#212529] mb-1";

export default function MultaSection({ multa, setMulta }: Props) {
  const salarioMinimo = parseFloat(multa.salarioMinimo || "0") || 0;
  const fracao = parseFloat(multa.fracaoSalario || "0") || 0;
  const valorDiaManual = parseFloat(multa.valorDiaMulta || "0") || 0;
  const valorDiaCalculado = salarioMinimo * fracao;
  const valorDia = valorDiaManual > 0 ? valorDiaManual : valorDiaCalculado;
  const dias = parseFloat(multa.diasMulta) || 0;
  const total = dias * valorDia;
  const minDia = salarioMinimo > 0 ? salarioMinimo / 30 : 0;
  const maxDia = salarioMinimo > 0 ? salarioMinimo * 5 : 0;
  const valorDiaForaDoLimite = valorDia > 0 && salarioMinimo > 0 && (valorDia < minDia || valorDia > maxDia);
  const formatted = total > 0
    ? new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(total)
    : "R$ 0,00";
  const formattedDia = valorDia > 0
    ? new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(valorDia)
    : "R$ 0,00";

  return (
    <div className="bg-white rounded-[4px] p-4 border border-[#dee2e6]">
      <h2 className="font-bold text-base text-[#212529] mb-3">Dosimetria da Multa (Art. 49, CP)</h2>
      <Info color="gray">
        A multa é fixada em dias-multa (10 a 360), multiplicados pelo valor do dia-multa (de 1/30 a 5 vezes o maior salário mínimo vigente ao tempo do fato).
      </Info>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
        <div>
          <label className={labelCls}>Maior salário mínimo mensal ao tempo do fato (R$)</label>
          <input
            type="number" min="0" step="0.01"
            value={multa.salarioMinimo || ""}
            onChange={e => setMulta(m => ({ ...m, salarioMinimo: e.target.value }))}
            className={inputCls} placeholder="ex: 1518.00"
          />
        </div>
        <div>
          <label className={labelCls}>Atalho para valor do dia-multa</label>
          <select
            value={multa.fracaoSalario || ""}
            onChange={e => setMulta(m => ({ ...m, fracaoSalario: e.target.value }))}
            className={inputCls + " cursor-pointer"}
          >
            <option value="">-- Selecione --</option>
            {FRACOES_SALARIO.map((f, i) => (
              <option key={i} value={String(f.valor)}>{f.label}</option>
            ))}
          </select>
        </div>
        <div>
          <label className={labelCls}>Dias-multa (10 a 360)</label>
          <input
            type="number" min="10" max="360"
            value={multa.diasMulta}
            onChange={e => setMulta(m => ({ ...m, diasMulta: e.target.value }))}
            className={inputCls} placeholder="ex: 100"
          />
        </div>
        <div>
          <label className={labelCls}>Valor do dia-multa manual (R$)</label>
          <input
            type="number" min={minDia || 0} max={maxDia || undefined} step="0.01"
            value={multa.valorDiaMulta || ""}
            onChange={e => setMulta(m => ({ ...m, valorDiaMulta: e.target.value }))}
            className={inputCls} placeholder="opcional; prevalece sobre o atalho"
          />
        </div>
        <div>
          <label className={labelCls}>Valor do dia-multa usado</label>
          <input
            type="text" readOnly value={formattedDia}
            className="w-full h-[42px] px-3 text-sm rounded-[4px] border border-[#dee2e6] bg-[#f8f9fa] text-[#868e96]"
          />
        </div>
      </div>
      {valorDiaForaDoLimite && (
        <div className="mt-2 bg-red-50 border border-red-200 rounded-[4px] p-3 text-sm text-red-700">
          Valor do dia-multa fora dos limites do art. 49, § 1º, CP: mínimo {new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(minDia)} e máximo {new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(maxDia)}.
        </div>
      )}
      {total > 0 && (
        <div className="mt-3 bg-brand-50 border border-brand-200 rounded-[4px] p-3 text-sm">
          Valor total da multa: <strong className="text-brand-700">{formatted}</strong>
          <br />
          <span className="text-[#868e96] text-xs">{dias} dias-multa × {formattedDia} = {formatted}</span>
        </div>
      )}
    </div>
  );
}
