import { ListObjectsV2Command } from "@aws-sdk/client-s3";
import { auth } from "@/lib/auth";
import { s3, BUCKET } from "@/lib/s3";

export async function GET(req: Request) {
    const session = await auth();
    if (!session && !!process.env.AUTH_DOMAIN)
        return Response.json({ error: "Unauthorized" }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const folder = searchParams.get("folder") || "";

    let total = 0;
    let token: string | undefined;

    do {
        const { KeyCount, NextContinuationToken } = await s3.send(
            new ListObjectsV2Command({
                Bucket: BUCKET,
                Prefix: folder ? `${folder}/` : undefined,
                ContinuationToken: token,
            }),
        );
        total += KeyCount ?? 0;
        token = NextContinuationToken;
    } while (token);

    return Response.json({ total });
}
