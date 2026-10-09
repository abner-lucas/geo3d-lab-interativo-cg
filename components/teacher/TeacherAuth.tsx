'use client';

import React, { useState } from 'react';
import { Lock, ArrowRight, ShieldCheck, ArrowLeft, KeyRound } from 'lucide-react';

interface TeacherAuthProps {
  onSuccess: () => void;
  onCancel: () => void;
}

export function TeacherAuth({ onSuccess, onCancel }: TeacherAuthProps) {
  const [passcode, setPasscode] = useState<string>('');
  const [error, setError] = useState<string>('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = passcode.trim();
    // Default passcodes for teacher
    if (clean === 'PROF-2026' || clean === 'geo3d' || clean === '123456') {
      onSuccess();
    } else {
      setError('Código docente inválido. Utilize PROF-2026 para demonstração.');
    }
  };

  return (
    <div className="w-full max-w-md mx-auto flex flex-col items-center">
      <div className="w-full bg-white rounded-3xl border border-slate-200 shadow-md p-6 sm:p-8 flex flex-col gap-5">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <button
            onClick={onCancel}
            className="text-xs text-slate-500 hover:text-slate-800 flex items-center gap-1 font-bold"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Voltar
          </button>
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-800 uppercase">
            Acesso Restrito
          </span>
        </div>

        <div className="text-center">
          <div className="w-14 h-14 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto mb-3">
            <Lock className="w-7 h-7" />
          </div>
          <h2 className="text-xl font-black text-slate-900">
            Painel do Professor
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Digite a senha ou código de acesso docente para gerenciar turmas e notas.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
              Senha de Acesso Docente
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <KeyRound className="w-4 h-4 text-blue-600" />
              </div>
              <input
                type="password"
                placeholder="Ex: PROF-2026"
                value={passcode}
                onChange={(e) => {
                  setPasscode(e.target.value);
                  setError('');
                }}
                className="w-full pl-10 pr-3.5 py-3 rounded-xl border-2 border-slate-200 text-slate-900 font-mono text-sm focus:border-blue-600 outline-hidden"
              />
            </div>
            {error && <p className="text-xs text-rose-600 font-bold mt-1.5">{error}</p>}
          </div>

          <button
            type="submit"
            className="w-full py-3.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm transition shadow-xs flex items-center justify-center gap-2 cursor-pointer"
          >
            <span>ENTRAR NO PAINEL</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-center">
          <span className="text-[11px] text-slate-500 block font-medium">
            Código padrão de demonstração:
          </span>
          <button
            type="button"
            onClick={() => setPasscode('PROF-2026')}
            className="font-mono text-xs font-bold text-blue-600 hover:underline mt-0.5"
          >
            PROF-2026
          </button>
        </div>
      </div>
    </div>
  );
}
