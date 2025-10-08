"use client";

import { useEffect, useState } from 'react';

type FileEntry = { name: string; url: string; size: number; createdAt: string; fallback?: boolean };

export default function MembersFiles() {
  const [files, setFiles] = useState<FileEntry[]>([]);
  const [uploading, setUploading] = useState(false);
  const [err, setErr] = useState('');

  async function load() {
    try {
      const res = await fetch('/api/members/uploads');
      const json = await res.json();
      if (!res.ok) throw new Error(json?.error || 'Failed');
      setFiles(json.files || []);
    } catch (e: any) {
      setErr(e?.message || 'Could not load files');
    }
  }

  useEffect(() => { load(); }, []);

  async function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    setErr('');
    const f = e.target.files?.[0];
    if (!f) return;
    if (f.type !== 'application/pdf') { setErr('Only PDFs allowed'); return; }
    setUploading(true);
    try {
      const reader = new FileReader();
      reader.onload = async () => {
        const data = reader.result as string;
        const res = await fetch('/api/members/uploads', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ filename: f.name, data }) });
        const json = await res.json();
        if (!res.ok) throw new Error(json?.error || 'Upload failed');
        await load();
      };
      reader.readAsDataURL(f);
    } catch (err: any) {
      setErr(err?.message || 'Upload error');
    } finally { setUploading(false); }
  }

  return (
    <div className="mt-6">
      <h3 className="text-lg font-semibold mb-2">Meeting minutes (PDF)</h3>
      <div className="mb-3">
        <label className="inline-block bg-white border rounded px-3 py-2 cursor-pointer">
          <input type="file" accept="application/pdf" onChange={onFile} className="hidden" />
          {uploading ? 'Uploading…' : 'Upload PDF'}
        </label>
        {err && <span className="ml-3 text-sm text-red-600">{err}</span>}
      </div>

      <div className="space-y-2">
        {files.length === 0 && <p className="text-sm text-gray-600">No meeting minutes uploaded yet.</p>}
        {files.map((f) => (
          <div key={f.name} className="flex items-center justify-between bg-white p-3 rounded border">
            <div>
              <a href={f.url} target="_blank" rel="noopener noreferrer" className="text-green-800 underline">{f.name}</a>
              <div className="text-xs text-gray-500">{new Date(f.createdAt).toLocaleString()} {f.fallback ? '(stored temporarily)' : ''}</div>
            </div>
            <div className="text-sm text-gray-600">{(f.size/1024).toFixed(1)} KB</div>
          </div>
        ))}
      </div>
    </div>
  );
}
