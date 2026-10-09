import { NextRequest, NextResponse } from 'next/server';
import { saveStudentAnswer } from '@/lib/db';

export async function POST(req: NextRequest) {
  try {
    const { attemptId, questionId, answerData, interactionType } = await req.json();

    if (!attemptId || questionId === undefined) {
      return NextResponse.json({ error: 'Parâmetros inválidos' }, { status: 400 });
    }

    const result = await saveStudentAnswer(attemptId, Number(questionId), answerData, interactionType || 'click');

    return NextResponse.json({
      success: true,
      attempt: result.attempt,
      scoreEarned: result.scoreEarned
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Erro ao salvar resposta' }, { status: 500 });
  }
}
