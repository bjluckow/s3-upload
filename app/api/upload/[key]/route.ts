import { DeleteObjectCommand } from "@aws-sdk/client-s3";
import { auth } from "@/lib/auth";
import { s3, BUCKET } from "@/lib/s3";

export async function DELETE(req: Request) {
    const session = await auth();
    if (!session && !!process.env.AUTH_DOMAIN)
        return Response.json({ error: "Unauthorized" }, { status: 401 });

    const key = await req.text();

    await s3.send(new DeleteObjectCommand({ Bucket: BUCKET, Key: key }));

    return new Response(null, { status: 204 });
}
