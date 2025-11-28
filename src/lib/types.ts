// Tipos de prioridade
export type PrioridadeTarefa = 'baixa' | 'media' | 'alta';

// Tipo de tarefa
export interface Tarefa {
  id: string;
  titulo: string;
  prioridade: PrioridadeTarefa;
  concluida: boolean;
  data: Date;
  horario?: string;
  alertaMinutos?: number;
}

// Categorias de receita
export type CategoriaReceita = 'Salário' | 'Freelance' | 'Investimentos' | 'Outros';

// Categorias de despesa
export type CategoriaDespesa = 'Alimentação' | 'Transporte' | 'Moradia' | 'Saúde' | 'Educação' | 'Lazer' | 'Cartão de Crédito' | 'Outros';

// Tipo de transação
export interface Transacao {
  id: string;
  tipo: 'receita' | 'despesa';
  categoria: CategoriaReceita | CategoriaDespesa;
  valor: number;
  descricao: string;
  data: Date;
  mesAno: string; // formato: 'yyyy-MM'
}

// Dados mensais agregados
export interface DadosMensais {
  mesAno: string; // formato: 'yyyy-MM'
  transacoes: Transacao[];
  totalReceitas: number;
  totalDespesas: number;
  saldo: number;
  receitasPorCategoria: Record<string, number>;
  despesasPorCategoria: Record<string, number>;
}

// Tipos de usuário e assinatura
export type PlanoAssinatura = 'free' | 'mensal' | 'anual';

export interface PerfilUsuario {
  id: string;
  email: string;
  nome?: string;
  plano: PlanoAssinatura;
  data_assinatura?: string;
  data_expiracao?: string;
  created_at: string;
}
