import { NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'
import { createAdminClient } from '@/utils/supabase/admin'

/**
 * OAuth 콜백 핸들러
 * Google/Github 로그인 후:
 * 1. 세션 생성
 * 2. 사용자를 users 테이블에 자동 생성/업데이트 (Admin client 사용)
 * 3. /dashboard로 리다이렉트
 */
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/dashboard'

  if (code) {
    const supabase = await createClient()

    // 1. OAuth 코드를 세션으로 교환
    const { error: authError } = await supabase.auth.exchangeCodeForSession(code)

    if (!authError) {
      // 2. 현재 로그인한 사용자 정보 가져오기
      const { data: { user } } = await supabase.auth.getUser()

      if (user) {
        // 3. Admin 클라이언트로 users 테이블에 저장 (RLS 우회)
        const adminClient = await createAdminClient()

        const userData = {
          id: user.id,
          email: user.email || '',
          name: user.user_metadata?.full_name || user.email?.split('@')[0] || 'User',
          avatar_url: user.user_metadata?.avatar_url || null,
          subscription_tier: 'FREE',
          credits: 0,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };

        console.log('Saving user data:', userData);

        const { error: dbError, data } = await adminClient
          .from('users')
          .upsert([userData], {
            onConflict: 'id',
          })
          .select();

        console.log('Upsert result:', { error: dbError, data });

        // 4. 리다이렉트 (DB 저장 성공 여부와 무관하게)
        const forwardedHost = request.headers.get('x-forwarded-host');
        const isLocalEnv = process.env.NODE_ENV === 'development';

        if (isLocalEnv) {
          return NextResponse.redirect(`${origin}${next}`);
        } else if (forwardedHost) {
          return NextResponse.redirect(`https://${forwardedHost}${next}`);
        } else {
          return NextResponse.redirect(`${origin}${next}`);
        }
      }
    }
  }

  // 인증 실패
  return NextResponse.redirect(`${origin}/login?error=auth_failed`)
}
