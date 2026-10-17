'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Student, Attempt, AssessmentMode } from '@/types/geo3d';
import { StudentLogin } from '@/components/student/StudentLogin';
import { StudentAssessmentView } from '@/components/student/StudentAssessmentView';
import { ExplorationLab } from '@/components/exploration/ExplorationLab';
import { TeacherAuth } from '@/components/teacher/TeacherAuth';
import { TeacherDashboard } from '@/components/teacher/TeacherDashboard';
import { 
  Box, 
  Layers, 
  Sparkles, 
  UserCheck, 
  GraduationCap, 
  HelpCircle,
  ShieldCheck,
  ChevronRight
} from 'lucide-react';

type ActiveView = 
  | 'STUDENT_LOGIN' 
  | 'STUDENT_ASSESSMENT' 
  | 'EXPLORATION' 
  | 'TEACHER_AUTH' 
  | 'TEACHER_DASHBOARD';

export default function HomePage() {
  const [activeView, setActiveView] = useState<ActiveView>('STUDENT_LOGIN');
  const [isTeacherAuthenticated, setIsTeacherAuthenticated] = useState<boolean>(false);
  const [activeStudent, setActiveStudent] = useState<Student | null>(null);
  const [activeAttempt, setActiveAttempt] = useState<Attempt | null>(null);
  const [assessmentMode, setAssessmentMode] = useState<AssessmentMode>('EVALUATION');

  const handleStudentLoginSuccess = (student: Student, attempt: Attempt, mode: AssessmentMode) => {
    setActiveStudent(student);
    setActiveAttempt(attempt);
    setAssessmentMode(mode);
    setActiveView('STUDENT_ASSESSMENT');
  };

  const handleExitStudentAssessment = () => {
    setActiveStudent(null);
    setActiveAttempt(null);
    setActiveView('STUDENT_LOGIN');
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 selection:bg-blue-100 selection:text-blue-900">
      {/* ------------------------------------------------------------------- */}
      {/* GLOBAL ACCESSIBLE HEADER */}
      {/* ------------------------------------------------------------------- */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
          {/* Logo & Platform Name */}
          <button
            onClick={() => {
              if (activeView !== 'STUDENT_ASSESSMENT') {
                setActiveView('STUDENT_LOGIN');
              }
            }}
            className="flex items-center gap-2.5 text-left group transition focus-visible:rounded-lg"
            aria-label="Geo3D Início"
          >
            <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-xs group-hover:scale-105 transition">
              <Box className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-black text-lg text-slate-900 tracking-tight">Geo3D</span>
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-blue-50 text-blue-700 uppercase">
                  Computação Gráfica
                </span>
              </div>
              <p className="text-[11px] text-slate-600 font-medium hidden sm:block">
                Prof. Me. Ábner Lucas
              </p>
            </div>
          </button>

          {/* Navigation Tabs (Available when not locked in active test) */}
          <nav className="flex items-center gap-1.5 sm:gap-2">
            <button
              onClick={() => {
                if (activeView === 'STUDENT_ASSESSMENT') {
                  if (confirm('Deseja pausar sua atividade e voltar ao menu inicial? Suas respostas foram salvas.')) {
                    handleExitStudentAssessment();
                  }
                } else if (activeStudent && activeAttempt) {
                  setActiveView('STUDENT_ASSESSMENT');
                } else {
                  setActiveView('STUDENT_LOGIN');
                }
              }}
              className={`px-3 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                activeView === 'STUDENT_LOGIN' || activeView === 'STUDENT_ASSESSMENT'
                  ? 'bg-blue-50 text-blue-700 border border-blue-200'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <UserCheck className="w-4 h-4" />
              <span>{activeStudent && activeView !== 'STUDENT_ASSESSMENT' ? 'Voltar à Prova' : 'Estudante'}</span>
            </button>

            <button
              onClick={() => {
                if (activeView === 'STUDENT_ASSESSMENT') {
                  if (confirm('Deseja abrir o laboratório de exploração? Suas respostas estão salvas no sistema.')) {
                    setActiveView('EXPLORATION');
                  }
                } else {
                  setActiveView('EXPLORATION');
                }
              }}
              className={`px-3 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                activeView === 'EXPLORATION'
                  ? 'bg-blue-50 text-blue-700 border border-blue-200'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Sparkles className="w-4 h-4 text-amber-500" />
              <span>Laboratório 3D</span>
            </button>

            <button
              onClick={() => {
                if (activeView === 'STUDENT_ASSESSMENT') {
                  if (confirm('Ir para o painel docente? Sua tentativa atual está salva.')) {
                    setActiveView(isTeacherAuthenticated ? 'TEACHER_DASHBOARD' : 'TEACHER_AUTH');
                  }
                } else if (isTeacherAuthenticated) {
                  setActiveView('TEACHER_DASHBOARD');
                } else {
                  setActiveView('TEACHER_AUTH');
                }
              }}
              className={`px-3 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                activeView === 'TEACHER_AUTH' || activeView === 'TEACHER_DASHBOARD'
                  ? 'bg-blue-50 text-blue-700 border border-blue-200'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <GraduationCap className="w-4 h-4 text-blue-600" />
              <span className="hidden sm:inline">Professor</span>
            </button>
          </nav>
        </div>
      </header>

      {/* ------------------------------------------------------------------- */}
      {/* MAIN VIEW CONTAINER */}
      {/* ------------------------------------------------------------------- */}
      <main className="flex-1 max-w-6xl w-full mx-auto p-4 sm:p-6 flex flex-col justify-center">
        <AnimatePresence mode="wait">
          {/* 1. STUDENT LOGIN */}
          {activeView === 'STUDENT_LOGIN' && (
            <motion.div 
              key="STUDENT_LOGIN"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.22 }}
              className="py-6 sm:py-12"
            >
              <StudentLogin
                onLoginSuccess={handleStudentLoginSuccess}
                onOpenExploration={() => setActiveView('EXPLORATION')}
                onOpenTeacher={() => setActiveView('TEACHER_AUTH')}
              />
            </motion.div>
          )}

          {/* 2. STUDENT ACTIVE ASSESSMENT / TRAINING */}
          {activeView === 'STUDENT_ASSESSMENT' && activeStudent && activeAttempt && (
            <motion.div 
              key="STUDENT_ASSESSMENT"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              transition={{ duration: 0.22 }}
              className="w-full"
            >
              <StudentAssessmentView
                student={activeStudent}
                initialAttempt={activeAttempt}
                mode={assessmentMode}
                onExit={handleExitStudentAssessment}
                onAttemptChange={setActiveAttempt}
              />
            </motion.div>
          )}

          {/* 3. 3D EXPLORATION LAB */}
          {activeView === 'EXPLORATION' && (
            <motion.div 
              key="EXPLORATION"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.22 }}
              className="py-4"
            >
              <ExplorationLab />
            </motion.div>
          )}

          {/* 4. TEACHER AUTHENTICATION */}
          {activeView === 'TEACHER_AUTH' && (
            <motion.div 
              key="TEACHER_AUTH"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.22 }}
              className="py-12"
            >
              <TeacherAuth
                onSuccess={() => {
                  setIsTeacherAuthenticated(true);
                  setActiveView('TEACHER_DASHBOARD');
                }}
                onCancel={() => setActiveView('STUDENT_LOGIN')}
              />
            </motion.div>
          )}

          {/* 5. TEACHER DASHBOARD */}
          {activeView === 'TEACHER_DASHBOARD' && (
            <motion.div 
              key="TEACHER_DASHBOARD"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.22 }}
              className="py-4"
            >
              <TeacherDashboard
                onBackToHome={() => setActiveView('STUDENT_LOGIN')}
                onLogout={async () => {
                  try {
                    await fetch('/api/teacher/logout', { method: 'POST' });
                  } catch {}
                  setIsTeacherAuthenticated(false);
                  setActiveView('STUDENT_LOGIN');
                }}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* ------------------------------------------------------------------- */}
      {/* ACCESSIBLE FOOTER */}
      {/* ------------------------------------------------------------------- */}
      <footer className="border-t border-slate-200 bg-white py-6 mt-auto">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-700">Geo3D</span>
            <span>•</span>
            <span>Laboratório de Computação Gráfica</span>
            <span>•</span>
            <span className="font-semibold text-slate-700">Prof. Me. Ábner Lucas</span>
          </div>

          <div className="flex items-center gap-4 text-[11px]">
            <span>Acessibilidade WCAG 2.2 AA</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
