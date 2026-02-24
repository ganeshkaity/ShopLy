import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * Note: Middleware handles redirects based on cookies.
 * Since Firebase Auth uses IndexedDB on client side, we need to sync Auth State to Cookies
 * for Middleware to work effectively in a real-world prod app.
 * For now, we'll implement a basic structure that can be enhanced.
 */
export function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;

    // This is a simplified check. In production, you'd use a session cookie.
    // We'll primarily rely on Client-side guards in our layout components because
    // Firebase Auth is typically client-side focused in Next.js without custom session management.

    // Redirect logged in users away from auth pages
    const isAuthPage = pathname.startsWith('/login') || pathname.startsWith('/signup');
    // const session = request.cookies.get('session'); // Hypothetical session cookie

    // if (isAuthPage && session) {
    //   return NextResponse.redirect(new URL('/', request.url));
    // }

    return NextResponse.next();
}

export const config = {
    matcher: [
        '/admin/:path*',
        '/cart',
        '/wishlist',
        '/checkout',
        '/orders/:path*',
        '/account',
        '/login',
        '/signup',
    ],
};
