"use client";
import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Upload from "@/components/Upload";
import FileBrowser from "@/components/FileBrowser";

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
            {!locked && (
                <section>
                    <h2 className="mb-2 text-lg font-semibold">Folder</h2>
                    <form onSubmit={handleFolderSubmit} className="flex gap-2">
                        <input
                            type="text"
                            value={folderInput}
                            onChange={(e) => setFolderInput(e.target.value)}
                            placeholder="uploads"
                            className="flex-1 rounded border border-white/10 bg-transparent px-3 py-1 text-sm"
                        />
                        <button
                            type="submit"
                            className="rounded bg-white/10 px-3 py-1 text-sm transition-colors hover:bg-white/20"
                        >
                            Set
                        </button>
                    </form>
                </section>
            )}

            <section>
                <h2 className="mb-4 text-lg font-semibold">
                    Upload to <span className="opacity-50">{folder}</span>
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
