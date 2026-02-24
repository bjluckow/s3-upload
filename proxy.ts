import { auth } from "./lib/auth";
import { NextResponse } from "next/server";

const authEnabled = !!process.env.AUTH_DOMAIN;

export const proxy = auth((req) => {
    if (!authEnabled) return NextResponse.next();

    if (!req.auth) {
        const loginUrl = new URL(process.env.LOGIN_URL!);
        loginUrl.searchParams.set("callbackUrl", req.url);
        return NextResponse.redirect(loginUrl);
    }
});

export const config = { matcher: ["/((?!_next|favicon.ico).*)"] };
