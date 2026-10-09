import { NextRequest, NextResponse } from 'next/server';
import { getClassStudents, getClassAttempts, createNewStudent } from '@/lib/db';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const classId = searchParams.get('classId');

    if (!classId) {
      return NextResponse.json({ error: 'classId obrigatório' }, { status: 400 });
    }

    const students = await getClassStudents(classId);
    const attempts = await getClassAttempts(classId);

    return NextResponse.json({ students, attempts });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { classId, pseudonym } = await req.json();

    if (!classId || !pseudonym) {
      return NextResponse.json({ error: 'classId e pseudonym são obrigatórios' }, { status: 400 });
    }

    const student = await createNewStudent(classId, pseudonym);
    return NextResponse.json({ success: true, student });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
