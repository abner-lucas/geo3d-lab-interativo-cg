import crypto from 'crypto';
import { NextRequest, NextResponse } from 'next/server';

const SECRET = process.env.SESSION_SECRET || 'geo3d-teacher-secret-key-2026';

// Senhas aceitas para autenticação docente no servidor
const TEACHER_PASSCODES = process.env.TEACHER_PASSCODE
  ? process.env.TEACHER_PASSCODE.split(',').map(p => p.trim())
  : ['PROF-2026', 'geo3d', '123456'];

export const TEACHER_COOKIE_NAME = 'teacher_session';

/**
 * Valida a senha do professor exclusivamente no servidor.
 */
export function validateTeacherPasscode(passcode: string): boolean {
  if (!passcode) return false;
  const clean = passcode.trim();
  return TEACHER_PASSCODES.includes(clean);
}

/**
 * Gera um token assinado com timestamp e HMAC-SHA256 para a sessão docente.
 */
export function createTeacherToken(): string {
  const timestamp = Date.now().toString();
  const hmac = crypto.createHmac('sha256', SECRET).update(`teacher:${timestamp}`).digest('hex');
  return `${timestamp}.${hmac}`;
}

/**
 * Verifica a validade e integridade do token assinado.
 */
export function verifyTeacherToken(token: string | null | undefined): boolean {
  if (!token) return false;
  const parts = token.split('.');
  if (parts.length !== 2) return false;

  const [timestamp, hmac] = parts;
  const ts = parseInt(timestamp, 10);
  if (isNaN(ts)) return false;

  // Validade de 24 horas
  if (Date.now() - ts > 24 * 60 * 60 * 1000) {
    return false;
  }

  try {
    const expectedHmac = crypto.createHmac('sha256', SECRET).update(`teacher:${timestamp}`).digest('hex');
    const hmacBuf = Buffer.from(hmac);
    const expectedBuf = Buffer.from(expectedHmac);
    if (hmacBuf.length !== expectedBuf.length) return false;
    return crypto.timingSafeEqual(hmacBuf, expectedBuf);
  } catch {
    return false;
  }
}

/**
 * Valida se a requisição atual possui sessão docente ativa (via cookie ou header Bearer).
 */
export function verifyTeacherSession(req: NextRequest): boolean {
  // 1. Verificar cookie HTTP-only
  const cookieToken = req.cookies.get(TEACHER_COOKIE_NAME)?.value;
  if (cookieToken && verifyTeacherToken(cookieToken)) {
    return true;
  }

  // 2. Verificar Authorization header
  const authHeader = req.headers.get('authorization');
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const headerToken = authHeader.substring(7).trim();
    if (verifyTeacherToken(headerToken)) {
      return true;
    }
  }

  return false;
}

/**
 * Injeta o cookie de sessão docente na resposta HTTP de forma segura.
 */
export function setTeacherSessionCookie(res: NextResponse, token: string): void {
  res.cookies.set({
    name: TEACHER_COOKIE_NAME,
    value: token,
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 24 * 60 * 60 // 24 horas
  });
}

/**
 * Remove o cookie de sessão docente ao encerrar a sessão.
 */
export function clearTeacherSessionCookie(res: NextResponse): void {
  res.cookies.set({
    name: TEACHER_COOKIE_NAME,
    value: '',
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 0
  });
}
