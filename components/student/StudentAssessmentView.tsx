'use client';

import React, { useState, useEffect } from 'react';
import { Attempt, QuestionDef, Student, AssessmentMode } from '@/types/geo3d';
import { QUESTIONS, QUESTION_BLOCKS } from '@/lib/questions';
import { QuestionRenderer } from '@/components/assessment/QuestionRenderer';
import confetti from 'canvas-confetti';
import { 
  ArrowLeft, 
  ArrowRight, 
  CheckCircle2, 
  Clock, 
  Sparkles, 
  Video, 
  Eye, 
  RotateCcw, 
  Send, 
  Check, 
  AlertCircle,
  HelpCircle,
  Shield,
  Layers,
  Award
} from 'lucide-react';

interface StudentAssessmentViewProps {
  student: Student;
  initialAttempt: Attempt;
  mode: AssessmentMode;
  onExit: () => void;
}

export function StudentAssessmentView({
  student,
  initialAttempt,
  mode,
  onExit
}: StudentAssessmentViewProps) {
  const [attempt, setAttempt] = useState<Attempt>(initialAttempt);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState<number>(0);
  const [localAnswers, setLocalAnswers] = useState<Record<number, any>>(() => {
    const existing: Record<number, any> = {};
    if (initialAttempt.responses) {
      Object.entries(initialAttempt.responses).forEach(([qId, resp]) => {
        existing[Number(qId)] = resp.answerData;
      });
    }
    return existing;
  });
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [saveStatus, setSaveStatus] = useState<string>('Salvo');
  const [showReviewModal, setShowReviewModal] = useState<boolean>(false);
  const [showFinishConfirm, setShowFinishConfirm] = useState<boolean>(false);
  const [showLibrasPanel, setShowLibrasPanel] = useState<boolean>(false);
  const [reducedMotion, setReducedMotion] = useState<boolean>(false);
  const [assessmentFinished, setAssessmentFinished] = useState<boolean>(initialAttempt.status === 'SUBMITTED');

  const currentQ: QuestionDef = QUESTIONS[currentQuestionIndex];
  const currentAnswer = localAnswers[currentQ.id];
  const blockInfo = QUESTION_BLOCKS[currentQ.block];

  // Auto-save answer to server via API
  const handleAnswerChange = async (data: any) => {
    const updated = { ...localAnswers, [currentQ.id]: data };
    setLocalAnswers(updated);

    // Save to server
    try {
      setIsSaving(true);
      setSaveStatus('Salvando...');

      const res = await fetch('/api/student/save-answer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          attemptId: attempt.id,
          questionId: currentQ.id,
          answerData: data,
          interactionType: 'interactive'
        })
      });

      if (res.ok) {
        const result = await res.json();
        setAttempt(result.attempt);
        setSaveStatus('Salvo automaticamente');
      } else {
        setSaveStatus('Erro ao salvar');
      }
    } catch (err) {
      setSaveStatus('Erro na conexão');
    } finally {
      setIsSaving(false);
    }
  };

  // Finalize assessment
  const handleFinishAssessment = async () => {
    try {
      setIsSaving(true);
      const res = await fetch('/api/student/finish-attempt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ attemptId: attempt.id })
      });

      if (res.ok) {
        const result = await res.json();
        setAttempt(result.attempt);
        setAssessmentFinished(true);
        setShowFinishConfirm(false);

        // Celebration confetti for student
        try {
          confetti({
            particleCount: 120,
            spread: 70,
            origin: { y: 0.6 }
          });
        } catch {}
      }
    } catch (err) {
      alert('Não foi possível finalizar a avaliação. Tente novamente.');
    } finally {
      setIsSaving(false);
    }
  };

  // Toggle reduced motion mode on document body
  const toggleReducedMotion = () => {
    const next = !reducedMotion;
    setReducedMotion(next);
    if (next) {
      document.body.classList.add('reduced-motion');
    } else {
      document.body.classList.remove('reduced-motion');
    }
  };

  const answeredCount = Object.keys(localAnswers).length;
  const isCurrentAnswered = currentAnswer !== undefined;

  // -------------------------------------------------------------------------
  // FINAL SUBMITTED SCREEN
  // -------------------------------------------------------------------------
  if (assessmentFinished) {
    return (
      <div className="w-full max-w-3xl mx-auto py-8 px-4 flex flex-col items-center text-center">
        <div className="w-20 h-20 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mb-6 shadow-xs">
          <CheckCircle2 className="w-12 h-12" />
        </div>

        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 mb-2">
          <Award className="w-4 h-4" />
          AVALIAÇÃO CONCLUÍDA COM SUCESSO
        </span>

        <h1 className="text-3xl font-black text-slate-900 tracking-tight mb-2">
          Parabéns, {student.pseudonym}!
        </h1>
        <p className="text-sm text-slate-600 max-w-lg mb-8">
          Todas as suas respostas foram salvas no sistema e enviadas para o professor com sucesso.
        </p>

        {/* Results Card */}
        <div className="w-full p-6 bg-white rounded-2xl border border-slate-200 shadow-xs mb-8 text-left">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4">
            <div>
              <p className="text-xs text-slate-500 font-bold uppercase">Código do Estudante</p>
              <p className="font-mono font-bold text-base text-slate-800">{student.accessCode}</p>
            </div>
            <div className="text-right">
              <p className="text-xs text-slate-500 font-bold uppercase">Questões Registradas</p>
              <p className="font-bold text-base text-blue-600">10 de 10</p>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-between">
            <span className="font-bold text-sm text-blue-900">Nota Total da Avaliação:</span>
            <span className="text-2xl font-black text-blue-700">
              {attempt.scoreAdjusted ?? attempt.totalScore} / 10,0
            </span>
          </div>

          <p className="text-xs text-slate-500 mt-4 text-center">
            O professor já tem acesso ao seu resultado e às análises de cada sólido no painel.
          </p>
        </div>

        <button
          onClick={onExit}
          className="px-6 py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-sm transition shadow-xs"
        >
          Voltar para a Tela Inicial
        </button>
      </div>
    );
  }

  return (
    <div className="w-full max-w-5xl mx-auto flex flex-col gap-5 pb-12">
      {/* ------------------------------------------------------------------- */}
      {/* TOP ACCESSIBILITY & SESSION BAR */}
      {/* ------------------------------------------------------------------- */}
      <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-4">
        {/* Student Pseudonym & Code */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-600 text-white font-black flex items-center justify-center text-sm shadow-xs">
            {student.displayNumber}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-slate-900 text-sm">{student.pseudonym}</span>
              <span className="px-2 py-0.5 rounded-md bg-slate-100 font-mono text-xs text-slate-600">
                {student.accessCode}
              </span>
            </div>
            <p className="text-[11px] text-slate-500 flex items-center gap-1.5 mt-0.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              {saveStatus}
            </p>
          </div>
        </div>

        {/* Accessibility & Video Toolbar */}
        <div className="flex items-center gap-2">
          {/* Libras Video Button */}
          <button
            onClick={() => setShowLibrasPanel(!showLibrasPanel)}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition border ${
              showLibrasPanel 
                ? 'bg-blue-600 text-white border-blue-600' 
                : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
            }`}
            title="Vídeo de Apoio em Libras"
            aria-label="Abrir painel de vídeo em Libras"
          >
            <Video className="w-4 h-4" />
            <span>Libras</span>
          </button>

          {/* Reduced Motion Toggle */}
          <button
            onClick={toggleReducedMotion}
            className={`px-3 py-2 rounded-xl text-xs font-bold transition border ${
              reducedMotion
                ? 'bg-amber-100 text-amber-800 border-amber-300'
                : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
            }`}
            title="Reduzir Movimento e Animações (WCAG 2.2 AA)"
            aria-label="Alternar modo de animação reduzida"
          >
            {reducedMotion ? 'Movimento Reduzido: ON' : 'Reduzir Animação'}
          </button>

          {/* Exit / Menu */}
          <button
            onClick={onExit}
            className="px-3 py-2 rounded-xl text-xs font-bold text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition"
          >
            Sair
          </button>
        </div>
      </div>

      {/* ------------------------------------------------------------------- */}
      {/* OPTIONAL LIBRAS MEDIATION VIDEO PANEL */}
      {/* ------------------------------------------------------------------- */}
      {showLibrasPanel && (
        <div className="p-5 rounded-2xl bg-blue-950 text-white border border-blue-900 shadow-md flex flex-col md:flex-row items-center justify-between gap-5 animate-fadeIn">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2 py-0.5 rounded-md bg-blue-800 text-[10px] font-bold uppercase tracking-wider text-blue-200">
                Acessibilidade Digital
              </span>
              <h4 className="font-bold text-sm text-white">Mediação em Língua Brasileira de Sinais (Libras)</h4>
            </div>
            <p className="text-xs text-blue-200 leading-relaxed">
              Espaço reservado para vídeos reais de mediação em Libras cadastrados pelo professor para a Questão {currentQ.id}.
            </p>
          </div>

          <div className="w-64 h-36 bg-slate-900 rounded-xl border border-blue-800 flex flex-col items-center justify-center p-3 text-center">
            <Video className="w-8 h-8 text-blue-400 mb-2" />
            <p className="text-xs font-semibold text-slate-300">Vídeo de Apoio da Questão {currentQ.id}</p>
            <span className="text-[10px] text-blue-400 mt-1">Carregado pelo professor</span>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------------- */}
      {/* VISUAL QUESTION STEPPER (1 a 10) */}
      {/* ------------------------------------------------------------------- */}
      <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs flex flex-col gap-3">
        <div className="flex items-center justify-between text-xs font-bold text-slate-600">
          <span>PROGRESSO DA AVALIAÇÃO</span>
          <span className="text-blue-600">{answeredCount} de 10 respondidas</span>
        </div>

        <div className="grid grid-cols-10 gap-1.5 sm:gap-2">
          {QUESTIONS.map((q, idx) => {
            const isAnswered = localAnswers[q.id] !== undefined;
            const isCurrent = idx === currentQuestionIndex;

            return (
              <button
                key={q.id}
                onClick={() => setCurrentQuestionIndex(idx)}
                className={`py-2 rounded-xl text-xs font-black transition flex flex-col items-center justify-center gap-0.5 cursor-pointer ${
                  isCurrent
                    ? 'bg-blue-600 text-white ring-2 ring-blue-300 shadow-sm'
                    : isAnswered
                    ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                    : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                }`}
                aria-label={`Ir para questão ${q.id}`}
              >
                <span>{q.id}</span>
                {isAnswered && !isCurrent && (
                  <Check className="w-2.5 h-2.5 text-emerald-700" />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* ------------------------------------------------------------------- */}
      {/* ACTIVE QUESTION CONTAINER */}
      {/* ------------------------------------------------------------------- */}
      <div className="p-6 sm:p-8 rounded-3xl bg-white border border-slate-200 shadow-xs flex flex-col gap-6">
        {/* Question Header & Command */}
        <div className="flex flex-col gap-2 pb-4 border-b border-slate-100">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-blue-600 bg-blue-50 px-3 py-1 rounded-full">
              {blockInfo.title} • {currentQ.points.toFixed(2)} pts
            </span>
            <span className="text-xs font-bold text-slate-500">
              Questão {currentQ.id} de 10
            </span>
          </div>

          <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight mt-1">
            {currentQ.title}
          </h2>

          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center gap-3">
            <div className="w-3 h-3 rounded-full bg-blue-600 shrink-0" />
            <p className="text-sm font-semibold text-slate-800">
              {currentQ.visualPrompt}
            </p>
          </div>
        </div>

        {/* Dynamic Question Body */}
        <QuestionRenderer
          question={currentQ}
          currentAnswer={currentAnswer}
          onAnswerChange={handleAnswerChange}
          mode={mode}
        />

        {/* ----------------------------------------------------------------- */}
        {/* BOTTOM NAVIGATION ACTIONS */}
        {/* ----------------------------------------------------------------- */}
        <div className="pt-6 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
          {/* Previous Button */}
          <button
            type="button"
            disabled={currentQuestionIndex === 0}
            onClick={() => setCurrentQuestionIndex(prev => Math.max(0, prev - 1))}
            className="flex items-center gap-2 px-5 py-3 rounded-xl border border-slate-200 hover:bg-slate-100 font-bold text-sm text-slate-700 disabled:opacity-30 disabled:pointer-events-none transition cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Anterior</span>
          </button>

          {/* Middle: Save Status & Review all */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setShowReviewModal(true)}
              className="text-xs font-bold text-slate-600 hover:text-slate-900 px-3 py-2 rounded-lg hover:bg-slate-100 transition"
            >
              Revisar Todas
            </button>
          </div>

          {/* Next or Finish Button */}
          {currentQuestionIndex < QUESTIONS.length - 1 ? (
            <button
              type="button"
              onClick={() => setCurrentQuestionIndex(prev => Math.min(QUESTIONS.length - 1, prev + 1))}
              className="flex items-center gap-2 px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm transition shadow-xs cursor-pointer"
            >
              <span>Próxima</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              type="button"
              onClick={() => setShowFinishConfirm(true)}
              className="flex items-center gap-2 px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm transition shadow-xs cursor-pointer"
            >
              <Send className="w-4 h-4" />
              <span>FINALIZAR AVALIAÇÃO</span>
            </button>
          )}
        </div>
      </div>

      {/* ------------------------------------------------------------------- */}
      {/* REVIEW QUESTIONS MODAL */}
      {/* ------------------------------------------------------------------- */}
      {showReviewModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 shadow-xl border border-slate-200 flex flex-col gap-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-lg font-black text-slate-900">
                Resumo de Questões Respondidas
              </h3>
              <button
                onClick={() => setShowReviewModal(false)}
                className="text-slate-400 hover:text-slate-700 font-bold p-1 text-base"
              >
                ✕
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 max-h-72 overflow-y-auto p-1">
              {QUESTIONS.map((q, idx) => {
                const ans = localAnswers[q.id];
                return (
                  <button
                    key={q.id}
                    onClick={() => {
                      setCurrentQuestionIndex(idx);
                      setShowReviewModal(false);
                    }}
                    className={`p-3 rounded-xl border-2 flex flex-col items-center justify-center gap-1 transition ${
                      ans !== undefined
                        ? 'border-emerald-300 bg-emerald-50 text-emerald-800'
                        : 'border-amber-300 bg-amber-50 text-amber-800'
                    }`}
                  >
                    <span className="font-black text-base">Q{q.id}</span>
                    <span className="text-[10px] font-bold uppercase">
                      {ans !== undefined ? 'Respondida' : 'Pendente'}
                    </span>
                  </button>
                );
              })}
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-slate-100">
              <span className="text-xs text-slate-600 font-medium">
                {answeredCount} de 10 respondidas
              </span>
              <button
                onClick={() => setShowReviewModal(false)}
                className="px-5 py-2.5 bg-slate-900 text-white rounded-xl text-xs font-bold"
              >
                Fechar Resumo
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------------- */}
      {/* FINISH CONFIRMATION DIALOG */}
      {/* ------------------------------------------------------------------- */}
      {showFinishConfirm && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-xl border border-slate-200 flex flex-col gap-5 text-center">
            <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
              <Send className="w-7 h-7" />
            </div>

            <div>
              <h3 className="text-xl font-black text-slate-900 mb-1">
                Finalizar e Entregar Avaliação?
              </h3>
              <p className="text-xs text-slate-600">
                Você respondeu {answeredCount} de 10 questões. Deseja registrar suas respostas definitivas para o professor?
              </p>
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setShowFinishConfirm(false)}
                className="flex-1 py-3 rounded-xl border border-slate-200 text-slate-700 font-bold text-xs hover:bg-slate-100 transition"
              >
                Continuar Revisando
              </button>
              <button
                type="button"
                disabled={isSaving}
                onClick={handleFinishAssessment}
                className="flex-1 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition shadow-xs disabled:opacity-50"
              >
                {isSaving ? 'Enviando...' : 'Confirmar e Enviar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
