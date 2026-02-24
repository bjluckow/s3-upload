"use client";
import { useEffect, useState } from "react";

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

    useEffect(() => {
        fetch(`/api/files?folder=${encodeURIComponent(folder)}`)
            .then((r) => {
                if (!r.ok) throw new Error(`HTTP ${r.status}`);
                return r.json();
            })
            .then((data) => setFiles(data.files ?? []))
            .catch((err) => console.error("Failed to fetch files:", err))
            .finally(() => setLoading(false));
    }, [refreshKey, folder]);

    if (loading) return <p className="text-sm opacity-50">Loading files...</p>;
    if (!files.length)
        return <p className="text-sm opacity-50">No files uploaded yet.</p>;

    return (
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
                {files.map((f) => (
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
    );
}
