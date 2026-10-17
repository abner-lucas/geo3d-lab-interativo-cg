import { NextRequest, NextResponse } from 'next/server';
import { updateStudentNotes } from '@/lib/db';
import { verifyTeacherSession } from '@/lib/serverAuth';

export async function POST(req: NextRequest) {
  try {
    if (!verifyTeacherSession(req)) {
      return NextResponse.json({ error: 'Acesso docente não autorizado' }, { status: 401 });
    }

    const { studentId, notes } = await req.json();
    if (!studentId) {
      return NextResponse.json({ error: 'studentId obrigatório' }, { status: 400 });
    }
    const success = await updateStudentNotes(studentId, notes || '');
    return NextResponse.json({ success });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
