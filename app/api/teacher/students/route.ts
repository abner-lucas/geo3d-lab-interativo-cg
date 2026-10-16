import { NextRequest, NextResponse } from 'next/server';
import { getClassStudents, getClassAttempts, createNewStudent, updateStudent, deleteStudent } from '@/lib/db';

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
    const { classId, pseudonym, customCode } = await req.json();

    if (!classId || !pseudonym) {
      return NextResponse.json({ error: 'classId e pseudonym são obrigatórios' }, { status: 400 });
    }

    const student = await createNewStudent(classId, pseudonym, customCode);
    return NextResponse.json({ success: true, student });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const { studentId, pseudonym, accessCode, displayNumber, notes } = body;

    if (!studentId) {
      return NextResponse.json({ error: 'studentId é obrigatório' }, { status: 400 });
    }

    const updated = await updateStudent(studentId, {
      pseudonym,
      accessCode,
      displayNumber,
      notes
    });

    return NextResponse.json({ success: true, student: updated });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    let studentId = searchParams.get('studentId');

    if (!studentId) {
      try {
        const body = await req.json();
        studentId = body?.studentId;
      } catch {}
    }

    if (!studentId) {
      return NextResponse.json({ error: 'studentId é obrigatório' }, { status: 400 });
    }

    await deleteStudent(studentId);
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

