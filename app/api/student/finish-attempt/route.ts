import { NextRequest, NextResponse } from 'next/server';
import { submitStudentAttempt } from '@/lib/db';

export async function POST(req: NextRequest) {
  try {
    const { attemptId } = await req.json();

    if (!attemptId) {
      return NextResponse.json({ error: 'ID da tentativa obrigatório' }, { status: 400 });
    }

    const attempt = await submitStudentAttempt(attemptId);

    return NextResponse.json({
      success: true,
      attempt
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Erro ao finalizar tentativa' }, { status: 500 });
  }
}
