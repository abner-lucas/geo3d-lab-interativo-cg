import { NextRequest, NextResponse } from 'next/server';
import { toggleClassAssessment } from '@/lib/db';

export async function POST(req: NextRequest) {
  try {
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
