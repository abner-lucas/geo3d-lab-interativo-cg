import { NextRequest, NextResponse } from 'next/server';
import { getAllClasses, createNewClass } from '@/lib/db';
import { verifyTeacherSession } from '@/lib/serverAuth';

export async function GET(req: NextRequest) {
  try {
    if (!verifyTeacherSession(req)) {
      return NextResponse.json({ error: 'Acesso docente não autorizado' }, { status: 401 });
    }

    const classes = await getAllClasses();
    return NextResponse.json({ classes });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    if (!verifyTeacherSession(req)) {
      return NextResponse.json({ error: 'Acesso docente não autorizado' }, { status: 401 });
    }

    const { name, yearPeriod } = await req.json();
    if (!name) {
      return NextResponse.json({ error: 'Nome da turma obrigatório' }, { status: 400 });
    }
    const code = `TURMA-${Math.floor(100 + Math.random() * 900)}`;
    const newClass = await createNewClass(name, code, yearPeriod || '2026.1');
    return NextResponse.json({ success: true, class: newClass });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
