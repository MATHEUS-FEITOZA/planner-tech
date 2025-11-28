"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase, obterPerfil } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Logo } from '@/components/custom/logo';
import { Check, Crown, Zap, ArrowLeft } from 'lucide-react';

export default function PricingPage() {
  const router = useRouter();
  const [carregando, setCarregando] = useState(false);
  const [planoAtual, setPlanoAtual] = useState<string>('free');
  const [usuario, setUsuario] = useState<any>(null);

  useEffect(() => {
    const carregarPerfil = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push('/login');
        return;
      }

      setUsuario(user);
      const perfil = await obterPerfil();
      if (perfil) {
        setPlanoAtual(perfil.plano);
      }
    };

    carregarPerfil();
  }, [router]);

  const assinarPlano = async (plano: 'mensal' | 'anual') => {
    if (!usuario) return;

    setCarregando(true);

    try {
      // Calcular data de expiração
      const dataExpiracao = new Date();
      if (plano === 'mensal') {
        dataExpiracao.setMonth(dataExpiracao.getMonth() + 1);
      } else {
        dataExpiracao.setFullYear(dataExpiracao.getFullYear() + 1);
      }

      // Atualizar perfil
      const { error } = await supabase
        .from('perfis')
        .update({
          plano: plano,
          data_assinatura: new Date().toISOString(),
          data_expiracao: dataExpiracao.toISOString(),
        })
        .eq('id', usuario.id);

      if (error) throw error;

      alert(`✅ Assinatura ${plano} ativada com sucesso!\n\nEm produção, aqui seria integrado um gateway de pagamento (Stripe, Mercado Pago, etc).`);
      router.push('/');
    } catch (error: any) {
      alert('Erro ao processar assinatura: ' + error.message);
    } finally {
      setCarregando(false);
    }
  };

  const planos = [
    {
      id: 'free',
      nome: 'Gratuito',
      preco: 'R$ 0',
      periodo: 'para sempre',
      descricao: 'Experimente o básico',
      recursos: [
        'Até 10 tarefas por mês',
        'Controle financeiro básico',
        'Sem sincronização',
        'Suporte por email',
      ],
      limitacoes: true,
      cor: 'gray',
      icone: Zap,
    },
    {
      id: 'mensal',
      nome: 'Mensal',
      preco: 'R$ 9,99',
      periodo: 'por mês',
      descricao: 'Ideal para começar',
      recursos: [
        'Tarefas ilimitadas',
        'Controle financeiro completo',
        'Relatórios mensais',
        'Notificações e lembretes',
        'Exportação de dados',
        'Suporte prioritário',
      ],
      limitacoes: false,
      cor: 'indigo',
      icone: Check,
      popular: true,
    },
    {
      id: 'anual',
      nome: 'Anual',
      preco: 'R$ 79,90',
      periodo: 'por ano',
      descricao: 'Melhor custo-benefício',
      economia: 'Economize R$ 39,98',
      recursos: [
        'Tudo do plano mensal',
        '2 meses grátis',
        'Acesso antecipado a novos recursos',
        'Backup automático',
        'Suporte VIP 24/7',
        'Consultoria personalizada',
      ],
      limitacoes: false,
      cor: 'purple',
      icone: Crown,
      destaque: true,
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 py-12 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <Button
            onClick={() => router.push('/')}
            variant="ghost"
            className="mb-6"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar ao app
          </Button>

          <Logo size="lg" className="justify-center mb-6" />
          
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
            Escolha seu plano
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Organize sua vida com o PlannerCell. Escolha o plano ideal para suas necessidades.
          </p>
        </div>

        {/* Plano atual */}
        {planoAtual !== 'free' && (
          <div className="mb-8 text-center">
            <div className="inline-block bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-full px-6 py-2">
              <p className="text-sm text-green-600 dark:text-green-400 font-medium">
                ✓ Plano atual: {planoAtual === 'mensal' ? 'Mensal' : 'Anual'}
              </p>
            </div>
          </div>
        )}

        {/* Cards de planos */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          {planos.map((plano) => {
            const Icone = plano.icone;
            const isAtual = planoAtual === plano.id;

            return (
              <div
                key={plano.id}
                className={`relative bg-white dark:bg-gray-800 rounded-2xl p-8 border-2 transition-all duration-300 ${
                  plano.destaque
                    ? 'border-purple-500 shadow-2xl scale-105'
                    : plano.popular
                    ? 'border-indigo-500 shadow-xl'
                    : 'border-gray-200 dark:border-gray-700 shadow-lg'
                } ${isAtual ? 'ring-4 ring-green-500' : ''}`}
              >
                {/* Badge */}
                {plano.popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <span className="bg-indigo-600 text-white text-xs font-bold px-4 py-1 rounded-full">
                      MAIS POPULAR
                    </span>
                  </div>
                )}

                {plano.destaque && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <span className="bg-gradient-to-r from-purple-600 to-pink-600 text-white text-xs font-bold px-4 py-1 rounded-full">
                      MELHOR OFERTA
                    </span>
                  </div>
                )}

                {isAtual && (
                  <div className="absolute -top-4 right-4">
                    <span className="bg-green-500 text-white text-xs font-bold px-3 py-1 rounded-full">
                      ATIVO
                    </span>
                  </div>
                )}

                {/* Ícone */}
                <div className={`inline-flex p-3 rounded-xl mb-4 ${
                  plano.destaque
                    ? 'bg-purple-100 dark:bg-purple-900/20'
                    : plano.popular
                    ? 'bg-indigo-100 dark:bg-indigo-900/20'
                    : 'bg-gray-100 dark:bg-gray-700'
                }`}>
                  <Icone className={`w-6 h-6 ${
                    plano.destaque
                      ? 'text-purple-600 dark:text-purple-400'
                      : plano.popular
                      ? 'text-indigo-600 dark:text-indigo-400'
                      : 'text-gray-600 dark:text-gray-400'
                  }`} />
                </div>

                {/* Nome e preço */}
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                  {plano.nome}
                </h3>
                <div className="mb-4">
                  <span className="text-4xl font-bold text-gray-900 dark:text-white">
                    {plano.preco}
                  </span>
                  <span className="text-gray-500 dark:text-gray-400 ml-2">
                    {plano.periodo}
                  </span>
                </div>

                {plano.economia && (
                  <div className="mb-4">
                    <span className="inline-block bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400 text-sm font-semibold px-3 py-1 rounded-full">
                      {plano.economia}
                    </span>
                  </div>
                )}

                <p className="text-gray-600 dark:text-gray-400 mb-6">
                  {plano.descricao}
                </p>

                {/* Recursos */}
                <ul className="space-y-3 mb-8">
                  {plano.recursos.map((recurso, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <Check className={`w-5 h-5 flex-shrink-0 mt-0.5 ${
                        plano.limitacoes
                          ? 'text-gray-400 dark:text-gray-600'
                          : 'text-green-500 dark:text-green-400'
                      }`} />
                      <span className="text-sm text-gray-700 dark:text-gray-300">
                        {recurso}
                      </span>
                    </li>
                  ))}
                </ul>

                {/* Botão */}
                {plano.id === 'free' ? (
                  <Button
                    disabled
                    variant="outline"
                    className="w-full h-12"
                  >
                    Plano atual
                  </Button>
                ) : isAtual ? (
                  <Button
                    disabled
                    className="w-full h-12 bg-green-500 text-white"
                  >
                    Plano ativo
                  </Button>
                ) : (
                  <Button
                    onClick={() => assinarPlano(plano.id as 'mensal' | 'anual')}
                    disabled={carregando}
                    className={`w-full h-12 text-white font-medium ${
                      plano.destaque
                        ? 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700'
                        : 'bg-indigo-600 hover:bg-indigo-700'
                    }`}
                  >
                    {carregando ? 'Processando...' : 'Assinar agora'}
                  </Button>
                )}
              </div>
            );
          })}
        </div>

        {/* FAQ ou informações adicionais */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 border border-gray-200 dark:border-gray-700 shadow-lg">
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 text-center">
            Perguntas Frequentes
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
                Posso cancelar a qualquer momento?
              </h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Sim! Você pode cancelar sua assinatura a qualquer momento sem taxas adicionais.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
                Como funciona o pagamento?
              </h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Aceitamos cartão de crédito, débito e PIX. O pagamento é processado de forma segura.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
                Posso mudar de plano depois?
              </h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Sim! Você pode fazer upgrade ou downgrade do seu plano a qualquer momento.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
                Meus dados estão seguros?
              </h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Absolutamente! Usamos criptografia de ponta e seguimos as melhores práticas de segurança.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
