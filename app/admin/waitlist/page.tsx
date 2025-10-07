import fs from 'fs';
import path from 'path';

export const runtime = 'nodejs';

async function readStore() {
  try {
    const p = path.join(process.cwd(), 'data', 'waitlist.json');
    const raw = await fs.promises.readFile(p, 'utf8');
    return JSON.parse(raw);
  } catch (err) {
    return [];
  }
}

export default async function AdminWaitlist() {
  const entries = await readStore();

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto bg-white rounded shadow p-6">
        <h1 className="text-2xl font-semibold mb-4">Waitlist Admin</h1>
        <p className="mb-4">Entries received: {entries.length}</p>
        <div className="mb-4">
          <a href="/api/waitlist?download=csv" className="bg-green-800 text-white px-4 py-2 rounded">Download CSV</a>
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
              {entries.map((e: any) => (
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
