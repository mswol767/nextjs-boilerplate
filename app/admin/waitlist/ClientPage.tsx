"use client";

import { useEffect, useState } from 'react';
import Login from '../Login';

type Entry = {
  id: string;
  name: string;
  email: string;
  phone?: string;
  address?: string;
  message?: string;
  createdAt: string;
};

export default function ClientPage() {
  const [entries, setEntries] = useState<Entry[] | null>(null);
  const [loading, setLoading] = useState(false);

  async function load() {
    setLoading(true);
    try {
      const res = await fetch('/api/waitlist');
      const json = await res.json();
      if (!res.ok) throw new Error(json?.error || 'Could not load');
      setEntries(json.entries || []);
    } catch (err) {
      setEntries([]);
    } finally { setLoading(false); }
  }

  useEffect(() => { load(); }, []);

  // If entries is null, assume not authenticated and show login
  if (entries === null) return <Login onSuccess={load} />;

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto bg-white rounded shadow p-6">
        <div className="flex items-start justify-between mb-6">
          <div>
            <h1 className="text-2xl font-semibold">Waitlist Management</h1>
            <p className="text-gray-600 mt-1">Entries received: {entries.length}</p>
          </div>
          <div className="flex gap-3">
            <a 
              href="/admin/events" 
              className="btn-secondary"
            >
              Manage Events
            </a>
            <a 
              href="/api/waitlist?download=csv" 
              className="btn-primary"
            >
              Download CSV
            </a>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b">
                <th className="py-2 pr-4">Name</th>
                <th className="py-2 pr-4">Email</th>
                <th className="py-2 pr-4">Phone</th>
                <th className="py-2 pr-4">Address</th>
                <th className="py-2 pr-4">Message</th>
                <th className="py-2 pr-4">Submitted</th>
              </tr>
            </thead>
            <tbody>
              {entries.map((e) => (
                <tr key={e.id} className="border-b last:border-b-0">
                  <td className="py-3 pr-4 align-top">{e.name}</td>
                  <td className="py-3 pr-4 align-top">{e.email}</td>
                  <td className="py-3 pr-4 align-top">{e.phone || '-'}</td>
                  <td className="py-3 pr-4 align-top">{e.address || '-'}</td>
                  <td className="py-3 pr-4 align-top">{e.message || '-'}</td>
                  <td className="py-3 pr-4 align-top">{new Date(e.createdAt).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
