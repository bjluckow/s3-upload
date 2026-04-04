import { ListObjectsV2Command } from "@aws-sdk/client-s3";
import { auth } from "@/lib/auth";
import { s3, BUCKET } from "@/lib/s3";

export async function GET() {
    const session = await auth();
    if (!session && !!process.env.AUTH_DOMAIN)
        return Response.json({ error: "Unauthorized" }, { status: 401 });

    const folderSizes = new Map<string, number>();
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
            for (let i = 1; i < parts.length; i++) {
                const prefix = parts.slice(0, i).join("/");
                folderSizes.set(
                    prefix,
                    (folderSizes.get(prefix) ?? 0) + (obj.Size ?? 0),
                );
            }
        }

        token = NextContinuationToken;
    } while (token);

    return Response.json({
        folders: Array.from(folderSizes.entries())
            .map(([name, size]) => ({ name, size }))
            .sort((a, b) => a.name.localeCompare(b.name)),
    });
}
