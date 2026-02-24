import { auth } from "./lib/auth";
import { NextResponse } from "next/server";

export const proxy = auth((req) => {
    if (!req.auth) {
        const loginUrl = new URL(process.env.LOGIN_URL!);
        loginUrl.searchParams.set("callbackUrl", req.url);
        return NextResponse.redirect(loginUrl);
    }
});

export const config = { matcher: ["/((?!_next|favicon.ico).*)"] };
