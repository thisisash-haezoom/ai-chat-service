import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

/**
 * POST /api/auth/logout
 * 사용자 로그아웃 핸들러
 */
export async function POST() {
  const supabase = await createClient();

  // Supabase 세션 삭제
  await supabase.auth.signOut();

  // 로그인 페이지로 리다이렉트
  return NextResponse.redirect(new URL('/login', process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'));
}
