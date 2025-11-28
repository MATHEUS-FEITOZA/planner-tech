import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Tipos de assinatura
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

// Verificar se usuário tem assinatura ativa
export async function verificarAssinatura(): Promise<boolean> {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) return false;

  const { data: perfil } = await supabase
    .from('perfis')
    .select('plano, data_expiracao')
    .eq('id', user.id)
    .single();

  if (!perfil) return false;

  // Se for plano free, não tem acesso completo
  if (perfil.plano === 'free') return false;

  // Verificar se assinatura está ativa
  if (perfil.data_expiracao) {
    const dataExpiracao = new Date(perfil.data_expiracao);
    const hoje = new Date();
    return dataExpiracao > hoje;
  }

  return false;
}

// Obter perfil do usuário
export async function obterPerfil(): Promise<PerfilUsuario | null> {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) return null;

  const { data: perfil } = await supabase
    .from('perfis')
    .select('*')
    .eq('id', user.id)
    .single();

  return perfil;
}
