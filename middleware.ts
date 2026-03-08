import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { createServerClient, type CookieOptions } from '@supabase/ssr';

export const config = {
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - api (API routes)
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico, sitemap.xml, robots.txt (metadata files)
         */
        '/((?!api|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)',
    ],
};

export async function middleware(req: NextRequest) {
    let res = NextResponse.next({
        request: {
            headers: req.headers,
        },
    });

    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                get(name: string) {
                    return req.cookies.get(name)?.value;
                },
                set(name: string, value: string, options: CookieOptions) {
                    req.cookies.set({
                        name,
                        value,
                        ...options,
                    });
                    res = NextResponse.next({
                        request: {
                            headers: req.headers,
                        },
                    });
                    res.cookies.set({
                        name,
                        value,
                        ...options,
                    });
                },
                remove(name: string, options: CookieOptions) {
                    req.cookies.set({
                        name,
                        value: '',
                        ...options,
                    });
                    res = NextResponse.next({
                        request: {
                            headers: req.headers,
                        },
                    });
                    res.cookies.set({
                        name,
                        value: '',
                        ...options,
                    });
                },
            },
        }
    );

    const { data: { user } } = await supabase.auth.getUser();

    const url = req.nextUrl;
    const hostname = req.headers.get('host') || '';

    // Protected routes
    const isProtectedRoute = url.pathname.startsWith('/dashboard') || url.pathname.startsWith('/builder') || url.pathname.startsWith('/onboarding');

    if (isProtectedRoute && !user) {
        return NextResponse.redirect(new URL('/auth', req.url));
    }

    // Skip internal Next.js paths and static files
    if (
        url.pathname.startsWith('/_next') ||
        url.pathname.startsWith('/api') ||
        url.pathname.includes('.')
    ) {
        return res;
    }

    // Intercept auth codes and redirect to /auth/callback
    // This is important for cases where Supabase redirects to the root "/" with a code
    if (url.searchParams.has('code') && !url.pathname.startsWith('/auth/callback')) {
        const callbackUrl = new URL('/auth/callback', req.url);
        url.searchParams.forEach((value, key) => {
            callbackUrl.searchParams.set(key, value);
        });
        return NextResponse.redirect(callbackUrl);
    }

    // Prevent infinite loop if already rewritten
    if (url.pathname.startsWith('/form-subdomain/')) {
        return res;
    }

    // Allowed base domains we don't want to rewrite
    const baseDomains = [
        'genesisflow.io',
        'www.genesisflow.io',
        'localhost:3000',
        'localhost',
    ];

    // Check if we are on a Vercel-internal or system domain
    const isSystemDomain = hostname.includes('vercel.app') || hostname.includes('now.sh');

    // If it's a base domain OR a system domain (without subdomain), don't rewrite
    const hostParts = hostname.split('.');
    if (baseDomains.includes(hostname) || (isSystemDomain && hostParts.length <= 3)) {
        return res;
    }

    // Extract the subdomain
    const subdomain = hostParts[0].toLowerCase();

    // Prevent matching against common base/system prefixes
    const ignoredSubdomains = ['www', 'genesisflow', 'localhost', 'api', 'admin'];
    if (ignoredSubdomains.includes(subdomain) || isSystemDomain) {
        // If it's a vercel domain and we reach here, we actually don't want to rewrite it 
        // unless it's explicitly a custom setup. For now, let's skip v-loops.
        return res;
    }

    console.log(`Rewriting subdomain: ${subdomain}, path: ${url.pathname}`);

    // Rewrite to our hidden dynamic route
    const targetPath = `/form-subdomain/${subdomain}${url.pathname === '/' ? '' : url.pathname}`;

    return NextResponse.rewrite(new URL(targetPath, req.url));
}
