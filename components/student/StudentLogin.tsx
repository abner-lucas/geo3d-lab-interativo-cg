'use client';

import React, { useState } from 'react';
import { Sparkles, KeyRound, ArrowRight, ShieldCheck, BookOpen, Layers } from 'lucide-react';

interface StudentLoginProps {
  onLoginSuccess: (studentData: any, attemptData: any, mode: 'PRACTICE' | 'EVALUATION') => void;
  onOpenExploration: () => void;
  onOpenTeacher: () => void;
}

export function StudentLogin({
  onLoginSuccess,
  onOpenExploration,
  onOpenTeacher
}: StudentLoginProps) {
  const [accessCode, setAccessCode] = useState<string>('');
  const [selectedMode, setSelectedMode] = useState<'EVALUATION' | 'PRACTICE'>('EVALUATION');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!accessCode.trim()) {
      setErrorMessage('Digite seu código individual de acesso');
      return;
    }

    try {
      setIsLoading(true);
      setErrorMessage('');

      const res = await fetch('/api/student/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          accessCode: accessCode.trim().toUpperCase(),
          mode: selectedMode
        })
      });

      const data = await res.json();
      if (!res.ok) {
        setErrorMessage(data.error || 'Código não encontrado. Verifique com seu professor.');
        return;
      }

      onLoginSuccess(data.student, data.attempt, selectedMode);
    } catch {
      setErrorMessage('Erro de conexão ao validar o código.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-xl mx-auto flex flex-col items-center">
      {/* Visual Identity Logo & Banner */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-bold bg-blue-100 text-blue-800 mb-3 border border-blue-200">
          <Layers className="w-4 h-4 text-blue-600" />
          <span>3ª AVALIAÇÃO • COMPUTAÇÃO GRÁFICA</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
          Geo3D
        </h1>
        <p className="text-sm font-semibold text-blue-600 mt-1">
          Laboratório Interativo de Computação Gráfica
        </p>
        <p className="text-xs text-slate-500 mt-2 max-w-md mx-auto">
          Representações 2D, planificações geométricas, sólidos 3D, faces e vistas espaciais.
        </p>
      </div>

      {/* Main Login Card */}
      <div className="w-full bg-white rounded-3xl border border-slate-200 shadow-sm p-6 sm:p-8 flex flex-col gap-6">
        {/* Mode Selector (Avaliação vs Treino) */}
        <div className="grid grid-cols-2 gap-2 p-1.5 bg-slate-100 rounded-2xl border border-slate-200">
          <button
            type="button"
            onClick={() => setSelectedMode('EVALUATION')}
            className={`py-2.5 px-3 rounded-xl font-bold text-xs transition flex items-center justify-center gap-2 cursor-pointer ${
              selectedMode === 'EVALUATION'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            <span>MODO AVALIAÇÃO</span>
          </button>

          <button
            type="button"
            onClick={() => setSelectedMode('PRACTICE')}
            className={`py-2.5 px-3 rounded-xl font-bold text-xs transition flex items-center justify-center gap-2 cursor-pointer ${
              selectedMode === 'PRACTICE'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span>MODO TREINO</span>
          </button>
        </div>

        {/* Input Form */}
        <form onSubmit={handleLogin} className="flex flex-col gap-4">
          <div>
            <label 
              htmlFor="accessCodeInput"
              className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2"
            >
              Código Individual do Estudante
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                <KeyRound className="w-5 h-5 text-blue-600" />
              </div>
              <input
                id="accessCodeInput"
                type="text"
                autoComplete="off"
                placeholder="Ex: GEO-ALUNA-01"
                value={accessCode}
                onChange={(e) => {
                  setAccessCode(e.target.value.toUpperCase());
                  setErrorMessage('');
                }}
                className="w-full pl-12 pr-4 py-4 rounded-2xl border-2 border-slate-200 focus:border-blue-600 text-slate-900 font-mono font-bold text-lg tracking-wider placeholder:text-slate-400 placeholder:font-normal placeholder:text-sm transition outline-hidden"
              />
            </div>
            {errorMessage && (
              <p className="text-xs text-rose-600 font-bold mt-2">
                {errorMessage}
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-4 rounded-2xl bg-blue-600 hover:bg-blue-700 active:scale-[0.99] text-white font-bold text-base transition shadow-sm flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            <span>{isLoading ? 'Acessando...' : 'ENTRAR NA ATIVIDADE'}</span>
            <ArrowRight className="w-5 h-5" />
          </button>
        </form>
      </div>

      {/* Alternative Bottom Pathways */}
      <div className="flex flex-wrap items-center justify-center gap-4 mt-6 text-xs text-slate-500">
        <button
          onClick={onOpenExploration}
          className="hover:text-blue-600 font-bold underline transition"
        >
          Explorar Sólidos no Laboratório 3D
        </button>
        <span>•</span>
        <button
          onClick={onOpenTeacher}
          className="hover:text-blue-600 font-bold underline transition"
        >
          Área do Professor
        </button>
      </div>
    </div>
  );
}
