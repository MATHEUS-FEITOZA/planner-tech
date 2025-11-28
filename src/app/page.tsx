"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { CheckSquare, DollarSign, Moon, Sun, LogOut, Crown, Settings } from 'lucide-react';
import { AbaTarefas } from '@/components/custom/aba-tarefas';
import { AbaFinancas } from '@/components/custom/aba-financas';
import { Button } from '@/components/ui/button';
import { Logo } from '@/components/custom/logo';
import { supabase, obterPerfil, verificarAssinatura } from '@/lib/supabase';
import type { PerfilUsuario } from '@/lib/types';

type AbaAtiva = 'tarefas' | 'financas';

export default function Home() {
  const router = useRouter();
  const [abaAtiva, setAbaAtiva] = useState<AbaAtiva>('tarefas');
  const [tema, setTema] = useState<'light' | 'dark'>('light');
  const [perfil, setPerfil] = useState<PerfilUsuario | null>(null);
  const [temAssinatura, setTemAssinatura] = useState(false);
  const [carregando, setCarregando] = useState(true);
  const corDestaque = '#6366f1'; // Indigo moderno

  // Verificar autenticação e assinatura
  useEffect(() => {
    const verificarAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        router.push('/login');
        return;
      }

      const perfilUsuario = await obterPerfil();
      setPerfil(perfilUsuario);

      const assinaturaAtiva = await verificarAssinatura();
      setTemAssinatura(assinaturaAtiva);

      setCarregando(false);
    };

    verificarAuth();
  }, [router]);

  // Carregar tema do localStorage
  useEffect(() => {
    const temaSalvo = localStorage.getItem('tema') as 'light' | 'dark' | null;
    if (temaSalvo) {
      setTema(temaSalvo);
      document.documentElement.classList.toggle('dark', temaSalvo === 'dark');
    }
  }, []);

  // Alternar tema
  const toggleTema = () => {
    const novoTema = tema === 'light' ? 'dark' : 'light';
    setTema(novoTema);
    localStorage.setItem('tema', novoTema);
    document.documentElement.classList.toggle('dark', novoTema === 'dark');
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/login');
  };

  if (carregando) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <Logo size="lg" className="justify-center mb-4" />
          <p className="text-gray-600 dark:text-gray-400">Carregando...</p>
        </div>
      </div>
    );
  }

  // Bloqueio para plano free
  if (!temAssinatura && perfil?.plano === 'free') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 border border-gray-200 dark:border-gray-700 text-center">
          <div className="inline-flex p-4 rounded-full bg-purple-100 dark:bg-purple-900/20 mb-6">
            <Crown className="w-12 h-12 text-purple-600 dark:text-purple-400" />
          </div>
          
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Assine para continuar
          </h2>
          
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Você está no plano gratuito. Para acessar todas as funcionalidades do PlannerCell, 
            escolha um de nossos planos premium.
          </p>

          <div className="space-y-3">
            <Button
              onClick={() => router.push('/pricing')}
              className="w-full h-12 text-white font-medium bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
            >
              Ver planos disponíveis
            </Button>
            
            <Button
              onClick={handleLogout}
              variant="outline"
              className="w-full h-12"
            >
              Sair
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-50 shadow-sm transition-colors duration-300">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between mb-4">
            <Logo size="md" />
            
            <div className="flex items-center gap-2">
              {/* Badge do plano */}
              {perfil && (
                <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-full">
                  <Crown className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                  <span className="text-xs font-medium text-purple-600 dark:text-purple-400">
                    {perfil.plano === 'mensal' ? 'Mensal' : 'Anual'}
                  </span>
                </div>
              )}

              {/* Botão de configurações */}
              <Button
                onClick={() => router.push('/pricing')}
                variant="outline"
                size="icon"
                className="border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700"
                title="Gerenciar assinatura"
              >
                <Settings className="w-5 h-5 text-gray-700 dark:text-gray-300" />
              </Button>

              {/* Botão de tema */}
              <Button
                onClick={toggleTema}
                variant="outline"
                size="icon"
                className="border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                {tema === 'light' ? (
                  <Moon className="w-5 h-5 text-gray-700 dark:text-gray-300" />
                ) : (
                  <Sun className="w-5 h-5 text-gray-700 dark:text-gray-300" />
                )}
              </Button>

              {/* Botão de logout */}
              <Button
                onClick={handleLogout}
                variant="outline"
                size="icon"
                className="border-gray-300 dark:border-gray-600 hover:bg-red-50 dark:hover:bg-red-900/20 hover:border-red-300 dark:hover:border-red-800 transition-colors"
                title="Sair"
              >
                <LogOut className="w-5 h-5 text-gray-700 dark:text-gray-300" />
              </Button>
            </div>
          </div>

          {/* Navegação de abas */}
          <div className="flex gap-2">
            <button
              onClick={() => setAbaAtiva('tarefas')}
              className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-medium transition-all duration-300 ${
                abaAtiva === 'tarefas'
                  ? 'text-white shadow-lg'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
              style={abaAtiva === 'tarefas' ? { backgroundColor: corDestaque } : {}}
            >
              <CheckSquare className="w-5 h-5" />
              Tarefas
            </button>
            <button
              onClick={() => setAbaAtiva('financas')}
              className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-medium transition-all duration-300 ${
                abaAtiva === 'financas'
                  ? 'text-white shadow-lg'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
              style={abaAtiva === 'financas' ? { backgroundColor: corDestaque } : {}}
            >
              <DollarSign className="w-5 h-5" />
              Finanças
            </button>
          </div>
        </div>
      </div>

      {/* Conteúdo */}
      <div className="max-w-4xl mx-auto px-4 py-6">
        {abaAtiva === 'tarefas' && <AbaTarefas corDestaque={corDestaque} />}
        {abaAtiva === 'financas' && <AbaFinancas corDestaque={corDestaque} />}
      </div>

      {/* Footer */}
      <div className="max-w-4xl mx-auto px-4 py-6">
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200 dark:border-gray-700 shadow-sm transition-colors duration-300 text-center">
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
            Olá, <span className="font-semibold text-gray-900 dark:text-white">{perfil?.nome || perfil?.email}</span>!
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-500">
            Você está no plano <span className="font-semibold">{perfil?.plano === 'mensal' ? 'Mensal' : 'Anual'}</span>
          </p>
        </div>
      </div>
    </div>
  );
}
