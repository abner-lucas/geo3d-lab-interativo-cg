'use client';

import React, { useState, useEffect } from 'react';
import { ClassRoom, Student, Attempt, AuditLog } from '@/types/geo3d';
import { QUESTIONS, QUESTION_BLOCKS } from '@/lib/questions';
import { 
  Users, 
  CheckCircle2, 
  Clock, 
  TrendingUp, 
  AlertTriangle, 
  Download, 
  Lock, 
  Unlock, 
  Plus, 
  Search, 
  Edit3, 
  ChevronRight, 
  FileText, 
  Save, 
  Check, 
  RefreshCw, 
  ShieldAlert,
  ArrowLeft,
  Trash2,
  Pencil,
  LogOut
} from 'lucide-react';

interface TeacherDashboardProps {
  onBackToHome: () => void;
  onLogout?: () => void;
}

export function TeacherDashboard({ onBackToHome, onLogout }: TeacherDashboardProps) {
  const [classes, setClasses] = useState<ClassRoom[]>([]);
  const [selectedClassId, setSelectedClassId] = useState<string>('');
  const [students, setStudents] = useState<Student[]>([]);
  const [attempts, setAttempts] = useState<Attempt[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [studentAttempt, setStudentAttempt] = useState<Attempt | null>(null);
  const [pedagogicalNotes, setPedagogicalNotes] = useState<string>('');
  const [isSavingNotes, setIsSavingNotes] = useState<boolean>(false);
  const [notesSaved, setNotesSaved] = useState<boolean>(false);

  // Grade adjustment state
  const [showAdjustmentModal, setShowAdjustmentModal] = useState<boolean>(false);
  const [adjustedScoreInput, setAdjustedScoreInput] = useState<string>('');
  const [adjustmentReason, setAdjustmentReason] = useState<string>('');

  // Modals for edit student and delete student
  const [showEditStudentModal, setShowEditStudentModal] = useState<boolean>(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [editPseudonym, setEditPseudonym] = useState<string>('');
  const [editAccessCode, setEditAccessCode] = useState<string>('');
  const [editDisplayNumber, setEditDisplayNumber] = useState<number>(1);
  const [editNotes, setEditNotes] = useState<string>('');
  const [isUpdatingStudent, setIsUpdatingStudent] = useState<boolean>(false);

  const [showDeleteModal, setShowDeleteModal] = useState<boolean>(false);
  const [studentToDelete, setStudentToDelete] = useState<Student | null>(null);
  const [isDeletingStudent, setIsDeletingStudent] = useState<boolean>(false);

  // Modals for new class and new student
  const [showNewClassModal, setShowNewClassModal] = useState<boolean>(false);
  const [newClassName, setNewClassName] = useState<string>('');
  const [newClassPeriod, setNewClassPeriod] = useState<string>('2026.1');

  const [showNewStudentModal, setShowNewStudentModal] = useState<boolean>(false);
  const [newStudentPseudonym, setNewStudentPseudonym] = useState<string>('');

  const [searchQuery, setSearchQuery] = useState<string>('');

  // Load classes and attempts on mount
  useEffect(() => {
    let ignore = false;

    async function fetchData() {
      try {
        const res = await fetch('/api/teacher/classes');
        if (!res.ok || ignore) return;
        const data = await res.json();
        if (ignore) return;
        setClasses(data.classes || []);
        if (data.classes && data.classes.length > 0) {
          const firstClassId = data.classes[0].id;
          setSelectedClassId(firstClassId);
          
          const studentsRes = await fetch(`/api/teacher/students?classId=${firstClassId}`);
          if (studentsRes.ok && !ignore) {
            const studentData = await studentsRes.json();
            setStudents(studentData.students || []);
            setAttempts(studentData.attempts || []);
          }
        }
      } catch {
        // Handled
      } finally {
        if (!ignore) setIsLoading(false);
      }
    }

    fetchData();

    return () => {
      ignore = true;
    };
  }, []);

  const loadClassDetails = async (classId: string) => {
    try {
      setIsLoading(true);
      const res = await fetch(`/api/teacher/students?classId=${classId}`);
      if (res.ok) {
        const data = await res.json();
        setStudents(data.students || []);
        setAttempts(data.attempts || []);
      }
    } catch {} finally {
      setIsLoading(false);
    }
  };

  const handleClassChange = async (classId: string) => {
    setSelectedClassId(classId);
    setSelectedStudent(null);
    setStudentAttempt(null);
    await loadClassDetails(classId);
  };

  const activeClass = classes.find(c => c.id === selectedClassId);

  // Toggle class assessment active
  const handleToggleAssessment = async () => {
    if (!activeClass) return;
    try {
      const nextActive = !activeClass.isAssessmentActive;
      const res = await fetch('/api/teacher/toggle-assessment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ classId: activeClass.id, isActive: nextActive })
      });
      if (res.ok) {
        setClasses(prev => prev.map(c => c.id === activeClass.id ? { ...c, isAssessmentActive: nextActive } : c));
      }
    } catch {}
  };

  // Select student to view drilldown
  const handleSelectStudent = (student: Student) => {
    setSelectedStudent(student);
    setPedagogicalNotes(student.notes || '');
    setNotesSaved(false);
    const att = attempts.find(a => a.studentId === student.id && a.mode === 'EVALUATION');
    setStudentAttempt(att || null);
  };

  // Save pedagogical notes
  const handleSaveNotes = async () => {
    if (!selectedStudent) return;
    try {
      setIsSavingNotes(true);
      setNotesSaved(false);
      const res = await fetch('/api/teacher/notes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          studentId: selectedStudent.id,
          notes: pedagogicalNotes
        })
      });
      if (res.ok) {
        setStudents(prev => prev.map(s => s.id === selectedStudent.id ? { ...s, notes: pedagogicalNotes } : s));
        setSelectedStudent(prev => prev ? { ...prev, notes: pedagogicalNotes } : null);
        setNotesSaved(true);
        setTimeout(() => setNotesSaved(false), 2500);
      }
    } catch {} finally {
      setIsSavingNotes(false);
    }
  };

  // Submit grade adjustment
  const handleSaveScoreAdjustment = async () => {
    if (!studentAttempt || !adjustmentReason.trim()) return;
    try {
      const newScore = parseFloat(adjustedScoreInput);
      if (isNaN(newScore) || newScore < 0 || newScore > 10) {
        alert('Digite uma nota válida entre 0,0 e 10,0');
        return;
      }

      const res = await fetch('/api/teacher/adjust-score', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          attemptId: studentAttempt.id,
          newScore,
          justification: adjustmentReason
        })
      });

      if (res.ok) {
        const data = await res.json();
        setStudentAttempt(data.attempt);
        setAttempts(prev => prev.map(a => a.id === data.attempt.id ? data.attempt : a));
        setShowAdjustmentModal(false);
        setAdjustmentReason('');
      }
    } catch {}
  };

  // Create new class
  const handleCreateClass = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newClassName.trim()) return;
    try {
      const res = await fetch('/api/teacher/classes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newClassName.trim(),
          yearPeriod: newClassPeriod.trim()
        })
      });
      if (res.ok) {
        const data = await res.json();
        setClasses(prev => [...prev, data.class]);
        setSelectedClassId(data.class.id);
        setShowNewClassModal(false);
        setNewClassName('');
        await loadClassDetails(data.class.id);
      }
    } catch {}
  };

  // Create new student
  const handleCreateStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStudentPseudonym.trim() || !selectedClassId) return;
    try {
      const res = await fetch('/api/teacher/students', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          classId: selectedClassId,
          pseudonym: newStudentPseudonym.trim()
        })
      });
      if (res.ok) {
        const data = await res.json();
        setStudents(prev => [...prev, data.student]);
        setShowNewStudentModal(false);
        setNewStudentPseudonym('');
      }
    } catch {}
  };

  // Open edit student modal
  const handleOpenEditStudent = (student: Student) => {
    setEditingStudent(student);
    setEditPseudonym(student.pseudonym);
    setEditAccessCode(student.accessCode);
    setEditDisplayNumber(student.displayNumber || 1);
    setEditNotes(student.notes || '');
    setShowEditStudentModal(true);
  };

  // Open delete student confirmation modal
  const handleOpenDeleteStudent = (student: Student) => {
    setStudentToDelete(student);
    setShowDeleteModal(true);
  };

  // Save student edit
  const handleSaveStudentEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingStudent || !editPseudonym.trim() || !editAccessCode.trim()) return;

    try {
      setIsUpdatingStudent(true);
      const res = await fetch('/api/teacher/students', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          studentId: editingStudent.id,
          pseudonym: editPseudonym.trim(),
          accessCode: editAccessCode.trim(),
          displayNumber: editDisplayNumber,
          notes: editNotes
        })
      });

      if (res.ok) {
        const data = await res.json();
        const updatedStudent: Student = data.student;

        // Atualizar lista de estudantes
        setStudents(prev => prev.map(s => s.id === updatedStudent.id ? updatedStudent : s));

        // Atualizar tentativas com o novo pseudônimo/código
        setAttempts(prev => prev.map(a => {
          if (a.studentId === updatedStudent.id) {
            return {
              ...a,
              studentPseudonym: updatedStudent.pseudonym,
              studentCode: updatedStudent.accessCode
            };
          }
          return a;
        }));

        // Atualizar estudante selecionado se for o mesmo
        if (selectedStudent?.id === updatedStudent.id) {
          setSelectedStudent(updatedStudent);
          setPedagogicalNotes(updatedStudent.notes || '');
          if (studentAttempt) {
            setStudentAttempt(prev => prev ? {
              ...prev,
              studentPseudonym: updatedStudent.pseudonym,
              studentCode: updatedStudent.accessCode
            } : null);
          }
        }

        setShowEditStudentModal(false);
        setEditingStudent(null);
      } else {
        const errData = await res.json();
        alert(`Erro ao editar estudante: ${errData.error || 'Erro desconhecido'}`);
      }
    } catch (err: any) {
      alert(`Falha na comunicação: ${err.message}`);
    } finally {
      setIsUpdatingStudent(false);
    }
  };

  // Confirm delete student and all relations
  const handleConfirmDeleteStudent = async () => {
    if (!studentToDelete) return;

    try {
      setIsDeletingStudent(true);
      const res = await fetch(`/api/teacher/students?studentId=${studentToDelete.id}`, {
        method: 'DELETE'
      });

      if (res.ok) {
        // Remover da lista de estudantes
        setStudents(prev => prev.filter(s => s.id !== studentToDelete.id));

        // Remover todas as tentativas do estudante
        setAttempts(prev => prev.filter(a => a.studentId !== studentToDelete.id));

        // Se o estudante deletado era o selecionado no drilldown, fechar a visualização
        if (selectedStudent?.id === studentToDelete.id) {
          setSelectedStudent(null);
          setStudentAttempt(null);
        }

        setShowDeleteModal(false);
        setStudentToDelete(null);
      } else {
        const errData = await res.json();
        alert(`Erro ao excluir estudante: ${errData.error || 'Erro desconhecido'}`);
      }
    } catch (err: any) {
      alert(`Falha na comunicação: ${err.message}`);
    } finally {
      setIsDeletingStudent(false);
    }
  };

  // Export CSV
  const handleExportCSV = () => {
    if (!activeClass || students.length === 0) return;

    const headers = [
      'Identificador',
      'Codigo_Acesso',
      'Turma',
      'Situacao',
      'Questoes_Respondidas',
      'Nota_Calculada',
      'Nota_Ajustada',
      'Justificativa_Ajuste',
      'Observacoes_Pedagogicas'
    ];

    const rows = students.map(s => {
      const att = attempts.find(a => a.studentId === s.id && a.mode === 'EVALUATION');
      const answered = att ? Object.keys(att.responses || {}).length : 0;
      const score = att ? att.totalScore : 0;
      const adjusted = att?.scoreAdjusted !== null && att?.scoreAdjusted !== undefined ? att.scoreAdjusted : '';
      const justification = att?.adjustmentJustification || '';
      const notes = s.notes || '';
      const status = att ? att.status : 'NAO_INICIADA';

      return [
        `"${s.pseudonym}"`,
        `"${s.accessCode}"`,
        `"${activeClass.name}"`,
        `"${status}"`,
        answered,
        score,
        adjusted,
        `"${justification.replace(/"/g, '""')}"`,
        `"${notes.replace(/"/g, '""')}"`
      ].join(';');
    });

    const csvContent = '\uFEFF' + [headers.join(';'), ...rows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `Geo3D_Resultados_${activeClass.code}_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Metrics calculation (filtered by official EVALUATION mode)
  const evalAttempts = attempts.filter(a => a.mode === 'EVALUATION');
  const totalStudents = students.length;
  const startedAttempts = evalAttempts.filter(a => a.status === 'IN_PROGRESS').length;
  const submittedAttempts = evalAttempts.filter(a => a.status === 'SUBMITTED' || a.status === 'REVIEWED').length;
  
  const scoresArray = evalAttempts
    .filter(a => a.status === 'SUBMITTED' || a.status === 'REVIEWED')
    .map(a => (a.scoreAdjusted !== null && a.scoreAdjusted !== undefined ? a.scoreAdjusted : a.totalScore));
  
  const averageScore = scoresArray.length > 0 
    ? String(Number((scoresArray.reduce((acc, curr) => acc + curr, 0) / scoresArray.length).toFixed(2)))
    : '--';

  // Find most missed question
  const questionErrorCounts: Record<number, number> = {};
  evalAttempts.forEach(a => {
    Object.values(a.responses || {}).forEach(r => {
      if (!r.isCorrect) {
        questionErrorCounts[r.questionId] = (questionErrorCounts[r.questionId] || 0) + 1;
      }
    });
  });

  let mostMissedQuestion = '--';
  let maxErrors = 0;
  Object.entries(questionErrorCounts).forEach(([qId, errs]) => {
    if (errs > maxErrors) {
      maxErrors = errs;
      mostMissedQuestion = `Questão ${qId}`;
    }
  });

  const filteredStudents = students.filter(s => 
    s.pseudonym.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.accessCode.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="w-full max-w-6xl mx-auto flex flex-col gap-6 pb-12">
      {/* ------------------------------------------------------------------- */}
      {/* HEADER & CLASS CONTROLS */}
      {/* ------------------------------------------------------------------- */}
      <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <button
              onClick={onBackToHome}
              className="text-xs text-slate-500 hover:text-slate-800 flex items-center gap-1 font-bold mr-2"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              Início
            </button>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-800 uppercase tracking-wider">
              Painel Docente
            </span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            Acompanhamento de Atividades
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Computação Gráfica • Prof. Me. Ábner Lucas
          </p>
        </div>

        {/* Class Selection & Quick Action Buttons */}
        <div className="flex flex-wrap items-center gap-2.5">
          <select
            value={selectedClassId}
            onChange={(e) => handleClassChange(e.target.value)}
            className="px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 font-bold text-xs text-slate-800 focus:border-blue-600 outline-hidden"
          >
            {classes.map(c => (
              <option key={c.id} value={c.id}>{c.name} ({c.code})</option>
            ))}
          </select>

          <button
            onClick={() => selectedClassId && loadClassDetails(selectedClassId)}
            className="p-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 transition"
            title="Atualizar Dados da Turma"
            aria-label="Atualizar dados da turma"
          >
            <RefreshCw className="w-4 h-4" />
          </button>

          <button
            onClick={() => setShowNewClassModal(true)}
            className="p-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 transition"
            title="Criar Nova Turma"
          >
            <Plus className="w-4 h-4" />
          </button>

          {activeClass && (
            <button
              onClick={handleToggleAssessment}
              className={`flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl text-xs font-bold transition border ${
                activeClass.isAssessmentActive
                  ? 'bg-emerald-50 text-emerald-800 border-emerald-300 hover:bg-emerald-100'
                  : 'bg-rose-50 text-rose-800 border-rose-300 hover:bg-rose-100'
              }`}
            >
              {activeClass.isAssessmentActive ? (
                <>
                  <Unlock className="w-4 h-4 text-emerald-600" />
                  <span>Avaliação Aberta</span>
                </>
              ) : (
                <>
                  <Lock className="w-4 h-4 text-rose-600" />
                  <span>Avaliação Bloqueada</span>
                </>
              )}
            </button>
          )}

          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition shadow-xs"
          >
            <Download className="w-4 h-4" />
            <span>Exportar CSV</span>
          </button>

          <button
            type="button"
            onClick={() => {
              if (confirm('Deseja realmente encerrar a sessão docente?')) {
                if (onLogout) onLogout();
                else onBackToHome();
              }
            }}
            className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl border border-rose-200 bg-rose-50 hover:bg-rose-100 active:bg-rose-200 text-rose-700 text-xs font-bold transition shadow-xs cursor-pointer"
            title="Encerrar Sessão Docente"
            aria-label="Encerrar Sessão Docente"
          >
            <LogOut className="w-4 h-4 text-rose-600" />
            <span>Encerrar Sessão</span>
          </button>
        </div>
      </div>

      {/* ------------------------------------------------------------------- */}
      {/* 5 OVERVIEW INDICATOR CARDS */}
      {/* ------------------------------------------------------------------- */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5">
        {/* Card 1: Cadastrados */}
        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider">Estudantes</span>
            <Users className="w-4 h-4 text-blue-600" />
          </div>
          <span className="text-2xl font-black text-slate-900">{totalStudents}</span>
          <span className="text-[10px] text-slate-500 mt-1">Cadastrados na turma</span>
        </div>

        {/* Card 2: Em Andamento */}
        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider">Iniciadas</span>
            <Clock className="w-4 h-4 text-amber-500" />
          </div>
          <span className="text-2xl font-black text-amber-600">{startedAttempts}</span>
          <span className="text-[10px] text-slate-500 mt-1">Em resolução</span>
        </div>

        {/* Card 3: Concluídas */}
        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider">Concluídas</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <span className="text-2xl font-black text-emerald-600">{submittedAttempts}</span>
          <span className="text-[10px] text-slate-500 mt-1">Entregas finalizadas</span>
        </div>

        {/* Card 4: Média Geral */}
        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider">Média Turma</span>
            <TrendingUp className="w-4 h-4 text-blue-600" />
          </div>
          <span className="text-2xl font-black text-blue-600">{averageScore}</span>
          <span className="text-[10px] text-slate-500 mt-1">Escala de 0 a 10,0</span>
        </div>

        {/* Card 5: Questão com mais erro */}
        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider">Maior Dificuldade</span>
            <AlertTriangle className="w-4 h-4 text-rose-500" />
          </div>
          <span className="text-lg font-black text-rose-600">{mostMissedQuestion}</span>
          <span className="text-[10px] text-slate-500 mt-1">Frequência de revisão</span>
        </div>
      </div>

      {/* ------------------------------------------------------------------- */}
      {/* STUDENTS TABLE AND DETAILED DRILLDOWN */}
      {/* ------------------------------------------------------------------- */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left: Students Table (7 cols) */}
        <div className="lg:col-span-7 bg-white rounded-3xl border border-slate-200 shadow-xs p-5 flex flex-col gap-4">
          <div className="flex items-center justify-between gap-3">
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
              <input
                type="text"
                placeholder="Buscar por pseudônimo ou código..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 text-xs focus:border-blue-600 outline-hidden"
              />
            </div>

            <button
              onClick={() => setShowNewStudentModal(true)}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs transition"
            >
              <Plus className="w-4 h-4" />
              <span>Novo Estudante</span>
            </button>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-100 text-slate-600 uppercase tracking-wider text-[10px]">
                  <th className="py-2.5 font-bold">Estudante</th>
                  <th className="py-2.5 font-bold">Código</th>
                  <th className="py-2.5 font-bold">Progresso</th>
                  <th className="py-2.5 font-bold text-center">Nota</th>
                  <th className="py-2.5 font-bold text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {isLoading && filteredStudents.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-xs text-slate-500 font-medium">
                      Carregando dados da turma...
                    </td>
                  </tr>
                ) : filteredStudents.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-xs text-slate-500 font-medium">
                      Nenhum estudante encontrado para o filtro informado.
                    </td>
                  </tr>
                ) : filteredStudents.map(student => {
                  const att = attempts.find(a => a.studentId === student.id && a.mode === 'EVALUATION');
                  const answered = att ? Object.keys(att.responses || {}).length : 0;
                  const isSelected = selectedStudent?.id === student.id;

                  const finalScore = att
                    ? (att.scoreAdjusted !== null && att.scoreAdjusted !== undefined ? att.scoreAdjusted : att.totalScore)
                    : null;

                  return (
                    <tr
                      key={student.id}
                      onClick={() => handleSelectStudent(student)}
                      className={`cursor-pointer transition hover:bg-slate-50 ${isSelected ? 'bg-blue-50/70' : ''}`}
                    >
                      <td className="py-3 font-bold text-slate-900">
                        {student.pseudonym}
                      </td>
                      <td className="py-3 font-mono text-slate-600 font-semibold">
                        {student.accessCode}
                      </td>
                      <td className="py-3">
                        <span className="font-semibold text-slate-700">
                          {answered} / 10
                        </span>
                      </td>
                      <td className="py-3 text-center">
                        {finalScore !== null ? (
                          <span className="font-bold px-2 py-0.5 rounded-md bg-blue-100 text-blue-800">
                            {Number(finalScore.toFixed(2))}
                          </span>
                        ) : (
                          <span className="text-slate-400 font-semibold">--</span>
                        )}
                      </td>
                      <td className="py-3 text-right">
                        <div className="flex items-center justify-end gap-1" onClick={(e) => e.stopPropagation()}>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleOpenEditStudent(student);
                            }}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition"
                            title="Editar dados do estudante"
                          >
                            <Pencil className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleOpenDeleteStudent(student);
                            }}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition"
                            title="Excluir estudante e histórico"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                          <ChevronRight className="w-4 h-4 text-slate-300 ml-0.5" />
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right: Individual Drilldown Inspector (5 cols) */}
        <div className="lg:col-span-5 bg-white rounded-3xl border border-slate-200 shadow-xs p-6 flex flex-col gap-5">
          {selectedStudent ? (
            <>
              {/* Student Header */}
              <div className="flex items-start justify-between pb-4 border-b border-slate-100">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600">
                    Detalhes do Estudante
                  </span>
                  <h3 className="text-lg font-black text-slate-900 mt-0.5">
                    {selectedStudent.pseudonym}
                  </h3>
                  <p className="font-mono text-xs text-slate-500 font-bold mt-0.5">
                    Código: {selectedStudent.accessCode}
                  </p>
                </div>

                <div className="text-right">
                  <span className="text-[10px] font-bold text-slate-600 uppercase block">Nota Final</span>
                  <span className="text-2xl font-black text-blue-600">
                    {studentAttempt
                      ? Number((studentAttempt.scoreAdjusted ?? studentAttempt.totalScore).toFixed(2))
                      : '--'}
                  </span>
                </div>
              </div>

              {/* Student Management Actions */}
              <div className="flex items-center gap-2 pt-1 pb-1">
                <button
                  type="button"
                  onClick={() => handleOpenEditStudent(selectedStudent)}
                  className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl border border-blue-200 bg-blue-50/70 hover:bg-blue-100/80 text-blue-700 text-xs font-bold transition shadow-xs"
                  title="Editar dados e código do estudante"
                >
                  <Pencil className="w-3.5 h-3.5" />
                  <span>Editar Estudante</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleOpenDeleteStudent(selectedStudent)}
                  className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl border border-rose-200 bg-rose-50/70 hover:bg-rose-100/80 text-rose-700 text-xs font-bold transition shadow-xs"
                  title="Excluir estudante e todas as relações associadas"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Excluir</span>
                </button>
              </div>

              {/* Adjust Grade Button */}
              {studentAttempt && (
                <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <div className="text-xs">
                    <span className="font-bold text-slate-700">Ajuste Justificado de Nota</span>
                    {studentAttempt.scoreAdjusted !== null && studentAttempt.scoreAdjusted !== undefined && (
                      <p className="text-[11px] text-amber-700 font-medium">
                        Nota original: {Number(studentAttempt.totalScore.toFixed(2))}
                      </p>
                    )}
                  </div>
                  <button
                    onClick={() => {
                      setAdjustedScoreInput(String(studentAttempt.scoreAdjusted ?? studentAttempt.totalScore));
                      setShowAdjustmentModal(true);
                    }}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    <span>Ajustar Nota</span>
                  </button>
                </div>
              )}

              {/* 10 Questions Breakdown */}
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-slate-700 block mb-2">
                  Desempenho por Questão (10 Itens)
                </span>

                <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                  {QUESTIONS.map(q => {
                    const resp = studentAttempt?.responses?.[q.id];
                    const hasAnswer = resp !== undefined;
                    const isCorrect = resp?.isCorrect;
                    const earned = resp?.score ?? 0;

                    return (
                      <div
                        key={q.id}
                        className="p-2.5 rounded-xl border border-slate-200 bg-slate-50/70 flex items-center justify-between text-xs"
                      >
                        <div className="flex items-center gap-2">
                          <span className={`w-5 h-5 rounded-md flex items-center justify-center font-bold text-[10px] ${
                            !hasAnswer 
                              ? 'bg-slate-200 text-slate-600' 
                              : isCorrect 
                              ? 'bg-emerald-100 text-emerald-700' 
                              : 'bg-rose-100 text-rose-700'
                          }`}>
                            {q.id}
                          </span>
                          <div>
                            <p className="font-bold text-slate-800">{q.title}</p>
                            <span className="text-[10px] text-slate-500">{q.blockTitle}</span>
                          </div>
                        </div>

                        <div className="text-right">
                          <span className="font-bold text-slate-800">{earned.toFixed(2)} pts</span>
                          <span className="text-[10px] text-slate-500 block">de {q.points.toFixed(2)}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Pedagogical Learning Notes */}
              <div className="pt-3 border-t border-slate-100 flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-700">
                    Observações Pedagógicas
                  </span>
                  <button
                    onClick={handleSaveNotes}
                    disabled={isSavingNotes}
                    className={`flex items-center gap-1 text-xs font-bold transition ${
                      notesSaved ? 'text-emerald-600' : 'text-blue-600 hover:text-blue-800'
                    }`}
                  >
                    {notesSaved ? <Check className="w-3.5 h-3.5" /> : <Save className="w-3.5 h-3.5" />}
                    <span>{isSavingNotes ? 'Gravando...' : notesSaved ? 'Salvo!' : 'Salvar Nota'}</span>
                  </button>
                </div>
                <textarea
                  value={pedagogicalNotes}
                  onChange={(e) => setPedagogicalNotes(e.target.value)}
                  placeholder="Registre observações sobre a aprendizagem, preferências visuais, mediação em Libras utilizada, etc."
                  rows={3}
                  className="w-full p-3 rounded-xl border border-slate-200 text-xs text-slate-800 focus:border-blue-600 outline-hidden resize-none"
                />
              </div>
            </>
          ) : (
            <div className="h-80 flex flex-col items-center justify-center text-center text-slate-400 p-6">
              <FileText className="w-10 h-10 mb-2 opacity-50" />
              <p className="font-bold text-sm text-slate-600">Nenhum estudante selecionado</p>
              <p className="text-xs text-slate-400 mt-1">
                Selecione um estudante na tabela ao lado para visualizar as respostas e atribuir observações.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* ------------------------------------------------------------------- */}
      {/* ADJUST GRADE MODAL (WITH JUSTIFICATION AUDIT) */}
      {/* ------------------------------------------------------------------- */}
      {showAdjustmentModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-xl border border-slate-200 flex flex-col gap-4">
            <h3 className="text-lg font-black text-slate-900">
              Ajuste Justificado de Nota
            </h3>
            <p className="text-xs text-slate-600">
              Conforme as diretrizes pedagógicas, qualquer alteração manual de pontuação deve ser formalmente justificada com registro de auditoria.
            </p>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                Nova Nota (0,0 a 10,0)
              </label>
              <input
                type="number"
                step="0.1"
                min="0"
                max="10"
                value={adjustedScoreInput}
                onChange={(e) => setAdjustedScoreInput(e.target.value)}
                className="w-full p-3 rounded-xl border border-slate-200 text-lg font-bold text-blue-600"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                Justificativa Pedagógica Obrigatória
              </label>
              <textarea
                value={adjustmentReason}
                onChange={(e) => setAdjustmentReason(e.target.value)}
                placeholder="Ex: Considerada mediação visual complementar e validação de conceito espacial..."
                rows={3}
                className="w-full p-3 rounded-xl border border-slate-200 text-xs text-slate-800 resize-none outline-hidden"
              />
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                onClick={() => setShowAdjustmentModal(false)}
                className="flex-1 py-2.5 rounded-xl border border-slate-200 font-bold text-xs text-slate-700 hover:bg-slate-100 transition"
              >
                Cancelar
              </button>
              <button
                onClick={handleSaveScoreAdjustment}
                disabled={!adjustmentReason.trim()}
                className="flex-1 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs transition shadow-xs disabled:opacity-50"
              >
                Salvar Alteração
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------------- */}
      {/* NEW CLASS MODAL */}
      {/* ------------------------------------------------------------------- */}
      {showNewClassModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <form onSubmit={handleCreateClass} className="bg-white rounded-3xl max-w-md w-full p-6 shadow-xl border border-slate-200 flex flex-col gap-4">
            <h3 className="text-lg font-black text-slate-900">
              Cadastrar Nova Turma
            </h3>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                Nome da Turma
              </label>
              <input
                type="text"
                required
                placeholder="Ex: Turma Computação Gráfica A"
                value={newClassName}
                onChange={(e) => setNewClassName(e.target.value)}
                className="w-full p-3 rounded-xl border border-slate-200 text-xs font-bold"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                Período Letivo
              </label>
              <input
                type="text"
                required
                value={newClassPeriod}
                onChange={(e) => setNewClassPeriod(e.target.value)}
                className="w-full p-3 rounded-xl border border-slate-200 text-xs"
              />
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowNewClassModal(false)}
                className="flex-1 py-2.5 rounded-xl border border-slate-200 font-bold text-xs text-slate-700 hover:bg-slate-100"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="flex-1 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs"
              >
                Criar Turma
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ------------------------------------------------------------------- */}
      {/* NEW STUDENT MODAL */}
      {/* ------------------------------------------------------------------- */}
      {showNewStudentModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <form onSubmit={handleCreateStudent} className="bg-white rounded-3xl max-w-md w-full p-6 shadow-xl border border-slate-200 flex flex-col gap-4">
            <h3 className="text-lg font-black text-slate-900">
              Cadastrar Estudante
            </h3>
            <p className="text-xs text-slate-500">
              Em conformidade com a LGPD, utilize pseudônimos ou identificadores institucionais. O código de acesso será gerado automaticamente.
            </p>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                Pseudônimo ou Identificador
              </label>
              <input
                type="text"
                required
                placeholder="Ex: Estudante 05 (Mariana)"
                value={newStudentPseudonym}
                onChange={(e) => setNewStudentPseudonym(e.target.value)}
                className="w-full p-3 rounded-xl border border-slate-200 text-xs font-bold"
              />
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowNewStudentModal(false)}
                className="flex-1 py-2.5 rounded-xl border border-slate-200 font-bold text-xs text-slate-700 hover:bg-slate-100"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="flex-1 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs"
              >
                Cadastrar e Gerar Código
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ------------------------------------------------------------------- */}
      {/* EDIT STUDENT MODAL */}
      {/* ------------------------------------------------------------------- */}
      {showEditStudentModal && editingStudent && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <form onSubmit={handleSaveStudentEdit} className="bg-white rounded-3xl max-w-md w-full p-6 shadow-xl border border-slate-200 flex flex-col gap-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-lg font-black text-slate-900">
                  Editar Dados do Estudante
                </h3>
                <p className="text-xs text-slate-500">
                  Atualize identificadores, código de acesso e notas pedagógicas
                </p>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                Pseudônimo ou Identificador (LGPD)
              </label>
              <input
                type="text"
                required
                value={editPseudonym}
                onChange={(e) => setEditPseudonym(e.target.value)}
                placeholder="Ex: Estudante 01 (Luiza)"
                className="w-full p-3 rounded-xl border border-slate-200 text-xs font-bold focus:border-blue-600 outline-hidden"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Código de Acesso
                </label>
                <input
                  type="text"
                  required
                  value={editAccessCode}
                  onChange={(e) => setEditAccessCode(e.target.value.toUpperCase())}
                  placeholder="Ex: GEO-01-2026"
                  className="w-full p-3 rounded-xl border border-slate-200 font-mono text-xs font-bold text-blue-700 focus:border-blue-600 outline-hidden uppercase"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Nº de Ordem
                </label>
                <input
                  type="number"
                  min="1"
                  value={editDisplayNumber}
                  onChange={(e) => setEditDisplayNumber(parseInt(e.target.value) || 1)}
                  className="w-full p-3 rounded-xl border border-slate-200 text-xs font-bold focus:border-blue-600 outline-hidden"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                Observações Pedagógicas
              </label>
              <textarea
                value={editNotes}
                onChange={(e) => setEditNotes(e.target.value)}
                placeholder="Observações pedagógicas, necessidades de acessibilidade, mediações, etc."
                rows={3}
                className="w-full p-3 rounded-xl border border-slate-200 text-xs text-slate-800 resize-none outline-hidden focus:border-blue-600"
              />
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => {
                  setShowEditStudentModal(false);
                  setEditingStudent(null);
                }}
                disabled={isUpdatingStudent}
                className="flex-1 py-2.5 rounded-xl border border-slate-200 font-bold text-xs text-slate-700 hover:bg-slate-100 transition"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={isUpdatingStudent || !editPseudonym.trim() || !editAccessCode.trim()}
                className="flex-1 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs transition shadow-xs disabled:opacity-50 flex items-center justify-center gap-1.5"
              >
                {isUpdatingStudent ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Salvando...</span>
                  </>
                ) : (
                  <span>Salvar Alterações</span>
                )}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ------------------------------------------------------------------- */}
      {/* DELETE STUDENT CONFIRMATION MODAL */}
      {/* ------------------------------------------------------------------- */}
      {showDeleteModal && studentToDelete && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-xl border border-rose-200 flex flex-col gap-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center gap-3 text-rose-600">
              <div className="w-10 h-10 rounded-2xl bg-rose-100 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-5 h-5 text-rose-600" />
              </div>
              <div>
                <h3 className="text-base font-black text-slate-900">
                  Excluir Estudante e Histórico
                </h3>
                <span className="text-xs text-rose-600 font-semibold">
                  Ação definitiva e irreversível
                </span>
              </div>
            </div>

            <div className="p-3.5 bg-rose-50/60 border border-rose-200/80 rounded-2xl text-xs text-slate-700 space-y-2">
              <p>
                Você está prestes a excluir o estudante <strong className="text-slate-900">{studentToDelete.pseudonym}</strong> (Código: <code className="font-mono font-bold text-rose-700">{studentToDelete.accessCode}</code>).
              </p>
              <p className="text-[11px] text-slate-600">
                Esta operação removerá <strong>em definitivo</strong> todas as relações vinculadas a este estudante:
              </p>
              <ul className="list-disc list-inside text-[11px] text-slate-600 space-y-0.5">
                <li>Respostas das 10 questões do Modo Avaliação</li>
                <li>Tentativas e histórico do Modo Treino</li>
                <li>Notas calculadas e eventuais ajustes de pontuação</li>
                <li>Registros de auditoria associados</li>
              </ul>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => {
                  setShowDeleteModal(false);
                  setStudentToDelete(null);
                }}
                disabled={isDeletingStudent}
                className="flex-1 py-2.5 rounded-xl border border-slate-200 font-bold text-xs text-slate-700 hover:bg-slate-100 transition"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleConfirmDeleteStudent}
                disabled={isDeletingStudent}
                className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs transition shadow-xs disabled:opacity-50 flex items-center justify-center gap-1.5"
              >
                {isDeletingStudent ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Excluindo...</span>
                  </>
                ) : (
                  <>
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Excluir Definitivamente</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
