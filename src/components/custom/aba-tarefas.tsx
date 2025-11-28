"use client";

import { useState, useEffect } from 'react';
import { Plus, Check, Calendar, ChevronRight, Circle, CheckCircle2, Trash2, Clock, Bell, CalendarPlus, ChevronLeft, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tarefa, PrioridadeTarefa } from '@/lib/types';
import { format, addDays, isToday, isTomorrow, isBefore, startOfDay, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, addMonths, subMonths } from 'date-fns';
import { ptBR } from 'date-fns/locale';

// Gerar horários de 00:00 até 23:30 (intervalos de 30 minutos)
const gerarHorarios = () => {
  const horarios: string[] = [];
  for (let h = 0; h < 24; h++) {
    for (let m = 0; m < 60; m += 30) {
      const hora = h.toString().padStart(2, '0');
      const minuto = m.toString().padStart(2, '0');
      horarios.push(`${hora}:${minuto}`);
    }
  }
  return horarios;
};

const HORARIOS_DISPONIVEIS = gerarHorarios();

interface AbaTarefasProps {
  corDestaque: string;
}

export function AbaTarefas({ corDestaque }: AbaTarefasProps) {
  const [tarefas, setTarefas] = useState<Tarefa[]>([
    {
      id: '1',
      titulo: 'Revisar relatório mensal',
      prioridade: 'alta',
      concluida: false,
      data: new Date(),
    },
    {
      id: '2',
      titulo: 'Academia - treino de pernas',
      prioridade: 'media',
      concluida: false,
      data: new Date(),
      horario: '18:00',
      alertaMinutos: 15,
    },
    {
      id: '3',
      titulo: 'Estudar React avançado',
      prioridade: 'alta',
      concluida: true,
      data: new Date(),
    },
  ]);

  const [novaTarefa, setNovaTarefa] = useState('');
  const [dataSelecionada, setDataSelecionada] = useState(new Date());
  const [mesAtual, setMesAtual] = useState(new Date());
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [mostrarCalendario, setMostrarCalendario] = useState(false);
  const [mostrarDataCustomizada, setMostrarDataCustomizada] = useState(false);
  const [errosCampos, setErrosCampos] = useState<Record<string, string>>({});
  
  // Formulário de nova tarefa
  const [formTarefa, setFormTarefa] = useState({
    titulo: '',
    horario: '',
    comHorario: false,
    alertaMinutos: 15,
    dataCustomizada: '',
  });

  const proximosDias = Array.from({ length: 7 }, (_, i) => addDays(new Date(), i));

  // Sistema de alertas
  useEffect(() => {
    const verificarAlertas = () => {
      const agora = new Date();
      
      tarefas.forEach(tarefa => {
        if (!tarefa.concluida && tarefa.horario && tarefa.alertaMinutos) {
          const [horas, minutos] = tarefa.horario.split(':').map(Number);
          const horarioTarefa = new Date(tarefa.data);
          horarioTarefa.setHours(horas, minutos, 0, 0);
          
          const tempoParaAlerta = horarioTarefa.getTime() - (tarefa.alertaMinutos * 60 * 1000);
          const diferencaMinutos = Math.floor((tempoParaAlerta - agora.getTime()) / 60000);
          
          // Alerta quando faltam exatamente X minutos
          if (diferencaMinutos === 0) {
            if (Notification.permission === 'granted') {
              new Notification('PlannerCell - Lembrete de Tarefa', {
                body: `${tarefa.titulo} - em ${tarefa.alertaMinutos} minutos (${tarefa.horario})`,
                icon: '/icon.svg',
              });
            }
          }
        }
      });
    };

    // Solicitar permissão para notificações
    if (Notification.permission === 'default') {
      Notification.requestPermission();
    }

    // Verificar alertas a cada minuto
    const intervalo = setInterval(verificarAlertas, 60000);
    return () => clearInterval(intervalo);
  }, [tarefas]);

  const validarCampos = (): boolean => {
    const erros: Record<string, string> = {};

    if (!formTarefa.titulo.trim()) {
      erros.titulo = 'Título é obrigatório';
    }

    if (formTarefa.comHorario && !formTarefa.horario) {
      erros.horario = 'Selecione um horário';
    }

    setErrosCampos(erros);
    return Object.keys(erros).length === 0;
  };

  const adicionarTarefa = () => {
    if (!validarCampos()) {
      return;
    }

    let dataFinal = dataSelecionada;
    
    // Se tem data customizada, usar ela
    if (mostrarDataCustomizada && formTarefa.dataCustomizada) {
      dataFinal = new Date(formTarefa.dataCustomizada);
    }

    const tarefa: Tarefa = {
      id: Date.now().toString(),
      titulo: formTarefa.titulo,
      prioridade: 'media',
      concluida: false,
      data: dataFinal,
      horario: formTarefa.comHorario ? formTarefa.horario : undefined,
      alertaMinutos: formTarefa.comHorario ? formTarefa.alertaMinutos : undefined,
    };

    setTarefas([...tarefas, tarefa]);
    setFormTarefa({
      titulo: '',
      horario: '',
      comHorario: false,
      alertaMinutos: 15,
      dataCustomizada: '',
    });
    setErrosCampos({});
    setMostrarFormulario(false);
    setMostrarDataCustomizada(false);
  };

  const toggleTarefa = (id: string) => {
    setTarefas(tarefas.map(t => 
      t.id === id ? { ...t, concluida: !t.concluida } : t
    ));
  };

  const removerTarefa = (id: string) => {
    setTarefas(tarefas.filter(t => t.id !== id));
  };

  const tarefasDoDia = tarefas.filter(t => 
    format(t.data, 'yyyy-MM-dd') === format(dataSelecionada, 'yyyy-MM-dd')
  );

  const tarefasConcluidas = tarefasDoDia.filter(t => t.concluida).length;
  const totalTarefas = tarefasDoDia.length;
  const progresso = totalTarefas > 0 ? (tarefasConcluidas / totalTarefas) * 100 : 0;

  const getDiaLabel = (dia: Date) => {
    if (isToday(dia)) return 'Hoje';
    if (isTomorrow(dia)) return 'Amanhã';
    return format(dia, 'EEE', { locale: ptBR });
  };

  // Funções do calendário
  const diasDoMes = eachDayOfInterval({
    start: startOfMonth(mesAtual),
    end: endOfMonth(mesAtual)
  });

  const primeiroDiaSemana = startOfMonth(mesAtual).getDay();
  const diasVaziosInicio = Array(primeiroDiaSemana).fill(null);

  const getTarefasDoDia = (dia: Date) => {
    return tarefas.filter(t => 
      format(t.data, 'yyyy-MM-dd') === format(dia, 'yyyy-MM-dd')
    );
  };

  const mesAnterior = () => {
    setMesAtual(subMonths(mesAtual, 1));
  };

  const proximoMes = () => {
    setMesAtual(addMonths(mesAtual, 1));
  };

  return (
    <div className="space-y-6">
      {/* Header com progresso */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200 dark:border-gray-700 shadow-sm transition-colors duration-300">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Minhas Tarefas</h2>
            <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
              {tarefasConcluidas} de {totalTarefas} concluídas
            </p>
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold" style={{ color: corDestaque }}>{Math.round(progresso)}%</div>
            <p className="text-gray-500 dark:text-gray-400 text-xs">Progresso</p>
          </div>
        </div>
        
        {/* Barra de progresso */}
        <div className="w-full bg-gray-100 dark:bg-gray-700 rounded-full h-2 overflow-hidden">
          <div 
            className="h-full transition-all duration-500 rounded-full"
            style={{ width: `${progresso}%`, backgroundColor: corDestaque }}
          />
        </div>
      </div>

      {/* Toggle entre visualização rápida e calendário */}
      <div className="flex gap-2">
        <Button
          onClick={() => setMostrarCalendario(false)}
          className={`flex-1 h-12 transition-all duration-300 ${
            !mostrarCalendario
              ? 'text-white shadow-lg'
              : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700'
          }`}
          style={!mostrarCalendario ? { backgroundColor: corDestaque } : {}}
        >
          <ChevronRight className="w-5 h-5 mr-2" />
          Próximos 7 Dias
        </Button>
        <Button
          onClick={() => setMostrarCalendario(true)}
          className={`flex-1 h-12 transition-all duration-300 ${
            mostrarCalendario
              ? 'text-white shadow-lg'
              : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700'
          }`}
          style={mostrarCalendario ? { backgroundColor: corDestaque } : {}}
        >
          <Calendar className="w-5 h-5 mr-2" />
          Calendário
        </Button>
      </div>

      {/* Visualização de próximos 7 dias */}
      {!mostrarCalendario && (
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
          {proximosDias.map((dia, index) => {
            const tarefasDia = tarefas.filter(t => 
              format(t.data, 'yyyy-MM-dd') === format(dia, 'yyyy-MM-dd')
            );
            const ativo = isSameDay(dia, dataSelecionada);
            
            return (
              <button
                key={index}
                onClick={() => setDataSelecionada(dia)}
                className={`flex-shrink-0 rounded-xl p-4 min-w-[100px] transition-all duration-300 ${
                  ativo 
                    ? 'text-white scale-105 shadow-lg' 
                    : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-700'
                }`}
                style={ativo ? { backgroundColor: corDestaque } : {}}
              >
                <div className="text-center">
                  <div className={`text-xs font-medium mb-1 ${ativo ? 'text-white/80' : 'text-gray-500 dark:text-gray-400'}`}>
                    {getDiaLabel(dia)}
                  </div>
                  <div className={`text-2xl font-bold ${ativo ? 'text-white' : 'text-gray-900 dark:text-white'}`}>
                    {format(dia, 'd')}
                  </div>
                  {tarefasDia.length > 0 && (
                    <div className={`text-xs mt-1 ${ativo ? 'text-white/80' : 'text-gray-500 dark:text-gray-400'}`}>
                      {tarefasDia.length} {tarefasDia.length === 1 ? 'tarefa' : 'tarefas'}
                    </div>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      )}

      {/* Visualização de calendário mensal */}
      {mostrarCalendario && (
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200 dark:border-gray-700 shadow-sm transition-colors duration-300">
          {/* Header do calendário */}
          <div className="flex items-center justify-between mb-6">
            <button
              onClick={mesAnterior}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              <ChevronLeft className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            </button>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white capitalize">
              {format(mesAtual, 'MMMM yyyy', { locale: ptBR })}
            </h3>
            <button
              onClick={proximoMes}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              <ChevronRight className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            </button>
          </div>

          {/* Dias da semana */}
          <div className="grid grid-cols-7 gap-2 mb-2">
            {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map(dia => (
              <div key={dia} className="text-center text-xs font-semibold text-gray-500 dark:text-gray-400 py-2">
                {dia}
              </div>
            ))}
          </div>

          {/* Grade do calendário */}
          <div className="grid grid-cols-7 gap-2">
            {/* Dias vazios do início */}
            {diasVaziosInicio.map((_, index) => (
              <div key={`vazio-${index}`} className="aspect-square" />
            ))}

            {/* Dias do mês */}
            {diasDoMes.map(dia => {
              const tarefasDia = getTarefasDoDia(dia);
              const ativo = isSameDay(dia, dataSelecionada);
              const hoje = isToday(dia);
              const mesAtualCheck = isSameMonth(dia, mesAtual);

              return (
                <button
                  key={dia.toString()}
                  onClick={() => setDataSelecionada(dia)}
                  disabled={!mesAtualCheck}
                  className={`aspect-square rounded-xl p-2 transition-all duration-300 relative ${
                    !mesAtualCheck
                      ? 'text-gray-300 dark:text-gray-600 cursor-not-allowed'
                      : ativo
                      ? 'text-white shadow-lg scale-105'
                      : hoje
                      ? 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white font-bold hover:bg-gray-200 dark:hover:bg-gray-600'
                      : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-700'
                  }`}
                  style={ativo && mesAtualCheck ? { backgroundColor: corDestaque } : {}}
                >
                  <div className="text-sm font-medium">{format(dia, 'd')}</div>
                  {tarefasDia.length > 0 && mesAtualCheck && (
                    <div 
                      className={`absolute bottom-1 left-1/2 transform -translate-x-1/2 w-1.5 h-1.5 rounded-full ${
                        ativo ? 'bg-white' : ''
                      }`}
                      style={!ativo ? { backgroundColor: corDestaque } : {}}
                    />
                  )}
                  {tarefasDia.length > 1 && mesAtualCheck && (
                    <div className={`text-[10px] font-bold mt-0.5 ${ativo ? 'text-white/80' : 'text-gray-500 dark:text-gray-400'}`}>
                      {tarefasDia.length}
                    </div>
                  )}
                </button>
              );
            })}
          </div>

          {/* Legenda */}
          <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700 flex items-center justify-center gap-4 text-xs text-gray-500 dark:text-gray-400">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600" />
              <span>Hoje</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: corDestaque }} />
              <span>Com tarefas</span>
            </div>
          </div>
        </div>
      )}

      {/* Data selecionada */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700 shadow-sm transition-colors duration-300">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">Visualizando</p>
            <p className="text-lg font-bold text-gray-900 dark:text-white">
              {format(dataSelecionada, "d 'de' MMMM 'de' yyyy", { locale: ptBR })}
            </p>
          </div>
          {!isToday(dataSelecionada) && (
            <Button
              onClick={() => setDataSelecionada(new Date())}
              variant="outline"
              className="border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              Voltar para hoje
            </Button>
          )}
        </div>
      </div>

      {/* Botão adicionar tarefa */}
      {!mostrarFormulario && (
        <Button
          onClick={() => setMostrarFormulario(true)}
          className="w-full text-white h-12 text-base font-medium shadow-md hover:opacity-90"
          style={{ backgroundColor: corDestaque }}
        >
          <Plus className="w-5 h-5 mr-2" />
          Nova Tarefa
        </Button>
      )}

      {/* Formulário de nova tarefa */}
      {mostrarFormulario && (
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200 dark:border-gray-700 shadow-sm space-y-4 transition-colors duration-300">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Nova Tarefa</h3>
          
          {/* Alerta de validação */}
          {Object.keys(errosCampos).length > 0 && (
            <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-red-600 dark:text-red-400">
                <p className="font-medium mb-1">Preencha os campos obrigatórios:</p>
                <ul className="list-disc list-inside">
                  {Object.values(errosCampos).map((erro, index) => (
                    <li key={index}>{erro}</li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          <div>
            <label className="text-gray-600 dark:text-gray-400 text-sm mb-1 block">
              Título <span className="text-red-500">*</span>
            </label>
            <Input
              value={formTarefa.titulo}
              onChange={(e) => {
                setFormTarefa({ ...formTarefa, titulo: e.target.value });
                if (errosCampos.titulo) {
                  setErrosCampos({ ...errosCampos, titulo: '' });
                }
              }}
              placeholder="Título da tarefa"
              className={`bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 ${
                errosCampos.titulo ? 'border-red-500' : ''
              }`}
            />
          </div>

          {/* Toggle para horário */}
          <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-xl border border-gray-200 dark:border-gray-600">
            <input
              type="checkbox"
              id="comHorario"
              checked={formTarefa.comHorario}
              onChange={(e) => setFormTarefa({ ...formTarefa, comHorario: e.target.checked })}
              className="w-4 h-4 rounded"
              style={{ accentColor: corDestaque }}
            />
            <label htmlFor="comHorario" className="text-gray-700 dark:text-gray-300 text-sm flex items-center gap-2 cursor-pointer flex-1">
              <Clock className="w-4 h-4" style={{ color: corDestaque }} />
              Definir horário <span className="text-xs text-gray-500 dark:text-gray-400">(opcional)</span>
            </label>
          </div>

          {/* Campos de horário (condicional) */}
          {formTarefa.comHorario && (
            <div className="space-y-3 pl-4 border-l-2" style={{ borderColor: corDestaque }}>
              <div>
                <label className="text-gray-600 dark:text-gray-400 text-xs mb-1 block">
                  Horário <span className="text-red-500">*</span>
                </label>
                <select
                  value={formTarefa.horario}
                  onChange={(e) => {
                    setFormTarefa({ ...formTarefa, horario: e.target.value });
                    if (errosCampos.horario) {
                      setErrosCampos({ ...errosCampos, horario: '' });
                    }
                  }}
                  className={`w-full bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 text-gray-900 dark:text-white rounded-lg px-3 py-2 text-sm ${
                    errosCampos.horario ? 'border-red-500' : ''
                  }`}
                >
                  <option value="">Selecione um horário</option>
                  {HORARIOS_DISPONIVEIS.map(horario => (
                    <option key={horario} value={horario}>
                      {horario}
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="text-gray-600 dark:text-gray-400 text-xs mb-1 block flex items-center gap-2">
                  <Bell className="w-3 h-3" style={{ color: corDestaque }} />
                  Alertar antes
                </label>
                <select
                  value={formTarefa.alertaMinutos}
                  onChange={(e) => setFormTarefa({ ...formTarefa, alertaMinutos: Number(e.target.value) })}
                  className="w-full bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 text-gray-900 dark:text-white rounded-lg px-3 py-2 text-sm"
                >
                  <option value={5}>5 minutos antes</option>
                  <option value={10}>10 minutos antes</option>
                  <option value={15}>15 minutos antes</option>
                  <option value={30}>30 minutos antes</option>
                  <option value={60}>1 hora antes</option>
                </select>
              </div>
            </div>
          )}

          {/* Toggle para data customizada */}
          <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-xl border border-gray-200 dark:border-gray-600">
            <input
              type="checkbox"
              id="dataCustomizada"
              checked={mostrarDataCustomizada}
              onChange={(e) => setMostrarDataCustomizada(e.target.checked)}
              className="w-4 h-4 rounded"
              style={{ accentColor: corDestaque }}
            />
            <label htmlFor="dataCustomizada" className="text-gray-700 dark:text-gray-300 text-sm flex items-center gap-2 cursor-pointer flex-1">
              <CalendarPlus className="w-4 h-4" style={{ color: corDestaque }} />
              Escolher data específica <span className="text-xs text-gray-500 dark:text-gray-400">(opcional)</span>
            </label>
          </div>

          {/* Campo de data customizada */}
          {mostrarDataCustomizada && (
            <div className="pl-4 border-l-2" style={{ borderColor: corDestaque }}>
              <label className="text-gray-600 dark:text-gray-400 text-xs mb-1 block">Data</label>
              <Input
                type="date"
                value={formTarefa.dataCustomizada}
                onChange={(e) => setFormTarefa({ ...formTarefa, dataCustomizada: e.target.value })}
                min={format(new Date(), 'yyyy-MM-dd')}
                className="bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600 text-gray-900 dark:text-white"
              />
            </div>
          )}

          <div className="flex gap-2 pt-2">
            <Button
              onClick={adicionarTarefa}
              className="flex-1 text-white hover:opacity-90"
              style={{ backgroundColor: corDestaque }}
            >
              Adicionar
            </Button>
            <Button
              onClick={() => {
                setMostrarFormulario(false);
                setMostrarDataCustomizada(false);
                setErrosCampos({});
                setFormTarefa({
                  titulo: '',
                  horario: '',
                  comHorario: false,
                  alertaMinutos: 15,
                  dataCustomizada: '',
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

      {/* Lista de tarefas */}
      <div className="space-y-3">
        {tarefasDoDia.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-12 border border-gray-200 dark:border-gray-700 text-center shadow-sm transition-colors duration-300">
            <Calendar className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
            <p className="text-gray-500 dark:text-gray-400">Nenhuma tarefa para este dia</p>
            <p className="text-gray-400 dark:text-gray-500 text-sm mt-2">Adicione uma nova tarefa acima</p>
          </div>
        ) : (
          tarefasDoDia.map((tarefa) => (
            <div
              key={tarefa.id}
              className={`bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700 transition-all duration-300 hover:shadow-md ${
                tarefa.concluida ? 'opacity-60' : ''
              }`}
            >
              <div className="flex items-start gap-3">
                <button
                  onClick={() => toggleTarefa(tarefa.id)}
                  className="flex-shrink-0 mt-0.5"
                >
                  {tarefa.concluida ? (
                    <CheckCircle2 className="w-6 h-6" style={{ color: corDestaque }} />
                  ) : (
                    <Circle className="w-6 h-6 text-gray-300 dark:text-gray-600 hover:opacity-80 transition-colors" style={{ color: corDestaque }} />
                  )}
                </button>
                
                <div className="flex-1 min-w-0">
                  <h3 className={`text-gray-900 dark:text-white font-medium ${tarefa.concluida ? 'line-through' : ''}`}>
                    {tarefa.titulo}
                  </h3>
                  {tarefa.horario && (
                    <div className="flex items-center gap-2 mt-2 flex-wrap">
                      <span 
                        className="text-xs px-2 py-1 rounded-md flex items-center gap-1"
                        style={{ 
                          backgroundColor: `${corDestaque}10`, 
                          color: corDestaque,
                          border: `1px solid ${corDestaque}20`
                        }}
                      >
                        <Clock className="w-3 h-3" />
                        {tarefa.horario}
                      </span>
                      {tarefa.alertaMinutos && (
                        <span className="text-xs px-2 py-1 rounded-md bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800 flex items-center gap-1">
                          <Bell className="w-3 h-3" />
                          {tarefa.alertaMinutos}min antes
                        </span>
                      )}
                    </div>
                  )}
                </div>

                <button
                  onClick={() => removerTarefa(tarefa.id)}
                  className="flex-shrink-0 text-gray-400 dark:text-gray-500 hover:text-red-500 dark:hover:text-red-400 transition-colors"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
