'use client';

import React, { useState } from 'react';
import { Attempt, QuestionDef, Student, AssessmentMode } from '@/types/geo3d';
import { getQuestionsByMode, QUESTION_BLOCKS } from '@/lib/questions';
import { QuestionRenderer } from '@/components/assessment/QuestionRenderer';
import { motion, AnimatePresence } from 'motion/react';
import { questionSlideVariants, isReducedMotionActive, SPRING_TOUCH, SPRING_POP, SPRING_CARD } from '@/lib/motionUtils';
import confetti from 'canvas-confetti';
import { 
  ArrowLeft, 
  ArrowRight, 
  CheckCircle2, 
  Video, 
  Send, 
  Check, 
  Award,
  BookOpen
} from 'lucide-react';

interface StudentAssessmentViewProps {
  student: Student;
  initialAttempt: Attempt;
  mode: AssessmentMode;
  onExit: () => void;
  onAttemptChange?: (attempt: Attempt) => void;
}

function isQuestionAnswered(questionId: number, ans: any): boolean {
  if (!ans) return false;
  if (questionId === 2) {
    return Object.keys(ans.classifications || {}).length === 4;
  }
  if (questionId === 10) {
    return Boolean(ans.basePiece && ans.roofPiece);
  }
  if (questionId === 103) {
    return Boolean(ans.leftSlot && ans.rightSlot);
  }
  return Boolean(ans.selectedOption);
}

export function StudentAssessmentView({
  student,
  initialAttempt,
  mode,
  onExit,
  onAttemptChange
}: StudentAssessmentViewProps) {
  const activeQuestions = getQuestionsByMode(mode);
  const totalQuestionsCount = activeQuestions.length;
  const isPractice = mode === 'PRACTICE';

  const [attempt, setAttempt] = useState<Attempt>(initialAttempt);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState<number>(0);
  const [direction, setDirection] = useState<number>(1);
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
  const [reducedMotion, setReducedMotion] = useState<boolean>(() =>
    typeof document !== 'undefined' ? document.body.classList.contains('reduced-motion') : false
  );
  const [assessmentFinished, setAssessmentFinished] = useState<boolean>(
    initialAttempt.status === 'SUBMITTED' || initialAttempt.status === 'REVIEWED'
  );

  const currentQ: QuestionDef = activeQuestions[currentQuestionIndex] || activeQuestions[0];
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
        onAttemptChange?.(result.attempt);
        setSaveStatus('Salvo automaticamente');
      } else {
        setSaveStatus('Erro ao salvar');
      }
    } catch {
      setSaveStatus('Erro na conexão');
    } finally {
      setIsSaving(false);
    }
  };

  // Finalize assessment or practice
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
        onAttemptChange?.(result.attempt);
        setAssessmentFinished(true);
        setShowFinishConfirm(false);

        if (!reducedMotion && !document.body.classList.contains('reduced-motion')) {
          try {
            // Dual synchronized celebratory bursts from left and right
            confetti({
              particleCount: 75,
              angle: 60,
              spread: 60,
              origin: { x: 0.1, y: 0.65 }
            });
            confetti({
              particleCount: 75,
              angle: 120,
              spread: 60,
              origin: { x: 0.9, y: 0.65 }
            });
          } catch {}
        }
      }
    } catch {
      alert('Não foi possível finalizar a atividade. Tente novamente.');
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

  const answeredCount = activeQuestions.filter(q => isQuestionAnswered(q.id, localAnswers[q.id])).length;

  // -------------------------------------------------------------------------
  // FINAL SUBMITTED SCREEN
  // -------------------------------------------------------------------------
  if (assessmentFinished) {
    return (
      <div className="w-full max-w-3xl mx-auto py-8 px-4 flex flex-col items-center text-center">
        <motion.div 
          className="w-20 h-20 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mb-6 shadow-xs"
          initial={{ scale: 0, rotate: -15 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={SPRING_POP}
        >
          <CheckCircle2 className="w-12 h-12" />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="flex flex-col items-center"
        >
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 mb-2">
            {isPractice ? <BookOpen className="w-4 h-4" /> : <Award className="w-4 h-4" />}
            {isPractice ? 'TREINO CONCLUÍDO' : 'AVALIAÇÃO CONCLUÍDA COM SUCESSO'}
          </span>

          <h1 className="text-3xl font-black text-slate-900 tracking-tight mb-2">
            Parabéns, {student.pseudonym}!
          </h1>
          <p className="text-sm text-slate-600 max-w-lg mb-8">
            {isPractice
              ? 'Você concluiu os 3 passos de Treino! Agora você já sabe selecionar alternativas, girar objetos 3D e preencher espaços para realizar o Modo Avaliação.'
              : 'Todas as suas respostas foram salvas no sistema e enviadas para o professor com sucesso.'}
          </p>
        </motion.div>

        {/* Results Card */}
        <motion.div 
          className="w-full p-6 bg-white rounded-2xl border border-slate-200 shadow-xs mb-8 text-left"
          initial={{ opacity: 0, scale: 0.96, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ delay: 0.18, ...SPRING_CARD }}
        >
          <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4">
            <div>
              <p className="text-xs text-slate-500 font-bold uppercase">Código do Estudante</p>
              <p className="font-mono font-bold text-base text-slate-800">{student.accessCode}</p>
            </div>
            <div className="text-right">
              <p className="text-xs text-slate-500 font-bold uppercase">
                {isPractice ? 'Passos de Treino' : 'Questões Registradas'}
              </p>
              <p className="font-bold text-base text-blue-600">
                {answeredCount} de {totalQuestionsCount}
              </p>
            </div>
          </div>

          <div className={`p-4 rounded-xl border flex items-center justify-between ${
            isPractice ? 'bg-emerald-50 border-emerald-200' : 'bg-blue-50 border-blue-200'
          }`}>
            <span className={`font-bold text-sm ${isPractice ? 'text-emerald-900' : 'text-blue-900'}`}>
              {isPractice ? 'Pontuação no Treino:' : 'Nota Total da Avaliação:'}
            </span>
            <span className={`text-2xl font-black ${isPractice ? 'text-emerald-700' : 'text-blue-700'}`}>
              {attempt.scoreAdjusted ?? attempt.totalScore} / 10,0
            </span>
          </div>

          <p className="text-xs text-slate-500 mt-4 text-center">
            {isPractice
              ? 'Este resultado é apenas para seu treinamento e não altera sua nota oficial na disciplina.'
              : 'O professor já tem acesso ao seu resultado e às análises de cada sólido no painel.'}
          </p>
        </motion.div>

        <motion.button
          onClick={onExit}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="px-6 py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-sm transition shadow-xs cursor-pointer"
        >
          Voltar para a Tela Inicial
        </motion.button>
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
          <div className={`w-10 h-10 rounded-xl text-white font-black flex items-center justify-center text-sm shadow-xs ${
            isPractice ? 'bg-emerald-600' : 'bg-blue-600'
          }`}>
            {student.displayNumber}
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-bold text-slate-900 text-sm">{student.pseudonym}</span>
              <span className="px-2 py-0.5 rounded-md bg-slate-100 font-mono text-xs text-slate-600">
                {student.accessCode}
              </span>
              <span
                className={`px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider ${
                  isPractice
                    ? 'bg-emerald-100 text-emerald-800'
                    : 'bg-blue-100 text-blue-800'
                }`}
              >
                {isPractice ? 'Modo Treino (3 Passos)' : 'Modo Avaliação'}
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
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition border cursor-pointer ${
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
            className={`px-3 py-2 rounded-xl text-xs font-bold transition border cursor-pointer ${
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
            className="px-3 py-2 rounded-xl text-xs font-bold text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition cursor-pointer"
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
              Espaço reservado para vídeos reais de mediação em Libras cadastrados pelo professor para {isPractice ? `o Passo ${currentQuestionIndex + 1} de Treino` : `a Questão ${currentQ.id}`}.
            </p>
          </div>

          <div className="w-64 h-36 bg-slate-900 rounded-xl border border-blue-800 flex flex-col items-center justify-center p-3 text-center">
            <Video className="w-8 h-8 text-blue-400 mb-2" />
            <p className="text-xs font-semibold text-slate-300">
              Vídeo de Apoio — {isPractice ? `Passo ${currentQuestionIndex + 1}` : `Questão ${currentQ.id}`}
            </p>
            <span className="text-[10px] text-blue-400 mt-1">Carregado pelo professor</span>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------------- */}
      {/* VISUAL QUESTION STEPPER (3 no Treino / 10 na Avaliação) */}
      {/* ------------------------------------------------------------------- */}
      <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs flex flex-col gap-3">
        <div className="flex items-center justify-between text-xs font-bold text-slate-600">
          <span>{isPractice ? 'PROGRESSO DO MODO TREINO' : 'PROGRESSO DA AVALIAÇÃO (COMPLEXIDADE CRESCENTE)'}</span>
          <span className={isPractice ? 'text-emerald-600' : 'text-blue-600'}>
            {answeredCount} de {totalQuestionsCount} {isPractice ? 'passos concluídos' : 'respondidas'}
          </span>
        </div>

        {/* Animated Smooth Progress Bar */}
        <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
          <motion.div
            className={`h-full rounded-full ${isPractice ? 'bg-emerald-500' : 'bg-blue-600'}`}
            initial={{ width: 0 }}
            animate={{ width: `${(answeredCount / totalQuestionsCount) * 100}%` }}
            transition={SPRING_TOUCH}
          />
        </div>

        <div className={`grid gap-1.5 sm:gap-2 ${isPractice ? 'grid-cols-3' : 'grid-cols-10'}`}>
          {activeQuestions.map((q, idx) => {
            const isAnswered = isQuestionAnswered(q.id, localAnswers[q.id]);
            const isCurrent = idx === currentQuestionIndex;
            const displayStep = idx + 1;

            return (
              <motion.button
                key={q.id}
                onClick={() => {
                  setDirection(idx >= currentQuestionIndex ? 1 : -1);
                  setCurrentQuestionIndex(idx);
                }}
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.96 }}
                className={`py-2 rounded-xl text-xs font-black transition flex flex-col items-center justify-center gap-0.5 cursor-pointer ${
                  isCurrent
                    ? isPractice
                      ? 'bg-emerald-600 text-white ring-2 ring-emerald-300 shadow-sm'
                      : 'bg-blue-600 text-white ring-2 ring-blue-300 shadow-sm'
                    : isAnswered
                    ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                    : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                }`}
                aria-label={`Ir para ${isPractice ? `passo ${displayStep}` : `questão ${displayStep}`}`}
              >
                <span>{isPractice ? `Passo ${displayStep}` : displayStep}</span>
                {isAnswered && !isCurrent && (
                  <Check className="w-2.5 h-2.5 text-emerald-700" />
                )}
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* ------------------------------------------------------------------- */}
      {/* ACTIVE QUESTION CONTAINER WITH DIRECTIONAL SLIDE */}
      {/* ------------------------------------------------------------------- */}
      <AnimatePresence mode="wait" custom={direction}>
        <motion.div
          key={currentQ.id}
          custom={direction}
          variants={questionSlideVariants}
          initial="enter"
          animate="center"
          exit="exit"
          className="p-6 sm:p-8 rounded-3xl bg-white border border-slate-200 shadow-xs flex flex-col gap-6"
        >
          {/* Question Header & Command */}
          <div className="flex flex-col gap-2 pb-4 border-b border-slate-100">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className={`text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full ${
                isPractice ? 'text-emerald-700 bg-emerald-50' : 'text-blue-600 bg-blue-50'
              }`}>
                {isPractice ? currentQ.blockTitle : `${blockInfo.title} • ${currentQ.points.toFixed(2)} pts`}
              </span>
              <span className="text-xs font-bold text-slate-500">
                {isPractice ? `Passo ${currentQuestionIndex + 1} de ${totalQuestionsCount}` : `Questão ${currentQuestionIndex + 1} de ${totalQuestionsCount}`}
              </span>
            </div>

            <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight mt-1">
              {currentQ.title}
            </h2>

            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center gap-3">
              <div className={`w-3 h-3 rounded-full shrink-0 ${isPractice ? 'bg-emerald-600' : 'bg-blue-600'}`} />
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
            <motion.button
              type="button"
              disabled={currentQuestionIndex === 0}
              onClick={() => {
                setDirection(-1);
                setCurrentQuestionIndex(prev => Math.max(0, prev - 1));
              }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="flex items-center gap-2 px-5 py-3 rounded-xl border border-slate-200 hover:bg-slate-100 font-bold text-sm text-slate-700 disabled:opacity-30 disabled:pointer-events-none transition cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Anterior</span>
            </motion.button>

            {/* Middle: Review all */}
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setShowReviewModal(true)}
                className="text-xs font-bold text-slate-600 hover:text-slate-900 px-3 py-2 rounded-lg hover:bg-slate-100 transition cursor-pointer"
              >
                {isPractice ? 'Ver Passos de Treino' : 'Revisar Todas'}
              </button>
            </div>

            {/* Next or Finish Button */}
            {currentQuestionIndex < totalQuestionsCount - 1 ? (
              <motion.button
                type="button"
                onClick={() => {
                  setDirection(1);
                  setCurrentQuestionIndex(prev => Math.min(totalQuestionsCount - 1, prev + 1));
                }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className={`flex items-center gap-2 px-6 py-3 rounded-xl text-white font-bold text-sm transition shadow-xs cursor-pointer ${
                  isPractice ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-blue-600 hover:bg-blue-700'
                }`}
              >
                <span>{isPractice ? 'Próximo Passo' : 'Próxima'}</span>
                <ArrowRight className="w-4 h-4" />
              </motion.button>
            ) : (
              <motion.button
                type="button"
                onClick={() => setShowFinishConfirm(true)}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="flex items-center gap-2 px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm transition shadow-xs cursor-pointer"
              >
                <Send className="w-4 h-4" />
                <span>{isPractice ? 'CONCLUIR TREINO' : 'FINALIZAR AVALIAÇÃO'}</span>
              </motion.button>
            )}
          </div>
        </motion.div>
      </AnimatePresence>

      {/* ------------------------------------------------------------------- */}
      {/* REVIEW QUESTIONS MODAL */}
      {/* ------------------------------------------------------------------- */}
      {showReviewModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 shadow-xl border border-slate-200 flex flex-col gap-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-lg font-black text-slate-900">
                {isPractice ? 'Resumo de Passos de Treino' : 'Resumo de Questões Respondidas'}
              </h3>
              <button
                onClick={() => setShowReviewModal(false)}
                className="text-slate-400 hover:text-slate-700 font-bold p-1 text-base"
              >
                ✕
              </button>
            </div>

            <div className={`grid gap-3 max-h-72 overflow-y-auto p-1 ${isPractice ? 'grid-cols-3' : 'grid-cols-2 sm:grid-cols-5'}`}>
              {activeQuestions.map((q, idx) => {
                const answered = isQuestionAnswered(q.id, localAnswers[q.id]);
                const stepNum = idx + 1;
                return (
                  <button
                    key={q.id}
                    onClick={() => {
                      setCurrentQuestionIndex(idx);
                      setShowReviewModal(false);
                    }}
                    className={`p-3 rounded-xl border-2 flex flex-col items-center justify-center gap-1 transition cursor-pointer ${
                      answered
                        ? 'border-emerald-300 bg-emerald-50 text-emerald-800'
                        : 'border-amber-300 bg-amber-50 text-amber-800'
                    }`}
                  >
                    <span className="font-black text-base">{isPractice ? `Passo ${stepNum}` : `Q${stepNum}`}</span>
                    <span className="text-[10px] font-bold uppercase">
                      {answered ? 'Respondida' : 'Pendente'}
                    </span>
                  </button>
                );
              })}
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-slate-100">
              <span className="text-xs text-slate-600 font-medium">
                {answeredCount} de {totalQuestionsCount} {isPractice ? 'passos concluídos' : 'respondidas'}
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
                {isPractice ? 'Concluir Treino?' : 'Finalizar e Entregar Avaliação?'}
              </h3>
              <p className="text-xs text-slate-600">
                {isPractice
                  ? `Você completou ${answeredCount} de ${totalQuestionsCount} passos do tutorial. Deseja finalizar seu treino de ambientação?`
                  : `Você respondeu ${answeredCount} de ${totalQuestionsCount} questões. Deseja registrar suas respostas definitivas para o professor?`}
              </p>
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setShowFinishConfirm(false)}
                className="flex-1 py-3 rounded-xl border border-slate-200 text-slate-700 font-bold text-xs hover:bg-slate-100 transition cursor-pointer"
              >
                Continuar Revisando
              </button>
              <button
                type="button"
                disabled={isSaving}
                onClick={handleFinishAssessment}
                className="flex-1 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition shadow-xs disabled:opacity-50 cursor-pointer"
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
