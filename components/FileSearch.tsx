"use client";
import { useEffect, useState } from "react";

interface FileEntry {
    key: string;
    size: number;
    lastModified: string;
    url: string;
}

interface FileSearchProps {
    folder: string;
    onResults: (results: FileEntry[] | null) => void;
}

export default function FileSearch({ folder, onResults }: FileSearchProps) {
    const [search, setSearch] = useState("");
    const [searching, setSearching] = useState(false);
    const [resultCount, setResultCount] = useState<number | null>(null);

    useEffect(() => {
        if (!search) {
            onResults(null);
            setResultCount(null);
            return;
        }

        const timeout = setTimeout(() => {
            setSearching(true);
            fetch(
                `/api/files/search?folder=${encodeURIComponent(folder)}&q=${encodeURIComponent(search)}`,
            )
                .then((r) => r.json())
                .then((data) => {
                    const files = data.files ?? [];
                    onResults(files);
                    setResultCount(files.length);
                })
                .catch((err) => console.error(err))
                .finally(() => setSearching(false));
        }, 300);

        return () => clearTimeout(timeout);
    }, [search, folder]);

    return (
        <div className="flex items-center gap-2">
            <input
                type="text"
                placeholder="Search files..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="flex-1 rounded border border-white/10 bg-transparent px-3 py-1 text-sm"
            />
            {searching && (
                <span className="text-sm opacity-50">Searching...</span>
            )}
            {search && !searching && resultCount !== null && (
                <span className="text-sm opacity-50">
                    {resultCount} results
                </span>
            )}
        </div>
    );
}
