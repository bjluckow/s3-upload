"use client";
import { FilePond, registerPlugin } from "react-filepond";
import FilePondPluginImagePreview from "filepond-plugin-image-preview";
import FilePondPluginFileValidateType from "filepond-plugin-file-validate-type";
import FilePondPluginImageExifOrientation from "filepond-plugin-image-exif-orientation";

import "filepond/dist/filepond.min.css";
import "filepond-plugin-image-preview/dist/filepond-plugin-image-preview.css";

registerPlugin(
    FilePondPluginImageExifOrientation,
    FilePondPluginImagePreview,
    FilePondPluginFileValidateType,
);

interface UploadProps {
    folder?: string;
    onUploadComplete?: () => void;
    imagePreviewHeight?: number;
}

export default function Upload({
    folder = "uploads",
    onUploadComplete,
    imagePreviewHeight,
}: UploadProps) {
    return (
        <FilePond
            allowMultiple={true}
            onprocessfile={onUploadComplete}
            onremovefile={onUploadComplete}
            allowImagePreview={!!imagePreviewHeight}
            imagePreviewHeight={imagePreviewHeight}
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

                revert: async (key, load, error) => {
                    const res = await fetch("/api/upload/key", {
                        method: "DELETE",
                        body: key,
                    });
                    if (res.ok) load();
                    else error("Delete failed");
                },
            }}
        />
    );
}
