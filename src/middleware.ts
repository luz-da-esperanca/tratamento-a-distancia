import { getSupabaseEnv } from '@/src/shared/infrastructure/config/env';
import { updateSession } from '@/src/shared/infrastructure/database/supabase/middleware';
import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  const response = await updateSession(request);

  const env = getSupabaseEnv();
  const supabase = createServerClient(env.NEXT_PUBLIC_SUPABASE_URL, env.NEXT_PUBLIC_SUPABASE_ANON_KEY, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll() {
        /* Manipulação já feita no updateSession */
      },
    },
  });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const isAuthRoute = request.nextUrl.pathname === '/admin/login';
  const isAdminRoute = request.nextUrl.pathname.startsWith('/admin/painel') && !isAuthRoute;

  if (isAdminRoute && !user) {
    return NextResponse.redirect(new URL('/admin/login', request.url));
  }

  if (isAuthRoute && user) {
    return NextResponse.redirect(new URL('/admin/painel', request.url));
  }

  return response;
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
