import { createServerClient } from '@supabase/ssr';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(req: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request: req,
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return req.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => req.cookies.set(name, value));
          supabaseResponse = NextResponse.next({
            request: req,
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Rotas públicas
  const rotasPublicas = ['/login', '/pricing'];
  const rotaAtual = req.nextUrl.pathname;

  if (!user && !rotasPublicas.includes(rotaAtual)) {
    const redirectUrl = NextResponse.redirect(new URL('/login', req.url));
    supabaseResponse.cookies.getAll().forEach(cookie => {
      redirectUrl.cookies.set(cookie.name, cookie.value, cookie);
    });
    return redirectUrl;
  }

  if (user && rotaAtual === '/login') {
    const redirectUrl = NextResponse.redirect(new URL('/', req.url));
    supabaseResponse.cookies.getAll().forEach(cookie => {
      redirectUrl.cookies.set(cookie.name, cookie.value, cookie);
    });
    return redirectUrl;
  }

  return supabaseResponse;
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico|icon.svg).*)'],
};