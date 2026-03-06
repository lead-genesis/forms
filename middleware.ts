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

    // Get hostname of request (e.g. demo.genesisflow.io, demo.localhost:3000)
    let hostname = req.headers.get('host') || '';

    // Allowed domains we don't want to rewrite
    // If working locally, you can add localhost:3000 to your allowed domains
    const allowedDomains = [
        'genesisflow.io',
        'www.genesisflow.io',
        'localhost:3000',
        'localhost',
    ];

    // Also verify against Vercel deployment URLs to avoid rewriting preview domains
    if (
        hostname.includes('vercel.app') ||
        allowedDomains.includes(hostname)
    ) {
        return NextResponse.next();
    }

    // If we reach here, we are on a custom subdomain or custom domain.
    // Extract the subdomain (e.g., 'form1' from 'form1.genesisflow.io')
    const pathParts = hostname.split('.');

    // If it's a subdomain like form1.genesisflow.io, pathParts[0] will be 'form1'
    // If they are using a custom domain later, we might handle it differently.
    const subdomain = pathParts[0];

    // Prevent matching against the base domain or www if something slipped through
    if (subdomain === 'www' || subdomain === 'genesisflow') {
        return NextResponse.next();
    }

    // Rewrite to our hidden dynamic route
    return NextResponse.rewrite(
        new URL(`/form-subdomain/${subdomain}${url.pathname}`, req.url)
    );
}
