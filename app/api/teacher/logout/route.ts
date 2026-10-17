import { NextResponse } from 'next/server';
import { clearTeacherSessionCookie } from '@/lib/serverAuth';

export async function POST() {
  const response = NextResponse.json({ success: true });
  clearTeacherSessionCookie(response);
  return response;
}
