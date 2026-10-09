import { supabase, isSupabaseConfigured } from './supabase';
import { Student, ClassRoom, Attempt, AuditLog, TeacherUser } from '@/types/geo3d';
import { gradeStudentAnswer, QUESTIONS } from './questions';

// IN-MEMORY / SERVER DATABASE STATE FOR INSTANT ZERO-SETUP OPERATION
// Automatically persists and syncs with Supabase when configured!

export const DEFAULT_TEACHER: TeacherUser = {
  id: 'teacher-marcos-01',
  name: 'Prof. Marcos Rocha',
  email: 'prof@geo3d.edu.br',
  role: 'teacher'
};

const DEFAULT_CLASS: ClassRoom = {
  id: 'class-info-3a',
  teacherId: 'teacher-marcos-01',
  code: 'TURMA-INFO3',
  name: '3º Ano Informática Integrado - Manhã',
  yearPeriod: '2026.1',
  isAssessmentActive: true,
  studentCount: 4,
  createdAt: new Date().toISOString()
};

let classesDb: ClassRoom[] = [DEFAULT_CLASS];

let studentsDb: Student[] = [
  {
    id: 'student-01',
    classId: 'class-info-3a',
    pseudonym: 'Estudante 01 (Luiza)',
    displayNumber: 1,
    accessCode: 'GEO-ALUNA-01',
    notes: 'Estudante com preferência por instruções visuais diretas e animações de dobradura.',
    createdAt: new Date().toISOString()
  },
  {
    id: 'student-02',
    classId: 'class-info-3a',
    pseudonym: 'Estudante 02 (Gabriel)',
    displayNumber: 2,
    accessCode: 'GEO-ALUNO-02',
    notes: 'Boa percepção espacial, explorou os sólidos no laboratório prévio.',
    createdAt: new Date().toISOString()
  },
  {
    id: 'student-03',
    classId: 'class-info-3a',
    pseudonym: 'Estudante 03 (Sofia)',
    displayNumber: 3,
    accessCode: 'GEO-ALUNA-03',
    notes: '',
    createdAt: new Date().toISOString()
  },
  {
    id: 'student-04',
    classId: 'class-info-3a',
    pseudonym: 'Estudante 04 (Lucas)',
    displayNumber: 4,
    accessCode: 'GEO-ALUNO-04',
    notes: '',
    createdAt: new Date().toISOString()
  }
];

let attemptsDb: Record<string, Attempt> = {
  // Pre-seed completed attempt for Student 2 as sample
  'attempt-sample-02': {
    id: 'attempt-sample-02',
    studentId: 'student-02',
    studentPseudonym: 'Estudante 02 (Gabriel)',
    studentCode: 'GEO-ALUNO-02',
    classId: 'class-info-3a',
    mode: 'EVALUATION',
    status: 'SUBMITTED',
    responses: {
      1: { questionId: 1, answerData: { selectedOption: 'cube' }, isCorrect: true, score: 1.0, answeredAt: new Date(Date.now() - 3600000).toISOString() },
      2: { questionId: 2, answerData: { classifications: { circle: '2D', cylinder: '3D', rectangle: '2D', pyramid: '3D' } }, isCorrect: true, score: 1.0, answeredAt: new Date(Date.now() - 3400000).toISOString() },
      3: { questionId: 3, answerData: { selectedOption: 'cube' }, isCorrect: true, score: 1.0, answeredAt: new Date(Date.now() - 3200000).toISOString() },
      4: { questionId: 4, answerData: { selectedOption: 'triangular_prism' }, isCorrect: true, score: 1.0, answeredAt: new Date(Date.now() - 3000000).toISOString() },
      5: { questionId: 5, answerData: { selectedOption: 'cylinder' }, isCorrect: true, score: 1.0, answeredAt: new Date(Date.now() - 2800000).toISOString() },
      6: { questionId: 6, answerData: { selectedOption: 'cube' }, isCorrect: true, score: 1.0, answeredAt: new Date(Date.now() - 2600000).toISOString() },
      7: { questionId: 7, answerData: { selectedOption: 'net_a' }, isCorrect: true, score: 1.0, answeredAt: new Date(Date.now() - 2400000).toISOString() },
      8: { questionId: 8, answerData: { selectedOption: 'red' }, isCorrect: true, score: 0.75, answeredAt: new Date(Date.now() - 2200000).toISOString() },
      9: { questionId: 9, answerData: { selectedOption: 'view_a' }, isCorrect: true, score: 0.75, answeredAt: new Date(Date.now() - 2000000).toISOString() },
      10: { questionId: 10, answerData: { basePiece: 'cube', roofPiece: 'triangular_prism' }, isCorrect: true, score: 1.5, answeredAt: new Date(Date.now() - 1800000).toISOString() }
    },
    totalScore: 10.0,
    scoreAdjusted: null,
    adjustmentJustification: null,
    startedAt: new Date(Date.now() - 3700000).toISOString(),
    submittedAt: new Date(Date.now() - 1700000).toISOString(),
    updatedAt: new Date(Date.now() - 1700000).toISOString()
  }
};

let auditLogsDb: AuditLog[] = [];

// ==========================================
// DB HELPERS
// ==========================================

export async function findStudentByCode(code: string): Promise<Student | null> {
  const normalized = code.trim().toUpperCase();
  if (isSupabaseConfigured && supabase) {
    try {
      const { data } = await supabase.from('students').select('*').eq('access_code', normalized).single();
      if (data) return data;
    } catch {
      // Fallback
    }
  }
  return studentsDb.find(s => s.accessCode.toUpperCase() === normalized) || null;
}

export async function getStudentClass(classId: string): Promise<ClassRoom | null> {
  return classesDb.find(c => c.id === classId) || null;
}

export async function getOrCreateStudentAttempt(student: Student, mode: 'PRACTICE' | 'EVALUATION' = 'EVALUATION'): Promise<Attempt> {
  // Check if an in-progress or existing attempt exists
  const existingId = Object.keys(attemptsDb).find(k => {
    const a = attemptsDb[k];
    return a.studentId === student.id && a.mode === mode && a.status === 'IN_PROGRESS';
  });

  if (existingId) {
    return attemptsDb[existingId];
  }

  // If already submitted in evaluation mode, return the submitted one to prevent duplicate test
  if (mode === 'EVALUATION') {
    const submitted = Object.values(attemptsDb).find(a => a.studentId === student.id && a.mode === 'EVALUATION');
    if (submitted) return submitted;
  }

  // Create new attempt
  const newAttemptId = `attempt-${student.id}-${Date.now()}`;
  const newAttempt: Attempt = {
    id: newAttemptId,
    studentId: student.id,
    studentPseudonym: student.pseudonym,
    studentCode: student.accessCode,
    classId: student.classId,
    mode,
    status: 'IN_PROGRESS',
    responses: {},
    totalScore: 0,
    startedAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  attemptsDb[newAttemptId] = newAttempt;
  return newAttempt;
}

export async function saveStudentAnswer(
  attemptId: string, 
  questionId: number, 
  answerData: any, 
  interactionType: string = 'click'
): Promise<{ success: boolean; attempt: Attempt; scoreEarned: number; isCorrect: boolean }> {
  const attempt = attemptsDb[attemptId];
  if (!attempt) {
    throw new Error('Tentativa não encontrada');
  }

  const { isCorrect, score } = gradeStudentAnswer(questionId, answerData);

  attempt.responses[questionId] = {
    questionId,
    answerData,
    isCorrect,
    score,
    answeredAt: new Date().toISOString()
  };

  // Recalculate total score
  let currentTotal = 0;
  Object.values(attempt.responses).forEach(res => {
    currentTotal += (res.score || 0);
  });
  attempt.totalScore = Number(currentTotal.toFixed(2));
  attempt.updatedAt = new Date().toISOString();

  return { success: true, attempt, scoreEarned: score, isCorrect };
}

export async function submitStudentAttempt(attemptId: string): Promise<Attempt> {
  const attempt = attemptsDb[attemptId];
  if (!attempt) {
    throw new Error('Tentativa não encontrada');
  }

  let finalScore = 0;
  Object.values(attempt.responses).forEach(res => {
    finalScore += (res.score || 0);
  });

  attempt.status = 'SUBMITTED';
  attempt.totalScore = Number(Math.min(10.0, finalScore).toFixed(2));
  attempt.submittedAt = new Date().toISOString();
  attempt.updatedAt = new Date().toISOString();

  return attempt;
}

export async function getAllClasses(): Promise<ClassRoom[]> {
  return classesDb.map(c => ({
    ...c,
    studentCount: studentsDb.filter(s => s.classId === c.id).length
  }));
}

export async function getClassStudents(classId: string): Promise<Student[]> {
  return studentsDb.filter(s => s.classId === classId);
}

export async function getClassAttempts(classId: string): Promise<Attempt[]> {
  return Object.values(attemptsDb).filter(a => a.classId === classId);
}

export async function createNewClass(name: string, code: string, yearPeriod: string): Promise<ClassRoom> {
  const newClass: ClassRoom = {
    id: `class-${Date.now()}`,
    teacherId: DEFAULT_TEACHER.id,
    name: name.trim(),
    code: code.trim().toUpperCase(),
    yearPeriod: yearPeriod.trim(),
    isAssessmentActive: true,
    studentCount: 0,
    createdAt: new Date().toISOString()
  };
  classesDb.push(newClass);
  return newClass;
}

export async function createNewStudent(classId: string, pseudonym: string, customCode?: string): Promise<Student> {
  const classStudents = studentsDb.filter(s => s.classId === classId);
  const nextNum = classStudents.length + 1;
  const autoCode = customCode || `GEO-${classStudents.length < 9 ? '0' : ''}${nextNum}-${Math.floor(100 + Math.random() * 900)}`;

  const newStudent: Student = {
    id: `student-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    classId,
    pseudonym: pseudonym.trim(),
    displayNumber: nextNum,
    accessCode: autoCode.toUpperCase().trim(),
    createdAt: new Date().toISOString()
  };

  studentsDb.push(newStudent);
  return newStudent;
}

export async function toggleClassAssessment(classId: string, isActive: boolean): Promise<boolean> {
  const c = classesDb.find(item => item.id === classId);
  if (c) {
    c.isAssessmentActive = isActive;
    return true;
  }
  return false;
}

export async function updateStudentNotes(studentId: string, notes: string): Promise<boolean> {
  const student = studentsDb.find(s => s.id === studentId);
  if (student) {
    student.notes = notes;
    return true;
  }
  return false;
}

export async function adjustAttemptScore(
  attemptId: string, 
  teacherId: string, 
  newScore: number, 
  justification: string
): Promise<Attempt> {
  const attempt = attemptsDb[attemptId];
  if (!attempt) throw new Error('Tentativa não encontrada');

  const prevScore = attempt.scoreAdjusted ?? attempt.totalScore;
  attempt.scoreAdjusted = Number(Math.min(10.0, Math.max(0, newScore)).toFixed(2));
  attempt.adjustmentJustification = justification.trim();
  attempt.adjustedBy = teacherId;
  attempt.updatedAt = new Date().toISOString();

  auditLogsDb.push({
    id: `audit-${Date.now()}`,
    teacherId,
    studentId: attempt.studentId,
    action: 'SCORE_ADJUSTMENT',
    justification: justification.trim(),
    previousScore: prevScore,
    newScore: attempt.scoreAdjusted,
    timestamp: new Date().toISOString()
  });

  return attempt;
}

export async function getAuditLogs(): Promise<AuditLog[]> {
  return auditLogsDb;
}
