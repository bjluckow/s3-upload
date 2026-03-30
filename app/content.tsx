"use client";
import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Upload from "@/components/Upload";
import FileBrowser from "@/components/FileBrowser";
import FolderPicker from "@/components/FolderPicker";

export default function HomePageContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const [refreshKey, setRefreshKey] = useState(0);

    const folder = searchParams.get("path") || "uploads";
    const locked = searchParams.get("lock") === "true";
    const [folderInput, setFolderInput] = useState(folder);

    useEffect(() => {
        setFolderInput(folder);
    }, [folder]);

    function handleFolderSubmit(e: React.SubmitEvent) {
        e.preventDefault();
        router.push(`?path=${encodeURIComponent(folderInput)}`);
    }

    return (
        <div className="space-y-8 p-16">
            <section>
                <h2 className="mb-2 text-lg font-semibold">Folder</h2>
                {!locked ? (
                    <form onSubmit={handleFolderSubmit} className="flex gap-2">
                        <FolderPicker
                            value={folderInput}
                            onChange={setFolderInput}
                        />
                        <button
                            type="submit"
                            className="rounded bg-white/10 px-3 py-1 text-sm transition-colors hover:bg-white/20"
                        >
                            Set
                        </button>
                    </form>
                ) : (
                    <p className="text-sm opacity-50">
                        Uploading to <b className="opacity-100">{folder}</b>
                    </p>
                )}
            </section>

            <section>
                <h2 className="mb-4 text-lg font-semibold">
                    Upload to <span className="opacity-60">{folder}</span>{" "}
                </h2>
                <Upload
                    folder={folder}
                    onUploadComplete={() => setRefreshKey((k) => k + 1)}
                />
            </section>

            <section>
                <h2 className="mb-4 text-lg font-semibold">Files</h2>
                <FileBrowser folder={folder} refreshKey={refreshKey} />
            </section>
        </div>
    );
}
