"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Logo } from '@/components/custom/logo';
import { Eye, EyeOff, AlertCircle, CheckCircle2 } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const [modo, setModo] = useState<'login' | 'cadastro'>('login');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [nome, setNome] = useState('');
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState('');
  const [sucesso, setSucesso] = useState('');
  const [errosCampos, setErrosCampos] = useState<Record<string, string>>({});

  // Verificar se já está logado
  useEffect(() => {
    const verificarSessao = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        router.push('/');
      }
    };
    verificarSessao();
  }, [router]);

  const validarCampos = (): boolean => {
    const erros: Record<string, string> = {};

    if (!email.trim()) {
      erros.email = 'Email é obrigatório';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      erros.email = 'Email inválido';
    }

    if (!senha) {
      erros.senha = 'Senha é obrigatória';
    } else if (senha.length < 6) {
      erros.senha = 'Senha deve ter no mínimo 6 caracteres';
    }

    if (modo === 'cadastro' && !nome.trim()) {
      erros.nome = 'Nome é obrigatório';
    }

    setErrosCampos(erros);
    return Object.keys(erros).length === 0;
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErro('');
    setSucesso('');

    if (!validarCampos()) {
      setErro('Por favor, preencha todos os campos obrigatórios corretamente');
      return;
    }

    setCarregando(true);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password: senha,
      });

      if (error) throw error;

      setSucesso('Login realizado com sucesso!');
      setTimeout(() => router.push('/'), 1000);
    } catch (error: any) {
      setErro(error.message || 'Erro ao fazer login. Verifique suas credenciais.');
    } finally {
      setCarregando(false);
    }
  };

  const handleCadastro = async (e: React.FormEvent) => {
    e.preventDefault();
    setErro('');
    setSucesso('');

    if (!validarCampos()) {
      setErro('Por favor, preencha todos os campos obrigatórios corretamente');
      return;
    }

    setCarregando(true);

    try {
      // Criar conta
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password: senha,
        options: {
          data: {
            nome: nome,
          }
        }
      });

      if (authError) throw authError;

      if (authData.user) {
        // Criar perfil com plano free
        const { error: perfilError } = await supabase
          .from('perfis')
          .insert({
            id: authData.user.id,
            email: email,
            nome: nome,
            plano: 'free',
          });

        if (perfilError) throw perfilError;

        setSucesso('Conta criada com sucesso! Redirecionando...');
        setTimeout(() => router.push('/pricing'), 2000);
      }
    } catch (error: any) {
      setErro(error.message || 'Erro ao criar conta. Tente novamente.');
    } finally {
      setCarregando(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo e título */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <Logo size="lg" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            {modo === 'login' ? 'Bem-vindo de volta!' : 'Crie sua conta'}
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            {modo === 'login' 
              ? 'Entre para acessar seu planejador' 
              : 'Comece a organizar sua vida hoje'}
          </p>
        </div>

        {/* Card de formulário */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 border border-gray-200 dark:border-gray-700">
          {/* Alertas */}
          {erro && (
            <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-600 dark:text-red-400">{erro}</p>
            </div>
          )}

          {sucesso && (
            <div className="mb-6 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-green-600 dark:text-green-400">{sucesso}</p>
            </div>
          )}

          <form onSubmit={modo === 'login' ? handleLogin : handleCadastro} className="space-y-5">
            {/* Nome (apenas cadastro) */}
            {modo === 'cadastro' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Nome completo <span className="text-red-500">*</span>
                </label>
                <Input
                  type="text"
                  value={nome}
                  onChange={(e) => {
                    setNome(e.target.value);
                    if (errosCampos.nome) {
                      setErrosCampos({ ...errosCampos, nome: '' });
                    }
                  }}
                  placeholder="Seu nome"
                  className={`bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600 ${
                    errosCampos.nome ? 'border-red-500' : ''
                  }`}
                  disabled={carregando}
                />
                {errosCampos.nome && (
                  <p className="text-xs text-red-500 mt-1">{errosCampos.nome}</p>
                )}
              </div>
            )}

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Email <span className="text-red-500">*</span>
              </label>
              <Input
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (errosCampos.email) {
                    setErrosCampos({ ...errosCampos, email: '' });
                  }
                }}
                placeholder="seu@email.com"
                className={`bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600 ${
                  errosCampos.email ? 'border-red-500' : ''
                }`}
                disabled={carregando}
              />
              {errosCampos.email && (
                <p className="text-xs text-red-500 mt-1">{errosCampos.email}</p>
              )}
            </div>

            {/* Senha */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Senha <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Input
                  type={mostrarSenha ? 'text' : 'password'}
                  value={senha}
                  onChange={(e) => {
                    setSenha(e.target.value);
                    if (errosCampos.senha) {
                      setErrosCampos({ ...errosCampos, senha: '' });
                    }
                  }}
                  placeholder="••••••••"
                  className={`bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600 pr-10 ${
                    errosCampos.senha ? 'border-red-500' : ''
                  }`}
                  disabled={carregando}
                />
                <button
                  type="button"
                  onClick={() => setMostrarSenha(!mostrarSenha)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  {mostrarSenha ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              {errosCampos.senha && (
                <p className="text-xs text-red-500 mt-1">{errosCampos.senha}</p>
              )}
              {modo === 'cadastro' && (
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Mínimo de 6 caracteres
                </p>
              )}
            </div>

            {/* Botão submit */}
            <Button
              type="submit"
              disabled={carregando}
              className="w-full h-12 text-white font-medium bg-indigo-600 hover:bg-indigo-700"
            >
              {carregando 
                ? 'Processando...' 
                : modo === 'login' 
                ? 'Entrar' 
                : 'Criar conta'}
            </Button>
          </form>

          {/* Toggle modo */}
          <div className="mt-6 text-center">
            <button
              onClick={() => {
                setModo(modo === 'login' ? 'cadastro' : 'login');
                setErro('');
                setSucesso('');
                setErrosCampos({});
              }}
              className="text-sm text-indigo-600 dark:text-indigo-400 hover:underline"
            >
              {modo === 'login' 
                ? 'Não tem uma conta? Cadastre-se' 
                : 'Já tem uma conta? Faça login'}
            </button>
          </div>
        </div>

        {/* Informação sobre planos */}
        {modo === 'cadastro' && (
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Ao criar sua conta, você terá acesso ao plano gratuito.<br />
              Depois, escolha o plano que melhor se adequa às suas necessidades.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
