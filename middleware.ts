import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

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

export function middleware(req: NextRequest) {
    const url = req.nextUrl;
    const hostname = req.headers.get('host') || '';

    // Skip internal Next.js paths and static files
    if (
        url.pathname.startsWith('/_next') ||
        url.pathname.startsWith('/api') ||
        url.pathname.includes('.')
    ) {
        return NextResponse.next();
    }

    // Prevent infinite loop if already rewritten
    if (url.pathname.startsWith('/form-subdomain/')) {
        return NextResponse.next();
    }

    // Allowed domains we don't want to rewrite
    const allowedDomains = [
        'genesisflow.io',
        'www.genesisflow.io',
        'localhost:3000',
        'localhost',
    ];

    // If it's a base domain or localhost (without subdomain), don't rewrite
    const isBaseLocal = hostname === 'localhost:3000' || hostname === 'localhost';
    if (allowedDomains.includes(hostname) || isBaseLocal) {
        return NextResponse.next();
    }

    // Extract the subdomain (e.g. 'form1' from 'form1.localhost:3000')
    const pathParts = hostname.split('.');
    const subdomain = pathParts[0];

    // Prevent matching against the base domain or www if something slipped through
    if (subdomain === 'www' || subdomain === 'genesisflow' || subdomain === 'localhost') {
        return NextResponse.next();
    }

    console.log(`Rewriting subdomain: ${subdomain}, path: ${url.pathname}`);

    // Rewrite to our hidden dynamic route
    // Ensure we don't have double slashes
    const targetPath = `/form-subdomain/${subdomain}${url.pathname === '/' ? '' : url.pathname}`;
    return NextResponse.rewrite(new URL(targetPath, req.url));
}
