import { NextRequest, NextResponse } from 'next/server';
import { adjustAttemptScore, DEFAULT_TEACHER } from '@/lib/db';
import { verifyTeacherSession } from '@/lib/serverAuth';

export async function POST(req: NextRequest) {
  try {
    if (!verifyTeacherSession(req)) {
      return NextResponse.json({ error: 'Acesso docente não autorizado' }, { status: 401 });
    }

    const { attemptId, newScore, justification } = await req.json();

    if (!attemptId || newScore === undefined || !justification) {
      return NextResponse.json({ error: 'Todos os campos de justificativa e nota são obrigatórios' }, { status: 400 });
    }

    const updated = await adjustAttemptScore(attemptId, DEFAULT_TEACHER.id, Number(newScore), justification);

    return NextResponse.json({ success: true, attempt: updated });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
