"use client";

import { useState } from 'react';

export default function Login({ onSuccess }: { onSuccess?: () => void }) {
  const [pass, setPass] = useState('');
  const [err, setErr] = useState('');
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setErr('');
    setLoading(true);
    try {
      const res = await fetch('/api/admin/login', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ password: pass }) });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.error || 'Login failed');
      if (onSuccess) onSuccess(); else window.location.reload();
    } catch (err: any) {
      setErr(err?.message || 'Login failed');
    } finally { setLoading(false); }
  }

  return (
    <form onSubmit={submit} className="max-w-sm mx-auto">
      <label className="block mb-2">Admin Password</label>
      <input type="password" value={pass} onChange={(e) => setPass(e.target.value)} className="w-full px-3 py-2 rounded border mb-2" />
      {err && <p className="text-sm text-red-600 mb-2">{err}</p>}
      <div className="flex gap-2">
        <button className="bg-green-800 text-white px-4 py-2 rounded" disabled={loading} type="submit">{loading ? 'Signing in...' : 'Sign in'}</button>
      </div>
    </form>
  );
}
