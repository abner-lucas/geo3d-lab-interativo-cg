import { NextRequest, NextResponse } from 'next/server';
import { updateStudentNotes } from '@/lib/db';

export async function POST(req: NextRequest) {
  try {
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
