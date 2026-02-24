import { ListObjectsV2Command, GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { auth } from "@/lib/auth";
import { s3, BUCKET } from "@/lib/s3";

export async function GET(req: Request) {
    const session = await auth();
    if (!session)
        return Response.json({ error: "Unauthorized" }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const folder = searchParams.get("folder") || "";

    const { Contents = [] } = await s3.send(
        new ListObjectsV2Command({
            Bucket: BUCKET,
            Prefix: folder ? `${folder}/` : undefined,
        }),
    );

    const files = await Promise.all(
        Contents.map(async (obj) => ({
            key: obj.Key,
            size: obj.Size,
            lastModified: obj.LastModified,
            url: await getSignedUrl(
                s3,
                new GetObjectCommand({ Bucket: BUCKET, Key: obj.Key }),
                { expiresIn: 300 },
            ),
        })),
    );

    return Response.json({ files });
}
