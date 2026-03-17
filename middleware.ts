import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { createServerClient, type CookieOptions } from '@supabase/ssr';

export const config = {
    matcher: [
        /*
         * Match all request paths except:
         * - api (API routes)
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico
         * Note: sitemap.xml and robots.txt are NOT excluded so custom domains
         * can be rewritten to brand-specific versions.
         */
        '/((?!api|_next/static|_next/image|favicon.ico).*)',
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

    const SEO_PATHS = ['/sitemap.xml', '/robots.txt'];
    const isSeoPath = SEO_PATHS.includes(url.pathname);

    // Skip internal paths, static files, and already-rewritten paths (but not SEO files — those need domain rewriting)
    if (
        url.pathname.startsWith('/_next') ||
        url.pathname.startsWith('/api') ||
        url.pathname.startsWith('/form-subdomain/') ||
        url.pathname.startsWith('/brand-runtime/') ||
        (url.pathname.includes('.') && !isSeoPath)
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

    // Allowed base domains we don't want to rewrite
    const baseDomains = [
        'genesisflow.io',
        'www.genesisflow.io',
        'localhost:3000',
        'localhost:3001',
        'localhost',
        '127.0.0.1',
        '127.0.0.1:3000',
        '127.0.0.1:3001',
    ];

    // 2. Identify if it's a custom domain or a subdomain
    const isBaseDomain = baseDomains.includes(hostname);
    const isVercelDomain = hostname.includes('vercel.app') || hostname.includes('now.sh');

    // Vercel preview URLs can have 4+ segments (e.g. feature-branch.project.vercel.app)
    // so treat any *.vercel.app or *.now.sh hostname as a platform domain, not a custom domain.
    if (isBaseDomain || isVercelDomain) {
        return res;
    }

    // 3. Determine if it's a subdomain of our base domain
    const isSubdomainOfCorrectBase = hostname.endsWith('.genesisflow.io');

    if (isSubdomainOfCorrectBase) {
        const subdomain = hostname.replace('.genesisflow.io', '').toLowerCase();
        if (subdomain === 'www' || subdomain === 'api' || subdomain === 'admin') return res;

        // Check if subdomain belongs to a brand first
        const { data: brand } = await supabase
            .from("brands")
            .select("id")
            .eq("subdomain", subdomain)
            .single();

        if (brand) {
            return NextResponse.rewrite(new URL(`/brand-runtime/${subdomain}${url.pathname === '/' ? '' : url.pathname}`, req.url));
        }

        // Check if subdomain belongs to a form
        const { data: form } = await supabase
            .from("forms")
            .select("id")
            .eq("subdomain", subdomain)
            .single();

        if (form) {
            return NextResponse.rewrite(new URL(`/form-subdomain/${subdomain}${url.pathname === '/' ? '' : url.pathname}`, req.url));
        }

        // Default to brand-runtime (will show "Site Not Found")
        return NextResponse.rewrite(new URL(`/brand-runtime/${subdomain}${url.pathname === '/' ? '' : url.pathname}`, req.url));
    }

    // 4. Otherwise, handle as a full custom domain (for brands)
    return NextResponse.rewrite(new URL(`/brand-runtime/${hostname}${url.pathname === '/' ? '' : url.pathname}`, req.url));
}
