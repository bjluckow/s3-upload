"use client";
import { FilePond, registerPlugin } from "react-filepond";
import "filepond/dist/filepond.min.css";

interface UploadProps {
    folder?: string;
    onUploadComplete?: () => void;
}

export default function Upload({
    folder = "uploads",
    onUploadComplete,
}: UploadProps) {
    return (
        <FilePond
            allowMultiple={true}
            onprocessfile={onUploadComplete}
            server={{
                process: async (
                    _fieldName,
                    file,
                    _metadata,
                    load,
                    error,
                    progress,
                ) => {
                    const res = await fetch("/api/upload", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                            filename: file.name,
                            contentType: file.type,
                            folder,
                        }),
                    });
                    const { url, key } = await res.json();

                    const xhr = new XMLHttpRequest();
                    xhr.open("PUT", url);
                    xhr.upload.onprogress = (e) =>
                        progress(e.lengthComputable, e.loaded, e.total);
                    xhr.onload = () => load(key);
                    xhr.onerror = () => error("Upload failed");
                    xhr.send(file);

                    return { abort: () => xhr.abort() };
                },
            }}
        />
    );
}
