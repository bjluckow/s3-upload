import NextAuth from "next-auth";

export const { auth, handlers } = NextAuth({
    providers: [],
    secret: process.env.AUTH_SECRET,
    cookies: {
        sessionToken: {
            name: `next-auth.session-token`,
            options: {
                httpOnly: true,
                sameSite: "lax" as const,
                path: "/",
                secure: process.env.NODE_ENV === "production",
                domain: process.env.AUTH_DOMAIN,
            },
        },
    },
});
