"use client";
import { useRef, useState } from "react";
import { zipFolder } from "@/lib/zip";

type Stage = "idle" | "zipping" | "uploading" | "done" | "error";

interface UploadFolderProps {
    folder?: string;
    onFileChange?: () => void;
}

export default function UploadFolder({
    folder = "uploads",
    onFileChange,
}: UploadFolderProps) {
    const inputRef = useRef<HTMLInputElement>(null);
    const [stage, setStage] = useState<Stage>("idle");
    const [progress, setProgress] = useState(0);
    const [filename, setFilename] = useState("");
    const [error, setError] = useState("");

    async function handleFolderInput(e: React.ChangeEvent<HTMLInputElement>) {
        const files = Array.from(e.target.files ?? []);
        if (!files.length) return;

        setError("");
        setProgress(0);

        try {
            // Zip stage
            setStage("zipping");
            const zipped = await zipFolder(files);
            setFilename(zipped.name);

            // Get presigned URL
            const res = await fetch("/api/upload", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    filename: zipped.name,
                    contentType: zipped.type,
                    folder,
                }),
            });
            const { url, key } = await res.json();

            // Upload stage
            setStage("uploading");
            await new Promise<void>((resolve, reject) => {
                const xhr = new XMLHttpRequest();
                xhr.open("PUT", url);
                xhr.upload.onprogress = (e) => {
                    if (e.lengthComputable) {
                        setProgress(Math.round((e.loaded / e.total) * 100));
                    }
                };
                xhr.onload = () => {
                    resolve();
                };
                xhr.onerror = () => reject(new Error("Upload failed"));
                xhr.send(zipped);
            });

            setStage("done");
            setProgress(100);
            onFileChange?.();
        } catch (err) {
            setStage("error");
            setError(
                err instanceof Error ? err.message : "Something went wrong",
            );
        }

        e.target.value = "";
    }

    function reset() {
        setStage("idle");
        setProgress(0);
        setFilename("");
        setError("");
    }

    return (
        <div
            onClick={() => stage === "idle" && inputRef.current?.click()}
            className="flex min-h-[60px] cursor-pointer flex-col items-center justify-center gap-2 rounded-lg bg-white/80 px-4 py-3 text-sm text-gray-700 transition hover:border-gray-400 hover:text-gray-600"
        >
            <input
                ref={inputRef}
                type="file"
                className="hidden"
                {...({
                    webkitdirectory: "true",
                } as React.InputHTMLAttributes<HTMLInputElement>)}
                onChange={handleFolderInput}
            />

            {stage === "idle" && (
                <span>
                    <u>Browse folders</u> (auto-zip)
                </span>
            )}

            {(stage === "zipping" || stage === "uploading") && (
                <div className="w-full space-y-1">
                    <div className="flex justify-between text-xs">
                        <span>{filename}</span>
                        <span>
                            {stage === "zipping"
                                ? "Zipping..."
                                : `${progress}%`}
                        </span>
                    </div>
                    <div className="h-1.5 w-full overflow-hidden rounded-full bg-gray-200">
                        <div
                            className="h-full rounded-full bg-gray-400 transition-all duration-200"
                            style={{
                                width:
                                    stage === "zipping"
                                        ? "100%"
                                        : `${progress}%`,
                            }}
                        />
                    </div>
                    <p className="text-xs text-gray-400">
                        {stage === "zipping"
                            ? "Compressing files..."
                            : "Uploading to S3..."}
                    </p>
                </div>
            )}

            {stage === "done" && (
                <div className="flex w-full items-center justify-between">
                    <span className="text-green-500">
                        ✓ {filename} uploaded
                    </span>
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            reset();
                        }}
                        className="text-xs text-gray-400 hover:text-gray-600"
                    >
                        upload another
                    </button>
                </div>
            )}

            {stage === "error" && (
                <div className="flex w-full items-center justify-between">
                    <span className="text-red-500">✗ {error}</span>
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            reset();
                        }}
                        className="text-xs text-gray-400 hover:text-gray-600"
                    >
                        try again
                    </button>
                </div>
            )}
        </div>
    );
}
