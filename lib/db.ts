import { supabase, isSupabaseConfigured } from './supabase';
import { Student, ClassRoom, Attempt, AuditLog, TeacherUser } from '@/types/geo3d';
import { gradeStudentAnswer, QUESTIONS } from './questions';

// ==========================================
// FALLBACK IN-MEMORY SEEDS (Usado se Supabase não configurado)
// ==========================================

export const DEFAULT_TEACHER: TeacherUser = {
  id: '10000000-0000-0000-0000-000000000001',
  name: 'Prof. Marcos Rocha',
  email: 'prof@geo3d.edu.br',
  role: 'teacher'
};

const DEFAULT_CLASS: ClassRoom = {
  id: '20000000-0000-0000-0000-000000000001',
  teacherId: '10000000-0000-0000-0000-000000000001',
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
    id: '30000000-0000-0000-0000-000000000001',
    classId: '20000000-0000-0000-0000-000000000001',
    pseudonym: 'Estudante 01 (Luiza)',
    displayNumber: 1,
    accessCode: 'GEO-ALUNA-01',
    notes: 'Estudante com preferência por instruções visuais diretas e animações de dobradura.',
    createdAt: new Date().toISOString()
  },
  {
    id: '30000000-0000-0000-0000-000000000002',
    classId: '20000000-0000-0000-0000-000000000001',
    pseudonym: 'Estudante 02 (Gabriel)',
    displayNumber: 2,
    accessCode: 'GEO-ALUNO-02',
    notes: 'Boa percepção espacial, explorou os sólidos no laboratório prévio.',
    createdAt: new Date().toISOString()
  },
  {
    id: '30000000-0000-0000-0000-000000000003',
    classId: '20000000-0000-0000-0000-000000000001',
    pseudonym: 'Estudante 03 (Sofia)',
    displayNumber: 3,
    accessCode: 'GEO-ALUNA-03',
    notes: '',
    createdAt: new Date().toISOString()
  },
  {
    id: '30000000-0000-0000-0000-000000000004',
    classId: '20000000-0000-0000-0000-000000000001',
    pseudonym: 'Estudante 04 (Lucas)',
    displayNumber: 4,
    accessCode: 'GEO-ALUNO-04',
    notes: '',
    createdAt: new Date().toISOString()
  }
];

let attemptsDb: Record<string, Attempt> = {};
let auditLogsDb: AuditLog[] = [];

// ==========================================
// HELPERS DE CONVERSÃO DB <-> APP
// ==========================================

function mapStudentFromDb(s: any): Student {
  return {
    id: s.id,
    classId: s.class_id,
    pseudonym: s.pseudonym,
    displayNumber: s.display_number,
    accessCode: s.access_code,
    notes: s.notes || '',
    createdAt: s.created_at
  };
}

function mapClassFromDb(c: any): ClassRoom {
  return {
    id: c.id,
    teacherId: c.teacher_id,
    code: c.code,
    name: c.name,
    yearPeriod: c.year_period,
    isAssessmentActive: c.is_assessment_active,
    createdAt: c.created_at
  };
}

function mapAttemptFromDb(a: any, studentPseudonym?: string, studentCode?: string, classId?: string): Attempt {
  const responsesRecord: Record<number, any> = {};
  if (Array.isArray(a.responses)) {
    a.responses.forEach((r: any) => {
      responsesRecord[r.question_id] = {
        questionId: r.question_id,
        answerData: r.answer_data,
        isCorrect: r.is_correct,
        score: Number(r.score),
        answeredAt: r.answered_at
      };
    });
  }

  return {
    id: a.id,
    studentId: a.student_id,
    studentPseudonym: studentPseudonym || a.students?.pseudonym || '',
    studentCode: studentCode || a.students?.access_code || '',
    classId: classId || a.students?.class_id || '',
    mode: a.mode,
    status: a.status,
    responses: responsesRecord,
    totalScore: Number(a.total_score || 0),
    scoreAdjusted: a.score_adjusted !== null && a.score_adjusted !== undefined ? Number(a.score_adjusted) : null,
    adjustmentJustification: a.adjustment_justification || null,
    adjustedBy: a.adjusted_by || null,
    startedAt: a.started_at,
    submittedAt: a.submitted_at || null,
    updatedAt: a.updated_at
  };
}

// ==========================================
// OPERAÇÕES DO BANCO DE DADOS
// ==========================================

export async function findStudentByCode(code: string): Promise<Student | null> {
  const normalized = code.trim().toUpperCase();
  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase
        .from('students')
        .select('*')
        .eq('access_code', normalized)
        .single();
      if (!error && data) {
        return mapStudentFromDb(data);
      }
    } catch {
      // Fallback
    }
  }
  return studentsDb.find(s => s.accessCode.toUpperCase() === normalized) || null;
}

export async function getStudentClass(classId: string): Promise<ClassRoom | null> {
  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase
        .from('classes')
        .select('*')
        .eq('id', classId)
        .single();
      if (!error && data) {
        return mapClassFromDb(data);
      }
    } catch {
      // Fallback
    }
  }
  return classesDb.find(c => c.id === classId) || null;
}

export async function getOrCreateStudentAttempt(
  student: Student, 
  mode: 'PRACTICE' | 'EVALUATION' = 'EVALUATION'
): Promise<Attempt> {
  if (isSupabaseConfigured && supabase) {
    try {
      // 1. Verificar tentativa existente em andamento
      const { data: existingAttempts } = await supabase
        .from('attempts')
        .select('*, responses(*)')
        .eq('student_id', student.id)
        .eq('mode', mode)
        .order('started_at', { ascending: false });

      if (existingAttempts && existingAttempts.length > 0) {
        // Se já tiver uma em progresso, retorne-a
        const inProgress = existingAttempts.find(a => a.status === 'IN_PROGRESS');
        if (inProgress) {
          const mapped = mapAttemptFromDb(inProgress, student.pseudonym, student.accessCode, student.classId);
          attemptsDb[mapped.id] = mapped;
          return mapped;
        }

        // Se estiver em modo oficial e já submeteu, impede refazer retornando a submetida
        if (mode === 'EVALUATION') {
          const submitted = existingAttempts.find(a => a.status === 'SUBMITTED' || a.status === 'REVIEWED');
          if (submitted) {
            const mapped = mapAttemptFromDb(submitted, student.pseudonym, student.accessCode, student.classId);
            attemptsDb[mapped.id] = mapped;
            return mapped;
          }
        }
      }

      // 2. Buscar id da avaliação ativa
      const { data: assessment } = await supabase
        .from('assessments')
        .select('id')
        .eq('is_active', true)
        .limit(1)
        .single();

      const assessmentId = assessment?.id || 'a0000000-0000-0000-0000-000000000001';

      // 3. Criar nova tentativa no Supabase
      const { data: newAttempt, error: insertErr } = await supabase
        .from('attempts')
        .insert({
          student_id: student.id,
          assessment_id: assessmentId,
          mode,
          status: 'IN_PROGRESS',
          total_score: 0.0
        })
        .select('*, responses(*)')
        .single();

      if (!insertErr && newAttempt) {
        const mapped = mapAttemptFromDb(newAttempt, student.pseudonym, student.accessCode, student.classId);
        attemptsDb[mapped.id] = mapped;
        return mapped;
      }
    } catch {
      // Fallback to in-memory
    }
  }

  // Fallback in-memory
  const existingId = Object.keys(attemptsDb).find(k => {
    const a = attemptsDb[k];
    return a.studentId === student.id && a.mode === mode && a.status === 'IN_PROGRESS';
  });

  if (existingId) return attemptsDb[existingId];

  if (mode === 'EVALUATION') {
    const submitted = Object.values(attemptsDb).find(a => a.studentId === student.id && a.mode === 'EVALUATION');
    if (submitted) return submitted;
  }

  const newAttemptId = `attempt-${student.id}-${Date.now()}`;
  const localAttempt: Attempt = {
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

  attemptsDb[newAttemptId] = localAttempt;
  return localAttempt;
}

export async function saveStudentAnswer(
  attemptId: string, 
  questionId: number, 
  answerData: any, 
  interactionType: string = 'click'
): Promise<{ success: boolean; attempt: Attempt; scoreEarned: number; isCorrect: boolean }> {
  const { isCorrect, score } = gradeStudentAnswer(questionId, answerData);
  const qDef = QUESTIONS.find(q => q.id === questionId);
  const blockId = qDef?.block || 'BLOCK_1_RECOGNITION';
  const pointsPossible = qDef?.points || 1.0;

  if (isSupabaseConfigured && supabase) {
    try {
      // 1. Upsert da resposta na tabela responses
      await supabase
        .from('responses')
        .upsert({
          attempt_id: attemptId,
          question_id: questionId,
          block_id: blockId,
          answer_data: answerData,
          is_correct: isCorrect,
          score,
          points_possible: pointsPossible,
          interaction_type: interactionType,
          answered_at: new Date().toISOString()
        }, { onConflict: 'attempt_id,question_id' });

      // 2. Recalcular total score no Supabase
      const { data: allResponses } = await supabase
        .from('responses')
        .select('score')
        .eq('attempt_id', attemptId);

      let totalScore = 0;
      if (allResponses) {
        allResponses.forEach((r: any) => { totalScore += Number(r.score || 0); });
      }
      totalScore = Number(totalScore.toFixed(2));

      await supabase
        .from('attempts')
        .update({
          total_score: totalScore,
          updated_at: new Date().toISOString()
        })
        .eq('id', attemptId);

      // 3. Buscar tentativa atualizada
      const { data: updatedAttempt } = await supabase
        .from('attempts')
        .select('*, responses(*), students(pseudonym, access_code, class_id)')
        .eq('id', attemptId)
        .single();

      if (updatedAttempt) {
        const mapped = mapAttemptFromDb(
          updatedAttempt, 
          updatedAttempt.students?.pseudonym, 
          updatedAttempt.students?.access_code, 
          updatedAttempt.students?.class_id
        );
        attemptsDb[attemptId] = mapped;
        return { success: true, attempt: mapped, scoreEarned: score, isCorrect };
      }
    } catch {
      // Fallback
    }
  }

  // Fallback in-memory
  const attempt = attemptsDb[attemptId];
  if (!attempt) throw new Error('Tentativa não encontrada');

  attempt.responses[questionId] = {
    questionId,
    answerData,
    isCorrect,
    score,
    answeredAt: new Date().toISOString()
  };

  let currentTotal = 0;
  Object.values(attempt.responses).forEach(res => {
    currentTotal += (res.score || 0);
  });
  attempt.totalScore = Number(currentTotal.toFixed(2));
  attempt.updatedAt = new Date().toISOString();

  return { success: true, attempt, scoreEarned: score, isCorrect };
}

export async function submitStudentAttempt(attemptId: string): Promise<Attempt> {
  if (isSupabaseConfigured && supabase) {
    try {
      const { data: allResponses } = await supabase
        .from('responses')
        .select('score')
        .eq('attempt_id', attemptId);

      let finalScore = 0;
      if (allResponses) {
        allResponses.forEach((r: any) => { finalScore += Number(r.score || 0); });
      }
      finalScore = Number(Math.min(10.0, finalScore).toFixed(2));

      const now = new Date().toISOString();
      const { data: updated, error } = await supabase
        .from('attempts')
        .update({
          status: 'SUBMITTED',
          total_score: finalScore,
          submitted_at: now,
          updated_at: now
        })
        .eq('id', attemptId)
        .select('*, responses(*), students(pseudonym, access_code, class_id)')
        .single();

      if (!error && updated) {
        const mapped = mapAttemptFromDb(
          updated, 
          updated.students?.pseudonym, 
          updated.students?.access_code, 
          updated.students?.class_id
        );
        attemptsDb[attemptId] = mapped;
        return mapped;
      }
    } catch {
      // Fallback
    }
  }

  // Fallback in-memory
  const attempt = attemptsDb[attemptId];
  if (!attempt) throw new Error('Tentativa não encontrada');

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
  if (isSupabaseConfigured && supabase) {
    try {
      const { data: classesData, error: classErr } = await supabase
        .from('classes')
        .select('*, students(count)');

      if (!classErr && classesData) {
        return classesData.map((c: any) => ({
          ...mapClassFromDb(c),
          studentCount: c.students?.[0]?.count ?? 0
        }));
      }
    } catch {
      // Fallback
    }
  }

  return classesDb.map(c => ({
    ...c,
    studentCount: studentsDb.filter(s => s.classId === c.id).length
  }));
}

export async function getClassStudents(classId: string): Promise<Student[]> {
  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase
        .from('students')
        .select('*')
        .eq('class_id', classId)
        .order('display_number', { ascending: true });

      if (!error && data) {
        return data.map(mapStudentFromDb);
      }
    } catch {
      // Fallback
    }
  }

  return studentsDb.filter(s => s.classId === classId);
}

export async function getClassAttempts(classId: string): Promise<Attempt[]> {
  if (isSupabaseConfigured && supabase) {
    try {
      // Busca estudantes da turma
      const { data: students } = await supabase
        .from('students')
        .select('id, pseudonym, access_code, class_id')
        .eq('class_id', classId);

      if (students && students.length > 0) {
        const studentIds = students.map(s => s.id);
        const { data: attemptsData } = await supabase
          .from('attempts')
          .select('*, responses(*)')
          .in('student_id', studentIds);

        if (attemptsData) {
          const studentMap = new Map(students.map(s => [s.id, s]));
          return attemptsData.map(a => {
            const st = studentMap.get(a.student_id);
            return mapAttemptFromDb(a, st?.pseudonym, st?.access_code, classId);
          });
        }
      }
    } catch {
      // Fallback
    }
  }

  return Object.values(attemptsDb).filter(a => a.classId === classId);
}

export async function createNewClass(name: string, code: string, yearPeriod: string): Promise<ClassRoom> {
  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase
        .from('classes')
        .insert({
          teacher_id: DEFAULT_TEACHER.id,
          name: name.trim(),
          code: code.trim().toUpperCase(),
          year_period: yearPeriod.trim(),
          is_assessment_active: true
        })
        .select()
        .single();

      if (!error && data) {
        const mapped = mapClassFromDb(data);
        classesDb.push(mapped);
        return mapped;
      }
    } catch {
      // Fallback
    }
  }

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
  const classStudents = await getClassStudents(classId);
  const nextNum = classStudents.length + 1;
  const autoCode = customCode || `GEO-${classStudents.length < 9 ? '0' : ''}${nextNum}-${Math.floor(100 + Math.random() * 900)}`;
  const finalCode = autoCode.toUpperCase().trim();

  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase
        .from('students')
        .insert({
          class_id: classId,
          pseudonym: pseudonym.trim(),
          display_number: nextNum,
          access_code: finalCode,
          notes: ''
        })
        .select()
        .single();

      if (!error && data) {
        const mapped = mapStudentFromDb(data);
        studentsDb.push(mapped);
        return mapped;
      }
    } catch {
      // Fallback
    }
  }

  const newStudent: Student = {
    id: `student-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    classId,
    pseudonym: pseudonym.trim(),
    displayNumber: nextNum,
    accessCode: finalCode,
    createdAt: new Date().toISOString()
  };

  studentsDb.push(newStudent);
  return newStudent;
}

export async function toggleClassAssessment(classId: string, isActive: boolean): Promise<boolean> {
  if (isSupabaseConfigured && supabase) {
    try {
      const { error } = await supabase
        .from('classes')
        .update({ is_assessment_active: isActive })
        .eq('id', classId);
      if (!error) return true;
    } catch {
      // Fallback
    }
  }

  const c = classesDb.find(item => item.id === classId);
  if (c) {
    c.isAssessmentActive = isActive;
    return true;
  }
  return false;
}

export async function updateStudentNotes(studentId: string, notes: string): Promise<boolean> {
  if (isSupabaseConfigured && supabase) {
    try {
      const { error } = await supabase
        .from('students')
        .update({ notes: notes || '' })
        .eq('id', studentId);
      if (!error) return true;
    } catch {
      // Fallback
    }
  }

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
  const rounded = Number(Math.min(10.0, Math.max(0, newScore)).toFixed(2));
  const just = justification.trim();
  const now = new Date().toISOString();

  if (isSupabaseConfigured && supabase) {
    try {
      // 1. Obter score anterior e studentId
      const { data: cur } = await supabase
        .from('attempts')
        .select('student_id, total_score, score_adjusted')
        .eq('id', attemptId)
        .single();

      const prevScore = cur?.score_adjusted ?? cur?.total_score ?? 0;
      const studentId = cur?.student_id;

      // 2. Atualizar tentativa
      const { data: updated } = await supabase
        .from('attempts')
        .update({
          score_adjusted: rounded,
          adjustment_justification: just,
          adjusted_by: teacherId,
          updated_at: now
        })
        .eq('id', attemptId)
        .select('*, responses(*), students(pseudonym, access_code, class_id)')
        .single();

      // 3. Registrar auditoria
      if (studentId) {
        await supabase.from('audit_logs').insert({
          teacher_id: teacherId,
          student_id: studentId,
          action: 'SCORE_ADJUSTMENT',
          justification: just,
          previous_score: prevScore,
          new_score: rounded,
          created_at: now
        });
      }

      if (updated) {
        const mapped = mapAttemptFromDb(
          updated, 
          updated.students?.pseudonym, 
          updated.students?.access_code, 
          updated.students?.class_id
        );
        attemptsDb[attemptId] = mapped;
        return mapped;
      }
    } catch {
      // Fallback
    }
  }

  // Fallback in-memory
  const attempt = attemptsDb[attemptId];
  if (!attempt) throw new Error('Tentativa não encontrada');

  const prevScore = attempt.scoreAdjusted ?? attempt.totalScore;
  attempt.scoreAdjusted = rounded;
  attempt.adjustmentJustification = just;
  attempt.adjustedBy = teacherId;
  attempt.updatedAt = now;

  auditLogsDb.push({
    id: `audit-${Date.now()}`,
    teacherId,
    studentId: attempt.studentId,
    action: 'SCORE_ADJUSTMENT',
    justification: just,
    previousScore: prevScore,
    newScore: attempt.scoreAdjusted,
    timestamp: now
  });

  return attempt;
}

export async function getAuditLogs(): Promise<AuditLog[]> {
  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase
        .from('audit_logs')
        .select('*')
        .order('created_at', { ascending: false });

      if (!error && data) {
        return data.map((d: any) => ({
          id: d.id,
          teacherId: d.teacher_id,
          studentId: d.student_id,
          action: d.action,
          justification: d.justification,
          previousScore: Number(d.previous_score),
          newScore: Number(d.new_score),
          timestamp: d.created_at
        }));
      }
    } catch {
      // Fallback
    }
  }

  return auditLogsDb;
}
