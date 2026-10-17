import { NextRequest, NextResponse } from 'next/server';
import { toggleClassAssessment } from '@/lib/db';
import { verifyTeacherSession } from '@/lib/serverAuth';

export async function POST(req: NextRequest) {
  try {
    if (!verifyTeacherSession(req)) {
      return NextResponse.json({ error: 'Acesso docente não autorizado' }, { status: 401 });
    }

    const { classId, isActive } = await req.json();
    if (!classId || isActive === undefined) {
      return NextResponse.json({ error: 'Parâmetros inválidos' }, { status: 400 });
    }
    const success = await toggleClassAssessment(classId, Boolean(isActive));
    return NextResponse.json({ success });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
