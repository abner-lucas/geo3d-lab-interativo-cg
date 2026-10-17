import { NextRequest, NextResponse } from 'next/server';
import { findStudentByCode, getStudentClass, getOrCreateStudentAttempt } from '@/lib/db';

export async function POST(req: NextRequest) {
  try {
    const { accessCode, mode } = await req.json();

    if (!accessCode) {
      return NextResponse.json({ error: 'Código de acesso é obrigatório.' }, { status: 400 });
    }

    const student = await findStudentByCode(accessCode);
    if (!student) {
      return NextResponse.json({ error: 'Código de estudante não encontrado. Verifique com o professor.' }, { status: 404 });
    }

    const classRoom = await getStudentClass(student.classId);
    if (classRoom && !classRoom.isAssessmentActive && mode === 'EVALUATION') {
      return NextResponse.json({ 
        error: 'A avaliação oficial está temporariamente bloqueada pelo professor para esta turma. Você pode acessar o Modo Treino.' 
      }, { status: 403 });
    }

    const attempt = await getOrCreateStudentAttempt(student, mode || 'EVALUATION');

    // Sanitizar objeto do estudante para não vazar notas pedagógicas confidenciais do professor
    const sanitizedStudent = {
      id: student.id,
      classId: student.classId,
      pseudonym: student.pseudonym,
      displayNumber: student.displayNumber,
      accessCode: student.accessCode
    };

    return NextResponse.json({
      success: true,
      student: sanitizedStudent,
      attempt,
      classRoom: classRoom ? {
        id: classRoom.id,
        name: classRoom.name,
        code: classRoom.code,
        yearPeriod: classRoom.yearPeriod,
        isAssessmentActive: classRoom.isAssessmentActive
      } : null
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Erro ao processar login' }, { status: 500 });
  }
}
