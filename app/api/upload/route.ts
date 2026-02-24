import { PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { auth } from "@/lib/auth";
import { s3, BUCKET } from "@/lib/s3";

export async function POST(req: Request) {
    const session = await auth();
    if (!session)
        return Response.json({ error: "Unauthorized" }, { status: 401 });

    const { filename, contentType, folder } = await req.json();

    const key = `${folder}/${Date.now()}-${filename}`;

    const url = await getSignedUrl(
        s3,
        new PutObjectCommand({
            Bucket: BUCKET,
            Key: key,
            ContentType: contentType,
        }),
        { expiresIn: 60 }, // 60 seconds to complete the upload
    );

    return Response.json({ url, key });
}
