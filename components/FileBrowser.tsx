"use client";
import { useEffect, useState } from "react";
import FileSearch from "./FileSearch";

interface FileEntry {
    key: string;
    size: number;
    lastModified: string;
    url: string;
}

export default function FileBrowser({
    folder,
    refreshKey,
}: {
    folder: string;
    refreshKey?: number;
}) {
    const [files, setFiles] = useState<FileEntry[]>([]);
    const [loading, setLoading] = useState(true);
    const [nextToken, setNextToken] = useState<string | null>(null);
    const [hasMore, setHasMore] = useState(false);
    const [totalFiles, setTotalFiles] = useState<number | null>(null);
    const [searchResults, setSearchResults] = useState<FileEntry[] | null>(
        null,
    );
    const displayFiles = searchResults ?? files;

    useEffect(() => {
        fetch(`/api/files/count?folder=${encodeURIComponent(folder)}`)
            .then((r) => r.json())
            .then((data) => setTotalFiles(data.total));
    }, [refreshKey, folder]);

    function fetchFiles(token?: string, append = false) {
        setLoading(true);
        const params = new URLSearchParams({ folder });
        if (token) params.set("token", token);

        fetch(`/api/files?${params}`)
            .then((r) => {
                if (!r.ok) throw new Error(`HTTP ${r.status}`);
                return r.json();
            })
            .then((data) => {
                setFiles((prev) =>
                    append
                        ? [...prev, ...(data.files ?? [])]
                        : (data.files ?? []),
                );
                setNextToken(data.nextToken);
                setHasMore(data.hasMore);
            })
            .catch((err) => console.error("Failed to fetch files:", err))
            .finally(() => setLoading(false));
    }

    useEffect(() => {
        fetchFiles();
    }, [refreshKey, folder]);

    if (loading && !files.length)
        return <p className="text-sm opacity-50">Loading files...</p>;
    if (!files.length)
        return <p className="text-sm opacity-50">No files uploaded yet.</p>;

    return (
        <div className="space-y-4">
            {totalFiles !== null && (
                <p className="text-sm opacity-50">{totalFiles} total files</p>
            )}
            <FileSearch folder={folder} onResults={setSearchResults} />
            <table className="w-full text-sm">
                <thead>
                    <tr className="border-b border-white/10 text-left opacity-50">
                        <th className="pb-2">File</th>
                        <th className="pb-2">Size</th>
                        <th className="pb-2">Uploaded</th>
                        <th className="pb-2"></th>
                    </tr>
                </thead>
                <tbody>
                    {displayFiles.map((f) => (
                        <tr key={f.key} className="border-b border-white/5">
                            <td className="py-2">{f.key.split("/").pop()}</td>
                            <td className="py-2 opacity-50">
                                {(f.size / 1024).toFixed(1)} KB
                            </td>
                            <td className="py-2 opacity-50">
                                {new Date(f.lastModified).toLocaleDateString()}
                            </td>
                            <td className="py-2 text-right">
                                <a
                                    href={f.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-blue-500 hover:opacity-70"
                                >
                                    download
                                </a>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>

            {!searchResults && hasMore && (
                <button
                    onClick={() => fetchFiles(nextToken ?? undefined, true)}
                    disabled={loading}
                    className="w-full rounded bg-white/10 py-2 text-sm transition-colors hover:bg-white/20 disabled:opacity-50"
                >
                    {loading ? "Loading..." : "Load more"}
                </button>
            )}
        </div>
    );
}
