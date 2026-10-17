'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { KeyRound, ArrowRight, ShieldCheck, BookOpen, Layers } from 'lucide-react';
import { isReducedMotionActive, SPRING_TOUCH } from '@/lib/motionUtils';

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
  const [shakeKey, setShakeKey] = useState<number>(0);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!accessCode.trim()) {
      setErrorMessage('Digite seu código individual de acesso');
      setShakeKey(prev => prev + 1);
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
        setShakeKey(prev => prev + 1);
        return;
      }

      onLoginSuccess(data.student, data.attempt, selectedMode);
    } catch {
      setErrorMessage('Erro de conexão ao validar o código.');
      setShakeKey(prev => prev + 1);
    } finally {
      setIsLoading(false);
    }
  };

  const isReduced = isReducedMotionActive();

  return (
    <div className="w-full max-w-xl mx-auto flex flex-col items-center">
      {/* Visual Identity Logo & Banner */}
      <div className="text-center mb-8">
        <motion.div 
          className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-bold bg-blue-100 text-blue-800 mb-3 border border-blue-200"
          animate={isReduced ? {} : { y: [0, -3, 0] }}
          transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
        >
          <Layers className="w-4 h-4 text-blue-600" />
          <span>COMPUTAÇÃO GRÁFICA • PROF. ME. ÁBNER LUCAS</span>
        </motion.div>
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
      <motion.div 
        className="w-full bg-white rounded-3xl border border-slate-200 shadow-sm p-6 sm:p-8 flex flex-col gap-6"
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
      >
        {/* Mode Selector (Avaliação vs Treino) */}
        <div className="flex flex-col gap-2">
          <div className="grid grid-cols-2 gap-2 p-1.5 bg-slate-100 rounded-2xl border border-slate-200 relative">
            <button
              type="button"
              onClick={() => setSelectedMode('EVALUATION')}
              className={`relative py-2.5 px-3 rounded-xl font-bold text-xs transition flex items-center justify-center gap-2 cursor-pointer z-10 ${
                selectedMode === 'EVALUATION' ? 'text-white' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {selectedMode === 'EVALUATION' && (
                <motion.div
                  layoutId="activeModePill"
                  className="absolute inset-0 rounded-xl bg-blue-600 shadow-xs -z-10"
                  transition={SPRING_TOUCH}
                />
              )}
              <ShieldCheck className="w-4 h-4" />
              <span>MODO AVALIAÇÃO</span>
            </button>

            <button
              type="button"
              onClick={() => setSelectedMode('PRACTICE')}
              className={`relative py-2.5 px-3 rounded-xl font-bold text-xs transition flex items-center justify-center gap-2 cursor-pointer z-10 ${
                selectedMode === 'PRACTICE' ? 'text-white' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {selectedMode === 'PRACTICE' && (
                <motion.div
                  layoutId="activeModePill"
                  className="absolute inset-0 rounded-xl bg-emerald-600 shadow-xs -z-10"
                  transition={SPRING_TOUCH}
                />
              )}
              <BookOpen className="w-4 h-4" />
              <span>MODO TREINO</span>
            </button>
          </div>

          <AnimatePresence mode="wait">
            <motion.p
              key={selectedMode}
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 4 }}
              transition={{ duration: 0.18 }}
              className={`text-[11px] font-semibold text-center px-3 py-1.5 rounded-xl border ${
                selectedMode === 'EVALUATION'
                  ? 'bg-blue-50/70 text-blue-800 border-blue-100'
                  : 'bg-emerald-50/70 text-emerald-800 border-emerald-100'
              }`}
            >
              {selectedMode === 'EVALUATION'
                ? 'Atividade avaliativa oficial: 10 questões em ordem crescente de complexidade.'
                : 'Tutorial rápido: apenas 3 passos simples para aprender a usar a plataforma antes da avaliação.'}
            </motion.p>
          </AnimatePresence>
        </div>

        {/* Input Form */}
        <form onSubmit={handleLogin} className="flex flex-col gap-4">
          <motion.div
            key={shakeKey}
            animate={errorMessage && !isReduced ? { x: [-8, 8, -6, 6, -3, 3, 0] } : {}}
            transition={{ duration: 0.35 }}
          >
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
                className={`w-full pl-12 pr-4 py-4 rounded-2xl border-2 text-slate-900 font-mono font-bold text-lg tracking-wider placeholder:text-slate-400 placeholder:font-normal placeholder:text-sm transition outline-hidden ${
                  errorMessage ? 'border-rose-400 bg-rose-50/30' : 'border-slate-200 focus:border-blue-600'
                }`}
              />
            </div>
            {errorMessage && (
              <motion.p 
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-xs text-rose-600 font-bold mt-2"
              >
                {errorMessage}
              </motion.p>
            )}
          </motion.div>

          <motion.button
            type="submit"
            disabled={isLoading}
            whileHover={isReduced ? {} : { scale: 1.015 }}
            whileTap={isReduced ? {} : { scale: 0.985 }}
            transition={SPRING_TOUCH}
            className="w-full py-4 rounded-2xl bg-blue-600 hover:bg-blue-700 active:scale-[0.99] text-white font-bold text-base transition shadow-sm flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            <span>{isLoading ? 'Acessando...' : 'ENTRAR NA ATIVIDADE'}</span>
            <ArrowRight className="w-5 h-5" />
          </motion.button>
        </form>
      </motion.div>

      {/* Alternative Bottom Pathways */}
      <div className="flex flex-wrap items-center justify-center gap-4 mt-6 text-xs text-slate-500">
        <button
          onClick={onOpenExploration}
          className="hover:text-blue-600 font-bold underline transition cursor-pointer"
        >
          Explorar Sólidos no Laboratório 3D
        </button>
        <span>•</span>
        <button
          onClick={onOpenTeacher}
          className="hover:text-blue-600 font-bold underline transition cursor-pointer"
        >
          Área do Professor
        </button>
      </div>
    </div>
  );
}
