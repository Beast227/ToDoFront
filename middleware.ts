import { NextRequest, NextResponse } from "next/server";


export function middleware(request: NextRequest) {

    // const pathname = request.nextUrl.pathname;
    // const token = localStorage.getItem("token");

    // if (pathname.startsWith("/dashboard") && !token) {
    //     return NextResponse.redirect(new URL('/auth', request.url));
    // }

    // if (pathname.startsWith("/auth") && token) {
    //     return NextResponse.redirect(new URL('/dashboard', request.url));
    // }

    return NextResponse.next()

}

export const config = {
    matcher: [
        '/((?!api|_next/static|_next/image|favicon.ico).*)'
    ]
}