// Tipos do PlannerCell

export type PrioridadeTarefa = 'baixa' | 'media' | 'alta';

export interface Tarefa {
  id: string;
  titulo: string;
  prioridade: PrioridadeTarefa;
  concluida: boolean;
  data: Date;
  horario?: string;
  alertaMinutos?: number;
}

export type CategoriaReceita = 'Salário' | 'Freelance' | 'Investimentos' | 'Outros';
export type CategoriaDespesa = 'Alimentação' | 'Transporte' | 'Moradia' | 'Saúde' | 'Educação' | 'Lazer' | 'Cartão de Crédito' | 'Outros';

export interface Transacao {
  id: string;
  tipo: 'receita' | 'despesa';
  categoria: CategoriaReceita | CategoriaDespesa;
  valor: number;
  descricao: string;
  data: Date;
  mesAno: string; // formato: "2024-01"
}

export interface DadosMensais {
  mesAno: string;
  transacoes: Transacao[];
  totalReceitas: number;
  totalDespesas: number;
  saldo: number;
  receitasPorCategoria: Record<string, number>;
  despesasPorCategoria: Record<string, number>;
}

export interface RelatorioFinanceiro {
  periodo: string;
  totalReceitas: number;
  totalDespesas: number;
  saldo: number;
  receitasPorCategoria: Record<string, number>;
  despesasPorCategoria: Record<string, number>;
}
