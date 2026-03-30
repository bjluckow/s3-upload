'use client';
import { useEffect, useRef, useState } from 'react';

interface FolderPickerProps {
    value: string;
    onChange: (folder: string) => void;
}

export default function FolderPicker({ value, onChange }: FolderPickerProps) {
    const [folders, setFolders] = useState<string[]>([]);
    const [open, setOpen] = useState(false);
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        fetch('/api/folders')
            .then((r) => r.json())
            .then((data) => setFolders(data.folders ?? []));
    }, []);

    // Close on outside click
    useEffect(() => {
        function handleClick(e: MouseEvent) {
            if (ref.current && !ref.current.contains(e.target as Node)) {
                setOpen(false);
            }
        }
        document.addEventListener('mousedown', handleClick);
        return () => document.removeEventListener('mousedown', handleClick);
    }, []);

    return (
        <div ref={ref} className="relative flex-1">
            <div className="flex gap-2">
                <input
                    type="text"
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    className="flex-1 rounded border border-white/10 bg-transparent px-3 py-1 text-sm"
                    placeholder="uploads"
                    onFocus={() => setOpen(true)}
                />
                {folders.length > 0 && (
                    <button
                        type="button"
                        onClick={() => setOpen((o) => !o)}
                        className="rounded border border-white/10 px-2 py-1 text-sm opacity-50 hover:opacity-100 transition-opacity"
                    >
                        ▾
                    </button>
                )}
            </div>

            {open && folders.length > 0 && (
                <div className="absolute z-10 mt-1 w-full rounded border border-white/10 bg-neutral-900 shadow-lg">
                    {folders.map((f) => (
                        <button
                            key={f}
                            type="button"
                            onClick={() => { onChange(f); setOpen(false); }}
                            className={`w-full px-3 py-2 text-left text-sm hover:bg-white/10 transition-colors
                                ${value === f ? 'opacity-100' : 'opacity-50'}`}
                        >
                            📁 {f}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}