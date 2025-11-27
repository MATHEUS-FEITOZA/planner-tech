"use client";

import { useState, useEffect } from 'react';
import { CheckSquare, DollarSign, Moon, Sun } from 'lucide-react';
import { AbaTarefas } from '@/components/custom/aba-tarefas';
import { AbaFinancas } from '@/components/custom/aba-financas';
import { Button } from '@/components/ui/button';

type AbaAtiva = 'tarefas' | 'financas';

export default function Home() {
  const [abaAtiva, setAbaAtiva] = useState<AbaAtiva>('tarefas');
  const [tema, setTema] = useState<'light' | 'dark'>('light');
  const corDestaque = '#6366f1'; // Indigo moderno

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

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-50 shadow-sm transition-colors duration-300">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">PlannerCell</h1>
              <p className="text-gray-500 dark:text-gray-400 text-sm">Organize sua vida em um só lugar</p>
            </div>
            
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

      {/* Feedback e suporte */}
      <div className="max-w-4xl mx-auto px-4 py-6">
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200 dark:border-gray-700 shadow-sm transition-colors duration-300">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Feedback & Suporte</h3>
          <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">
            Encontrou algum problema ou tem sugestões? Adoraríamos ouvir você!
          </p>
          <div className="flex gap-3">
            <Button
              onClick={() => alert('Funcionalidade de feedback em desenvolvimento. Por enquanto, entre em contato por email: suporte@plannercell.com')}
              className="text-white hover:opacity-90"
              style={{ backgroundColor: corDestaque }}
            >
              Enviar Feedback
            </Button>
            <Button
              onClick={() => alert('Central de ajuda em desenvolvimento. Documentação disponível em breve!')}
              variant="outline"
              className="border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              Central de Ajuda
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
