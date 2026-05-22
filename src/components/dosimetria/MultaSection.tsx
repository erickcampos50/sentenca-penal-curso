import { Info } from "./InfoPill";
import type { MultaConfig } from "./types";

interface Props {
  multa: MultaConfig;
  setMulta: React.Dispatch<React.SetStateAction<MultaConfig>>;
}

export default function MultaSection({ multa, setMulta }: Props) {
  const dias = parseFloat(multa.diasMulta) || 0;
  const valor = parseFloat(multa.valorDiaMulta) || 0;
  const total = dias * valor;
  const formatted = total > 0
    ? new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(total)
    : "R$ 0,00";

  return (
    <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
      <h2 className="font-bold text-sm mb-2">Dosimetria da Multa (Art. 76, CP)</h2>
      <Info color="gray">
        A multa é fixada em dias-multa (10 a 360), multiplicados pelo valor do dia-multa (de 1/30 a 5/30 do salário mínimo). O valor do salário mínimo deve ser atualizado conforme data da sentença.
      </Info>
      <div className="grid grid-cols-2 gap-3 mb-3">
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
          <label className="block text-xs font-semibold text-gray-600 mb-1">Valor do dia-multa (1/30 a 5/30 do sal. mín.)</label>
          <input
            type="number"
            min="0"
            step="0.01"
            value={multa.valorDiaMulta}
            onChange={e => setMulta(m => ({ ...m, valorDiaMulta: e.target.value }))}
            className="w-full border border-gray-300 rounded px-2 py-1.5 text-sm focus:outline-none focus:border-blue-400"
            placeholder="ex: 44.00"
          />
        </div>
      </div>
      {total > 0 && (
        <div className="mt-2 bg-blue-50 border border-blue-200 rounded p-2 text-xs">
          Valor total da multa: <strong>{formatted}</strong>
        </div>
      )}
    </div>
  );
}
