import { NextRequest, NextResponse } from 'next/server';
import { 
  validateTeacherPasscode, 
  createTeacherToken, 
  setTeacherSessionCookie,
  verifyTeacherSession 
} from '@/lib/serverAuth';
import { DEFAULT_TEACHER } from '@/lib/db';

export async function POST(req: NextRequest) {
  try {
    const { passcode } = await req.json();

    if (!passcode) {
      return NextResponse.json(
        { error: 'Senha de acesso docente é obrigatória.' },
        { status: 400 }
      );
    }

    const isValid = validateTeacherPasscode(passcode);
    if (!isValid) {
      return NextResponse.json(
        { error: 'Código de acesso docente inválido.' },
        { status: 401 }
      );
    }

    const token = createTeacherToken();
    const response = NextResponse.json({
      success: true,
      teacher: DEFAULT_TEACHER
    });

    setTeacherSessionCookie(response, token);
    return response;
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Erro interno ao autenticar docente.' },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  const isAuthenticated = verifyTeacherSession(req);
  return NextResponse.json({
    authenticated: isAuthenticated,
    teacher: isAuthenticated ? DEFAULT_TEACHER : null
  });
}
