import { ListObjectsV2Command, GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { auth } from "@/lib/auth";
import { s3, BUCKET } from "@/lib/s3";

export async function GET(req: Request) {
    const session = await auth();
    if (!session && !!process.env.AUTH_DOMAIN)
        return Response.json({ error: "Unauthorized" }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const folder = searchParams.get("folder") || "";
    const query = searchParams.get("q")?.toLowerCase() || "";

    if (!query) return Response.json({ files: [] });

    // Paginate through all metadata
    const allKeys: { key: string; size: number; lastModified: Date }[] = [];
    let token: string | undefined;

    do {
        const { Contents = [], NextContinuationToken } = await s3.send(
            new ListObjectsV2Command({
                Bucket: BUCKET,
                Prefix: folder ? `${folder}/` : undefined,
                ContinuationToken: token,
            }),
        );

        for (const obj of Contents) {
            if (!obj.Key) continue;
            const filename = obj.Key.split("/").pop() ?? "";
            if (filename.toLowerCase().includes(query)) {
                allKeys.push({
                    key: obj.Key,
                    size: obj.Size ?? 0,
                    lastModified: obj.LastModified ?? new Date(),
                });
            }
        }

        token = NextContinuationToken;
    } while (token);

    // Generate presigned URLs only for matches
    const files = await Promise.all(
        allKeys.map(async (obj) => ({
            ...obj,
            url: await getSignedUrl(
                s3,
                new GetObjectCommand({ Bucket: BUCKET, Key: obj.key }),
                { expiresIn: 300 },
            ),
        })),
    );

    return Response.json({ files });
}
