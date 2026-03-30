import { ListObjectsV2Command } from "@aws-sdk/client-s3";
import { auth } from "@/lib/auth";
import { s3, BUCKET } from "@/lib/s3";

export async function GET() {
    const session = await auth();
    if (!session && !!process.env.AUTH_DOMAIN)
        return Response.json({ error: "Unauthorized" }, { status: 401 });

    const folders = new Set<string>();
    let token: string | undefined;

    do {
        const { Contents = [], NextContinuationToken } = await s3.send(
            new ListObjectsV2Command({
                Bucket: BUCKET,
                ContinuationToken: token,
            }),
        );

        for (const obj of Contents) {
            if (!obj.Key) continue;
            const parts = obj.Key.split("/");
            // Add every prefix level, e.g. "a", "a/b", "a/b/c"
            for (let i = 1; i < parts.length; i++) {
                folders.add(parts.slice(0, i).join("/"));
            }
        }

        token = NextContinuationToken;
    } while (token);

    return Response.json({ folders: Array.from(folders).sort() });
}

