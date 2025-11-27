"use client";

import { useState, useEffect } from 'react';
import { Plus, TrendingUp, TrendingDown, DollarSign, Search, Filter, Calendar, Download, PieChart, ChevronLeft, ChevronRight, History, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Transacao, CategoriaReceita, CategoriaDespesa, DadosMensais } from '@/lib/types';
import { format, startOfMonth, endOfMonth, isWithinInterval, isSameMonth, addMonths, subMonths } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface AbaFinancasProps {
  corDestaque: string;
}

export function AbaFinancas({ corDestaque }: AbaFinancasProps) {
  // Estado para o mês atual de trabalho
  const [mesAtual, setMesAtual] = useState<Date>(new Date());
  const mesAnoAtual = format(mesAtual, 'yyyy-MM');
  
  // Estado para o mês selecionado no relatório
  const [mesSelecionadoRelatorio, setMesSelecionadoRelatorio] = useState<string>(mesAnoAtual);
  
  // Histórico de dados mensais
  const [historicoMensal, setHistoricoMensal] = useState<DadosMensais[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('plannerCell_historicoFinanceiro');
      if (saved) {
        const parsed = JSON.parse(saved);
        // Converter strings de data de volta para objetos Date
        return parsed.map((mes: any) => ({
          ...mes,
          transacoes: mes.transacoes.map((t: any) => ({
            ...t,
            data: new Date(t.data)
          }))
        }));
      }
    }
    return [];
  });

  const [transacoes, setTransacoes] = useState<Transacao[]>(() => {
    // Buscar transações do mês atual no histórico
    const mesExistente = historicoMensal.find(m => m.mesAno === mesAnoAtual);
    return mesExistente ? mesExistente.transacoes : [];
  });

  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [tipoTransacao, setTipoTransacao] = useState<'receita' | 'despesa'>('receita');
  const [termoBusca, setTermoBusca] = useState('');
  const [filtroCategoria, setFiltroCategoria] = useState<string>('todas');
  const [mostrarRelatorio, setMostrarRelatorio] = useState(false);
  const [mostrarHistorico, setMostrarHistorico] = useState(false);
  
  const [formTransacao, setFormTransacao] = useState({
    categoria: '',
    valor: '',
    descricao: '',
    data: format(new Date(), 'yyyy-MM-dd'),
  });

  const categoriasReceita: CategoriaReceita[] = ['Salário', 'Freelance', 'Investimentos', 'Outros'];
  const categoriasDespesa: CategoriaDespesa[] = ['Alimentação', 'Transporte', 'Moradia', 'Saúde', 'Educação', 'Lazer', 'Cartão de Crédito', 'Outros'];

  // Verificar mudança de mês e notificar
  useEffect(() => {
    const verificarMudancaMes = () => {
      const agora = new Date();
      const mesAnoAgora = format(agora, 'yyyy-MM');
      const ultimaVerificacao = localStorage.getItem('plannerCell_ultimaVerificacaoMes');
      
      if (ultimaVerificacao !== mesAnoAgora) {
        // Mudou o mês!
        const mesAnterior = format(subMonths(agora, 1), 'yyyy-MM');
        
        // Verificar se há dados do mês anterior
        const dadosMesAnterior = historicoMensal.find(m => m.mesAno === mesAnterior);
        
        if (dadosMesAnterior && dadosMesAnterior.transacoes.length > 0) {
          // Mostrar notificação de fechamento de mês
          const mesAnteriorNome = format(subMonths(agora, 1), 'MMMM/yyyy', { locale: ptBR });
          alert(`📊 Fechamento de ${mesAnteriorNome}\n\n` +
                `Receitas: R$ ${dadosMesAnterior.totalReceitas.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}\n` +
                `Despesas: R$ ${dadosMesAnterior.totalDespesas.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}\n` +
                `Saldo: R$ ${dadosMesAnterior.saldo.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}\n\n` +
                `Novo mês iniciado! 🎉`);
        }
        
        localStorage.setItem('plannerCell_ultimaVerificacaoMes', mesAnoAgora);
        
        // Atualizar para o novo mês
        setMesAtual(agora);
        setTransacoes([]); // Zerar transações do novo mês
      }
    };

    verificarMudancaMes();
    
    // Verificar a cada hora
    const intervalo = setInterval(verificarMudancaMes, 60 * 60 * 1000);
    
    return () => clearInterval(intervalo);
  }, [historicoMensal]);

  // Salvar dados do mês atual no histórico
  useEffect(() => {
    if (transacoes.length === 0 && historicoMensal.find(m => m.mesAno === mesAnoAtual)) {
      // Se não há transações mas existe no histórico, não fazer nada
      return;
    }

    const totalReceitas = transacoes
      .filter(t => t.tipo === 'receita')
      .reduce((acc, t) => acc + t.valor, 0);

    const totalDespesas = transacoes
      .filter(t => t.tipo === 'despesa')
      .reduce((acc, t) => acc + t.valor, 0);

    const saldo = totalReceitas - totalDespesas;

    const receitasPorCategoria = transacoes
      .filter(t => t.tipo === 'receita')
      .reduce((acc, t) => {
        acc[t.categoria] = (acc[t.categoria] || 0) + t.valor;
        return acc;
      }, {} as Record<string, number>);

    const despesasPorCategoria = transacoes
      .filter(t => t.tipo === 'despesa')
      .reduce((acc, t) => {
        acc[t.categoria] = (acc[t.categoria] || 0) + t.valor;
        return acc;
      }, {} as Record<string, number>);

    const dadosMes: DadosMensais = {
      mesAno: mesAnoAtual,
      transacoes,
      totalReceitas,
      totalDespesas,
      saldo,
      receitasPorCategoria,
      despesasPorCategoria,
    };

    // Atualizar histórico
    setHistoricoMensal(prev => {
      const novoHistorico = prev.filter(m => m.mesAno !== mesAnoAtual);
      const atualizado = [...novoHistorico, dadosMes].sort((a, b) => b.mesAno.localeCompare(a.mesAno));
      
      // Salvar no localStorage
      if (typeof window !== 'undefined') {
        localStorage.setItem('plannerCell_historicoFinanceiro', JSON.stringify(atualizado));
      }
      
      return atualizado;
    });
  }, [transacoes, mesAnoAtual]);

  const adicionarTransacao = () => {
    if (!formTransacao.categoria || !formTransacao.valor || !formTransacao.descricao) return;

    const dataTransacao = new Date(formTransacao.data);
    const mesAnoTransacao = format(dataTransacao, 'yyyy-MM');

    const novaTransacao: Transacao = {
      id: Date.now().toString(),
      tipo: tipoTransacao,
      categoria: formTransacao.categoria as any,
      valor: parseFloat(formTransacao.valor),
      descricao: formTransacao.descricao,
      data: dataTransacao,
      mesAno: mesAnoTransacao,
    };

    // Verificar se a transação é do mês atual
    if (mesAnoTransacao === mesAnoAtual) {
      setTransacoes([novaTransacao, ...transacoes]);
    } else {
      // Adicionar ao histórico do mês correspondente
      alert(`⚠️ Esta transação será adicionada ao mês ${format(dataTransacao, 'MMMM/yyyy', { locale: ptBR })}`);
      
      setHistoricoMensal(prev => {
        const mesExistente = prev.find(m => m.mesAno === mesAnoTransacao);
        
        if (mesExistente) {
          // Atualizar mês existente
          const transacoesAtualizadas = [novaTransacao, ...mesExistente.transacoes];
          const totalReceitas = transacoesAtualizadas
            .filter(t => t.tipo === 'receita')
            .reduce((acc, t) => acc + t.valor, 0);
          const totalDespesas = transacoesAtualizadas
            .filter(t => t.tipo === 'despesa')
            .reduce((acc, t) => acc + t.valor, 0);
          
          const receitasPorCategoria = transacoesAtualizadas
            .filter(t => t.tipo === 'receita')
            .reduce((acc, t) => {
              acc[t.categoria] = (acc[t.categoria] || 0) + t.valor;
              return acc;
            }, {} as Record<string, number>);

          const despesasPorCategoria = transacoesAtualizadas
            .filter(t => t.tipo === 'despesa')
            .reduce((acc, t) => {
              acc[t.categoria] = (acc[t.categoria] || 0) + t.valor;
              return acc;
            }, {} as Record<string, number>);

          const mesAtualizado: DadosMensais = {
            ...mesExistente,
            transacoes: transacoesAtualizadas,
            totalReceitas,
            totalDespesas,
            saldo: totalReceitas - totalDespesas,
            receitasPorCategoria,
            despesasPorCategoria,
          };

          const novoHistorico = prev.map(m => m.mesAno === mesAnoTransacao ? mesAtualizado : m);
          localStorage.setItem('plannerCell_historicoFinanceiro', JSON.stringify(novoHistorico));
          return novoHistorico;
        } else {
          // Criar novo mês
          const novoMes: DadosMensais = {
            mesAno: mesAnoTransacao,
            transacoes: [novaTransacao],
            totalReceitas: tipoTransacao === 'receita' ? novaTransacao.valor : 0,
            totalDespesas: tipoTransacao === 'despesa' ? novaTransacao.valor : 0,
            saldo: tipoTransacao === 'receita' ? novaTransacao.valor : -novaTransacao.valor,
            receitasPorCategoria: tipoTransacao === 'receita' ? { [novaTransacao.categoria]: novaTransacao.valor } : {},
            despesasPorCategoria: tipoTransacao === 'despesa' ? { [novaTransacao.categoria]: novaTransacao.valor } : {},
          };
          
          const novoHistorico = [...prev, novoMes].sort((a, b) => b.mesAno.localeCompare(a.mesAno));
          localStorage.setItem('plannerCell_historicoFinanceiro', JSON.stringify(novoHistorico));
          return novoHistorico;
        }
      });
    }

    setFormTransacao({
      categoria: '',
      valor: '',
      descricao: '',
      data: format(new Date(), 'yyyy-MM-dd'),
    });
    setMostrarFormulario(false);
  };

  // Cálculos financeiros do mês atual
  const totalReceitas = transacoes
    .filter(t => t.tipo === 'receita')
    .reduce((acc, t) => acc + t.valor, 0);

  const totalDespesas = transacoes
    .filter(t => t.tipo === 'despesa')
    .reduce((acc, t) => acc + t.valor, 0);

  const saldo = totalReceitas - totalDespesas;

  // Filtros
  const transacoesFiltradas = transacoes.filter(t => {
    const matchBusca = t.descricao.toLowerCase().includes(termoBusca.toLowerCase()) ||
                       t.categoria.toLowerCase().includes(termoBusca.toLowerCase());
    const matchCategoria = filtroCategoria === 'todas' || t.categoria === filtroCategoria;
    return matchBusca && matchCategoria;
  });

  // Dados do relatório (mês selecionado)
  const dadosRelatorio = historicoMensal.find(m => m.mesAno === mesSelecionadoRelatorio) || {
    mesAno: mesSelecionadoRelatorio,
    transacoes: [],
    totalReceitas: 0,
    totalDespesas: 0,
    saldo: 0,
    receitasPorCategoria: {},
    despesasPorCategoria: {},
  };

  const exportarRelatorio = () => {
    const mesNome = format(new Date(mesSelecionadoRelatorio + '-01'), 'MMMM yyyy', { locale: ptBR });
    const relatorio = {
      periodo: mesNome,
      ...dadosRelatorio,
    };

    const blob = new Blob([JSON.stringify(relatorio, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `relatorio-financeiro-${mesSelecionadoRelatorio}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Gerar lista de meses disponíveis para o dropdown
  const mesesDisponiveis = Array.from(
    new Set([mesAnoAtual, ...historicoMensal.map(m => m.mesAno)])
  ).sort((a, b) => b.localeCompare(a));

  const navegarMes = (direcao: 'anterior' | 'proximo') => {
    if (direcao === 'anterior') {
      setMesAtual(prev => subMonths(prev, 1));
    } else {
      const proximoMes = addMonths(mesAtual, 1);
      const agora = new Date();
      
      // Não permitir navegar para meses futuros
      if (proximoMes <= agora) {
        setMesAtual(proximoMes);
      }
    }
  };

  // Atualizar transações quando mudar o mês
  useEffect(() => {
    const novoMesAno = format(mesAtual, 'yyyy-MM');
    const mesExistente = historicoMensal.find(m => m.mesAno === novoMesAno);
    setTransacoes(mesExistente ? mesExistente.transacoes : []);
  }, [mesAtual, historicoMensal]);

  return (
    <div className="space-y-6">
      {/* Cabeçalho com navegação de mês */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 border border-gray-200 dark:border-gray-700 shadow-sm transition-colors duration-300">
        <div className="flex items-center justify-between">
          <Button
            onClick={() => navegarMes('anterior')}
            variant="outline"
            size="sm"
            className="border-gray-200 dark:border-gray-700"
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>
          
          <div className="text-center">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              {format(mesAtual, 'MMMM yyyy', { locale: ptBR })}
            </h2>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Mês atual de cadastro
            </p>
          </div>
          
          <Button
            onClick={() => navegarMes('proximo')}
            variant="outline"
            size="sm"
            className="border-gray-200 dark:border-gray-700"
            disabled={format(addMonths(mesAtual, 1), 'yyyy-MM') > format(new Date(), 'yyyy-MM')}
          >
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Cards de resumo */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Receitas */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200 dark:border-gray-700 shadow-sm transition-colors duration-300">
          <div className="flex items-center justify-between mb-2">
            <div className="p-2 rounded-xl bg-green-50 dark:bg-green-900/20">
              <TrendingUp className="w-5 h-5 text-green-600 dark:text-green-400" />
            </div>
            <span className="text-xs text-gray-500 dark:text-gray-400">Receitas</span>
          </div>
          <div className="text-2xl font-bold text-gray-900 dark:text-white">
            R$ {totalReceitas.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </div>
        </div>

        {/* Despesas */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200 dark:border-gray-700 shadow-sm transition-colors duration-300">
          <div className="flex items-center justify-between mb-2">
            <div className="p-2 rounded-xl bg-red-50 dark:bg-red-900/20">
              <TrendingDown className="w-5 h-5 text-red-600 dark:text-red-400" />
            </div>
            <span className="text-xs text-gray-500 dark:text-gray-400">Despesas</span>
          </div>
          <div className="text-2xl font-bold text-gray-900 dark:text-white">
            R$ {totalDespesas.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </div>
        </div>

        {/* Saldo */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200 dark:border-gray-700 shadow-sm transition-colors duration-300">
          <div className="flex items-center justify-between mb-2">
            <div className="p-2 rounded-xl" style={{ backgroundColor: `${corDestaque}20` }}>
              <DollarSign className="w-5 h-5" style={{ color: corDestaque }} />
            </div>
            <span className="text-xs text-gray-500 dark:text-gray-400">Saldo</span>
          </div>
          <div className={`text-2xl font-bold ${saldo >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
            R$ {Math.abs(saldo).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </div>
        </div>
      </div>

      {/* Barra de ações */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-gray-500" />
          <Input
            value={termoBusca}
            onChange={(e) => setTermoBusca(e.target.value)}
            placeholder="Buscar transações..."
            className="pl-10 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500"
          />
        </div>
        
        <select
          value={filtroCategoria}
          onChange={(e) => setFiltroCategoria(e.target.value)}
          className="px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-700 dark:text-gray-300"
        >
          <option value="todas">Todas categorias</option>
          <optgroup label="Receitas">
            {categoriasReceita.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </optgroup>
          <optgroup label="Despesas">
            {categoriasDespesa.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </optgroup>
        </select>

        <Button
          onClick={() => setMostrarHistorico(!mostrarHistorico)}
          variant="outline"
          className="border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
        >
          <History className="w-5 h-5 mr-2" />
          Histórico
        </Button>

        <Button
          onClick={() => setMostrarRelatorio(!mostrarRelatorio)}
          variant="outline"
          className="border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
        >
          <PieChart className="w-5 h-5 mr-2" />
          Relatório
        </Button>

        <Button
          onClick={exportarRelatorio}
          variant="outline"
          className="border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
        >
          <Download className="w-5 h-5 mr-2" />
          Exportar
        </Button>
      </div>

      {/* Histórico mensal */}
      {mostrarHistorico && (
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200 dark:border-gray-700 shadow-sm space-y-4 transition-colors duration-300">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <History className="w-5 h-5" />
            Histórico Mensal
          </h3>
          
          {historicoMensal.length === 0 ? (
            <div className="text-center py-8">
              <AlertCircle className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
              <p className="text-gray-500 dark:text-gray-400">Nenhum histórico disponível</p>
            </div>
          ) : (
            <div className="space-y-3">
              {historicoMensal.map((mes) => {
                const mesNome = format(new Date(mes.mesAno + '-01'), 'MMMM yyyy', { locale: ptBR });
                return (
                  <div
                    key={mes.mesAno}
                    className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4 border border-gray-200 dark:border-gray-600"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-semibold text-gray-900 dark:text-white capitalize">
                        {mesNome}
                      </h4>
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        {mes.transacoes.length} transações
                      </span>
                    </div>
                    
                    <div className="grid grid-cols-3 gap-3 text-sm">
                      <div>
                        <p className="text-gray-500 dark:text-gray-400 text-xs mb-1">Receitas</p>
                        <p className="font-semibold text-green-600 dark:text-green-400">
                          R$ {mes.totalReceitas.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-500 dark:text-gray-400 text-xs mb-1">Despesas</p>
                        <p className="font-semibold text-red-600 dark:text-red-400">
                          R$ {mes.totalDespesas.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-500 dark:text-gray-400 text-xs mb-1">Saldo</p>
                        <p className={`font-semibold ${mes.saldo >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                          R$ {Math.abs(mes.saldo).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Relatório detalhado */}
      {mostrarRelatorio && (
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200 dark:border-gray-700 shadow-sm space-y-6 transition-colors duration-300">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">Análise Financeira</h3>
            
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-gray-500 dark:text-gray-400" />
              <select
                value={mesSelecionadoRelatorio}
                onChange={(e) => setMesSelecionadoRelatorio(e.target.value)}
                className="px-3 py-1.5 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-sm text-gray-700 dark:text-gray-300"
              >
                {mesesDisponiveis.map(mesAno => {
                  const mesNome = format(new Date(mesAno + '-01'), 'MMMM yyyy', { locale: ptBR });
                  return (
                    <option key={mesAno} value={mesAno}>
                      {mesNome}
                    </option>
                  );
                })}
              </select>
            </div>
          </div>

          {/* Resumo do mês selecionado */}
          <div className="grid grid-cols-3 gap-4 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
            <div className="text-center">
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Receitas</p>
              <p className="text-lg font-bold text-green-600 dark:text-green-400">
                R$ {dadosRelatorio.totalReceitas.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </p>
            </div>
            <div className="text-center">
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Despesas</p>
              <p className="text-lg font-bold text-red-600 dark:text-red-400">
                R$ {dadosRelatorio.totalDespesas.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </p>
            </div>
            <div className="text-center">
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Saldo</p>
              <p className={`text-lg font-bold ${dadosRelatorio.saldo >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                R$ {Math.abs(dadosRelatorio.saldo).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Receitas por categoria */}
            <div>
              <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-green-600 dark:text-green-400" />
                Receitas por Categoria
              </h4>
              <div className="space-y-2">
                {Object.keys(dadosRelatorio.receitasPorCategoria).length === 0 ? (
                  <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-4">
                    Nenhuma receita neste período
                  </p>
                ) : (
                  Object.entries(dadosRelatorio.receitasPorCategoria).map(([categoria, valor]) => {
                    const percentual = (valor / dadosRelatorio.totalReceitas) * 100;
                    return (
                      <div key={categoria} className="space-y-1">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600 dark:text-gray-400">{categoria}</span>
                          <span className="font-semibold text-gray-900 dark:text-white">
                            R$ {valor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                          </span>
                        </div>
                        <div className="w-full bg-gray-100 dark:bg-gray-700 rounded-full h-2">
                          <div
                            className="bg-green-500 dark:bg-green-400 h-2 rounded-full transition-all duration-500"
                            style={{ width: `${percentual}%` }}
                          />
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            {/* Despesas por categoria */}
            <div>
              <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2">
                <TrendingDown className="w-4 h-4 text-red-600 dark:text-red-400" />
                Despesas por Categoria
              </h4>
              <div className="space-y-2">
                {Object.keys(dadosRelatorio.despesasPorCategoria).length === 0 ? (
                  <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-4">
                    Nenhuma despesa neste período
                  </p>
                ) : (
                  Object.entries(dadosRelatorio.despesasPorCategoria).map(([categoria, valor]) => {
                    const percentual = (valor / dadosRelatorio.totalDespesas) * 100;
                    return (
                      <div key={categoria} className="space-y-1">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600 dark:text-gray-400">{categoria}</span>
                          <span className="font-semibold text-gray-900 dark:text-white">
                            R$ {valor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                          </span>
                        </div>
                        <div className="w-full bg-gray-100 dark:bg-gray-700 rounded-full h-2">
                          <div
                            className="bg-red-500 dark:bg-red-400 h-2 rounded-full transition-all duration-500"
                            style={{ width: `${percentual}%` }}
                          />
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Botão adicionar transação */}
      {!mostrarFormulario && (
        <div className="grid grid-cols-2 gap-3">
          <Button
            onClick={() => {
              setTipoTransacao('receita');
              setMostrarFormulario(true);
            }}
            className="h-12 text-white hover:opacity-90"
            style={{ backgroundColor: '#10b981' }}
          >
            <Plus className="w-5 h-5 mr-2" />
            Nova Receita
          </Button>
          <Button
            onClick={() => {
              setTipoTransacao('despesa');
              setMostrarFormulario(true);
            }}
            className="h-12 text-white hover:opacity-90"
            style={{ backgroundColor: '#ef4444' }}
          >
            <Plus className="w-5 h-5 mr-2" />
            Nova Despesa
          </Button>
        </div>
      )}

      {/* Formulário de nova transação */}
      {mostrarFormulario && (
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200 dark:border-gray-700 shadow-sm space-y-4 transition-colors duration-300">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Nova {tipoTransacao === 'receita' ? 'Receita' : 'Despesa'}
          </h3>

          <div>
            <label className="text-gray-600 dark:text-gray-400 text-sm mb-1 block">Categoria</label>
            <select
              value={formTransacao.categoria}
              onChange={(e) => setFormTransacao({ ...formTransacao, categoria: e.target.value })}
              className="w-full bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 text-gray-900 dark:text-white rounded-lg px-3 py-2"
            >
              <option value="">Selecione uma categoria</option>
              {(tipoTransacao === 'receita' ? categoriasReceita : categoriasDespesa).map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-gray-600 dark:text-gray-400 text-sm mb-1 block">Valor (R$)</label>
            <Input
              type="number"
              step="0.01"
              value={formTransacao.valor}
              onChange={(e) => setFormTransacao({ ...formTransacao, valor: e.target.value })}
              placeholder="0,00"
              className="bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600 text-gray-900 dark:text-white"
            />
          </div>

          <div>
            <label className="text-gray-600 dark:text-gray-400 text-sm mb-1 block">Descrição</label>
            <Input
              value={formTransacao.descricao}
              onChange={(e) => setFormTransacao({ ...formTransacao, descricao: e.target.value })}
              placeholder="Ex: Supermercado, Salário..."
              className="bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600 text-gray-900 dark:text-white"
            />
          </div>

          <div>
            <label className="text-gray-600 dark:text-gray-400 text-sm mb-1 block">Data</label>
            <Input
              type="date"
              value={formTransacao.data}
              onChange={(e) => setFormTransacao({ ...formTransacao, data: e.target.value })}
              className="bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600 text-gray-900 dark:text-white"
            />
          </div>

          <div className="flex gap-2 pt-2">
            <Button
              onClick={adicionarTransacao}
              className="flex-1 text-white hover:opacity-90"
              style={{ backgroundColor: tipoTransacao === 'receita' ? '#10b981' : '#ef4444' }}
            >
              Adicionar
            </Button>
            <Button
              onClick={() => {
                setMostrarFormulario(false);
                setFormTransacao({
                  categoria: '',
                  valor: '',
                  descricao: '',
                  data: format(new Date(), 'yyyy-MM-dd'),
                });
              }}
              variant="outline"
              className="flex-1 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              Cancelar
            </Button>
          </div>
        </div>
      )}

      {/* Lista de transações */}
      <div className="space-y-3">
        {transacoesFiltradas.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-12 border border-gray-200 dark:border-gray-700 text-center shadow-sm transition-colors duration-300">
            <DollarSign className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
            <p className="text-gray-500 dark:text-gray-400">Nenhuma transação encontrada</p>
            <p className="text-gray-400 dark:text-gray-500 text-sm mt-2">Adicione receitas e despesas acima</p>
          </div>
        ) : (
          transacoesFiltradas.map((transacao) => (
            <div
              key={transacao.id}
              className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700 hover:shadow-md transition-all duration-300"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div
                    className={`p-2 rounded-xl ${
                      transacao.tipo === 'receita' ? 'bg-green-50 dark:bg-green-900/20' : 'bg-red-50 dark:bg-red-900/20'
                    }`}
                  >
                    {transacao.tipo === 'receita' ? (
                      <TrendingUp className="w-5 h-5 text-green-600 dark:text-green-400" />
                    ) : (
                      <TrendingDown className="w-5 h-5 text-red-600 dark:text-red-400" />
                    )}
                  </div>
                  <div>
                    <h3 className="text-gray-900 dark:text-white font-medium">{transacao.descricao}</h3>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs text-gray-500 dark:text-gray-400">{transacao.categoria}</span>
                      <span className="text-xs text-gray-400 dark:text-gray-500">•</span>
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        {format(transacao.data, "d 'de' MMM", { locale: ptBR })}
                      </span>
                    </div>
                  </div>
                </div>
                <div
                  className={`text-lg font-bold ${
                    transacao.tipo === 'receita' ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
                  }`}
                >
                  {transacao.tipo === 'receita' ? '+' : '-'} R${' '}
                  {transacao.valor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
