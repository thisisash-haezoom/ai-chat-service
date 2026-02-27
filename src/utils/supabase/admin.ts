import { createClient } from '@supabase/supabase-js'

/**
 * Supabase Admin 클라이언트
 * Service Role Key를 사용하여 RLS를 우회하고 관리 작업 수행
 * ⚠️ 환경 변수에서만 로드되어야 함 (클라이언트에서는 절대 사용 금지)
 */
export async function createAdminClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error('Missing Supabase environment variables')
  }

  return createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      persistSession: false,
    },
  })
}
