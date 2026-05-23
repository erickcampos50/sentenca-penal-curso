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
    <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
      <h2 className="font-bold text-sm mb-2">Dosimetria da Multa (Art. 49, CP)</h2>
      <Info color="gray">
        A multa é fixada em dias-multa (10 a 360), multiplicados pelo valor do dia-multa (de 1/30 a 5 vezes o maior salário mínimo vigente ao tempo do fato).
      </Info>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
        <div>
          <label className="block text-xs font-semibold text-gray-600 mb-1">Maior salário mínimo mensal ao tempo do fato (R$)</label>
          <input
            type="number"
            min="0"
            step="0.01"
            value={multa.salarioMinimo || ""}
            onChange={e => setMulta(m => ({ ...m, salarioMinimo: e.target.value }))}
            className="w-full border border-gray-300 rounded px-2 py-1.5 text-sm focus:outline-none focus:border-blue-400"
            placeholder="ex: 1518.00"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-gray-600 mb-1">Atalho para valor do dia-multa</label>
          <select
            value={multa.fracaoSalario || ""}
            onChange={e => setMulta(m => ({ ...m, fracaoSalario: e.target.value }))}
            className="w-full border border-gray-300 rounded px-2 py-1.5 text-sm bg-white focus:outline-none focus:border-blue-400"
          >
            <option value="">-- Selecione --</option>
            {FRACOES_SALARIO.map((f, i) => (
              <option key={i} value={String(f.valor)}>{f.label}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-xs font-semibold text-gray-600 mb-1">Dias-multa (10 a 360)</label>
          <input
            type="number"
            min="10"
            max="360"
            value={multa.diasMulta}
            onChange={e => setMulta(m => ({ ...m, diasMulta: e.target.value }))}
            className="w-full border border-gray-300 rounded px-2 py-1.5 text-sm focus:outline-none focus:border-blue-400"
            placeholder="ex: 100"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-gray-600 mb-1">Valor do dia-multa manual (R$)</label>
          <input
            type="number"
            min={minDia || 0}
            max={maxDia || undefined}
            step="0.01"
            value={multa.valorDiaMulta || ""}
            onChange={e => setMulta(m => ({ ...m, valorDiaMulta: e.target.value }))}
            className="w-full border border-gray-300 rounded px-2 py-1.5 text-sm focus:outline-none focus:border-blue-400"
            placeholder="opcional; prevalece sobre o atalho"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-gray-600 mb-1">Valor do dia-multa usado</label>
          <input
            type="text"
            readOnly
            value={formattedDia}
            className="w-full border border-gray-300 rounded px-2 py-1.5 text-sm bg-gray-50 text-gray-600"
          />
        </div>
      </div>
      {valorDiaForaDoLimite && (
        <div className="mt-2 bg-red-50 border border-red-200 rounded p-2 text-xs text-red-700">
          Valor do dia-multa fora dos limites do art. 49, § 1º, CP: mínimo {new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(minDia)} e máximo {new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(maxDia)}.
        </div>
      )}
      {total > 0 && (
        <div className="mt-2 bg-blue-50 border border-blue-200 rounded p-2 text-xs">
          Valor total da multa: <strong>{formatted}</strong>
          <br />
          <span className="text-gray-500">{dias} dias-multa x {formattedDia} = {formatted}</span>
        </div>
      )}
    </div>
  );
}
