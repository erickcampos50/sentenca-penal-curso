import { useState } from "react";
import { Info } from "./InfoPill";
import { fmt, calcConcurso } from "./utils";
import type { ConcursoCrime, Crime } from "./types";

interface Props {
  crimesList: Crime[];
}

export default function ConcursoSection({ crimesList }: Props) {
  const [crimes, setCrimes] = useState<ConcursoCrime[]>([]);
  let nextId = crimes.length > 0 ? Math.max(...crimes.map(c => c.id)) + 1 : 1;

  const addCrime = () => {
    setCrimes(prev => [...prev, { id: nextId, nome: "", tipo: "reclusão", penaMin: "", penaMax: "", penaDef: "", observacao: "" }]);
    nextId++;
  };

  const removeCrime = (id: number) => setCrimes(prev => prev.filter(c => c.id !== id));

  const updateCrime = (id: number, field: keyof ConcursoCrime, value: string) => {
    setCrimes(prev => prev.map(c => c.id === id ? { ...c, [field]: value } : c));
  };

  const handleCrimeSelect = (id: number, nome: string) => {
    const crime = crimesList.find(c => c.nome === nome);
    if (crime) {
      setCrimes(prev => prev.map(c => c.id === id ? {
        ...c,
        nome: crime.nome,
        tipo: crime.tipo,
        penaMin: String(crime.pena_min),
        penaMax: String(crime.pena_max),
        observacao: crime.observacao,
      } : c));
    } else {
      setCrimes(prev => prev.map(c => c.id === id ? { ...c, nome, observacao: "" } : c));
    }
  };

  const resultado = calcConcurso(crimes);

  return (
    <div className="space-y-4">
      <Info color="blue" title="Concurso de Crimes (Arts. 69-71, CP)">
        Adicione os crimes praticados para calcular a pena final no concurso. Informe a pena definitiva de cada crime (ou a máxima como referência).
      </Info>

      <div className="space-y-3">
        {crimes.map((c) => (
          <div key={c.id} className="bg-white rounded-lg p-3 shadow-sm border border-gray-200">
            <div className="mb-2">
              <label className="block text-xs font-semibold text-gray-600 mb-1">Selecionar crime (auto-preenchimento)</label>
              <select
                value={c.nome}
                onChange={e => handleCrimeSelect(c.id, e.target.value)}
                className="w-full border border-gray-300 rounded px-2 py-1 text-xs bg-white focus:outline-none"
              >
                <option value="">-- Selecione um crime --</option>
                {crimesList.map((crime, i) => (
                  <option key={i} value={crime.nome}>{crime.nome}</option>
                ))}
                <option value="__outro__">Outro (digite manualmente)</option>
              </select>
              {c.observacao.trim() && (
                <div className="mt-2">
                  <Info color="yellow" title="Observação do crime selecionado">
                    {c.observacao}
                  </Info>
                </div>
              )}
            </div>
            <div className="grid grid-cols-2 gap-2 mb-2">
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Crime / descrição manual</label>
                <input
                  value={c.nome === "__outro__" ? "" : c.nome}
                  onChange={e => updateCrime(c.id, "nome", e.target.value)}
                  className="w-full border border-gray-300 rounded px-2 py-1 text-xs focus:outline-none"
                  placeholder="Ex: Roubo art. 157"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Tipo</label>
                <select
                  value={c.tipo}
                  onChange={e => updateCrime(c.id, "tipo", e.target.value)}
                  className="w-full border border-gray-300 rounded px-2 py-1 text-xs bg-white focus:outline-none"
                >
                  <option value="reclusão">Reclusão</option>
                  <option value="detenção">Detenção</option>
                  <option value="prisão simples">Prisão simples</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Pena mínima (anos)</label>
                <input
                  type="number"
                  min="0"
                  step="0.5"
                  value={c.penaMin}
                  onChange={e => updateCrime(c.id, "penaMin", e.target.value)}
                  className="w-full border border-gray-300 rounded px-2 py-1 text-xs focus:outline-none"
                  placeholder="0"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Pena máxima (anos)</label>
                <input
                  type="number"
                  min="0"
                  step="0.5"
                  value={c.penaMax}
                  onChange={e => updateCrime(c.id, "penaMax", e.target.value)}
                  className="w-full border border-gray-300 rounded px-2 py-1 text-xs focus:outline-none"
                  placeholder="0"
                />
              </div>
            </div>
            <div className="mb-2">
              <label className="block text-xs font-semibold text-gray-600 mb-1">Pena definitiva (anos) — se já dosimetrada</label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={c.penaDef}
                onChange={e => updateCrime(c.id, "penaDef", e.target.value)}
                className="w-full border border-gray-300 rounded px-2 py-1 text-xs focus:outline-none"
                placeholder="Usa a máxima se vazio"
              />
            </div>
            <button onClick={() => removeCrime(c.id)} className="text-xs text-red-500 hover:underline">
              Remover crime
            </button>
          </div>
        ))}
      </div>

      <button onClick={addCrime} className="text-xs text-blue-500 hover:underline">
        + Adicionar crime ao concurso
      </button>

      {resultado && (
        <div className="bg-gray-900 rounded-xl p-4 shadow-lg text-xs space-y-2">
          <h3 className="font-bold text-white border-b border-gray-700 pb-2 mb-2">Resultado do Concurso</h3>
          <div className="grid grid-cols-1 gap-2">
            <div className="bg-gray-800 rounded-lg p-2">
              <p className="text-gray-400">Concurso material (Art. 69 CP)</p>
              <p className="text-yellow-300 font-bold">{fmt(resultado.material)}</p>
              <p className="text-gray-500">Soma das penas unificada ao limite de 40 anos (Art. 75, CP)</p>
            </div>
            <div className="bg-gray-800 rounded-lg p-2">
              <p className="text-gray-400">Concurso formal (Art. 70 CP)</p>
              <p className="text-yellow-300 font-bold">{fmt(resultado.formalMin)} a {fmt(resultado.formalMax)}</p>
              <p className="text-gray-500">Pena mais grave + 1/6 até metade</p>
            </div>
            <div className="bg-gray-800 rounded-lg p-2">
              <p className="text-gray-400">Pena mais grave isolada (referência)</p>
              <p className="text-yellow-300 font-bold">{fmt(resultado.ideal)}</p>
              <p className="text-gray-500">Pena da infração mais grave</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
