import type { ReactNode } from "react";

export type Color = "blue" | "yellow" | "red" | "green" | "gray";

export interface InfoProps {
  color?: Color;
  title?: string;
  children: ReactNode;
}

export interface PillProps {
  color: Color;
  children: ReactNode;
}

export interface RowItem {
  desc: string;
  frac: string;
}

export interface Crime {
  nome: string;
  tipo: string;
  pena_min: number;
  pena_max: number;
  violento: boolean;
  observacao: string;
}

export interface ConcursoCrime {
  id: number;
  nome: string;
  tipo: string;
  penaMin: string;
  penaMax: string;
  penaDef: string;
  observacao: string;
}

export interface PrescricaoConfig {
  reducaoMetade: boolean;
  retroativa: boolean;
  dataDenuncia: string;
  dataSentenca: string;
  periodosSuspensao: { motivo: string; dias: string }[];
  fugaDias: string;
}

export interface MedidaSeguranca {
  ativa: boolean;
  tipo: string;
  prazo: string;
}

export interface MultaConfig {
  diasMulta: string;
  valorDiaMulta: string;
  salarioMinimo: string;
  fracaoSalario: string;
}

export interface VetorInfo {
  name: string;
  art: string;
  desc: string;
  desfavoravel: string;
  alerta: string;
}

export interface SumulaInfo {
  id: string;
  fase: string;
  cor: Color;
  text: string;
}

export interface PrescricaoFaixa {
  faixa: string;
  prazo: number;
}

export interface ListItem {
  code: string;
  desc: string;
}
