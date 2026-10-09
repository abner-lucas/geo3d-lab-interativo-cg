import { NextRequest, NextResponse } from 'next/server';
import { adjustAttemptScore, DEFAULT_TEACHER } from '@/lib/db';

export async function POST(req: NextRequest) {
  try {
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
