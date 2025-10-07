import { NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';
import os from 'os';

type WaitEntry = {
  id: string;
  name: string;
  email: string;
  phone?: string;
  address?: string;
  message?: string;
  createdAt: string;
};

async function readStore(filePath: string) {
  // Read primary store (may fail on read-only FS)
  let primary: WaitEntry[] = [];
  try {
    const raw = await fs.readFile(filePath, 'utf8');
    primary = JSON.parse(raw) as WaitEntry[];
  } catch (err) {
    primary = [];
  }

  // Also read tmp fallback store if present and merge unique entries
  let tmp: WaitEntry[] = [];
  try {
    const tmpPath = path.join(os.tmpdir(), 'waitlist.json');
    const raw2 = await fs.readFile(tmpPath, 'utf8');
    tmp = JSON.parse(raw2) as WaitEntry[];
  } catch (e) {
    tmp = [];
  }

  // Merge by id (primary first, then any tmp entries not present)
  const seen = new Set<string>();
  const merged: WaitEntry[] = [];
  for (const e of primary) {
    seen.add(e.id);
    merged.push(e);
  }
  for (const e of tmp) {
    if (!seen.has(e.id)) {
      merged.push(e);
      seen.add(e.id);
    }
  }
  return merged;
}

async function writeStore(filePath: string, data: WaitEntry[]) {
  const dir = path.dirname(filePath);
  try {
    await fs.mkdir(dir, { recursive: true });
    await fs.writeFile(filePath, JSON.stringify(data, null, 2), 'utf8');
    return { path: filePath };
  } catch (err: any) {
    // If filesystem is read-only (common on some serverless platforms), fall back to tmp dir
    if (err && (err.code === 'EROFS' || err.code === 'EACCES' || err.code === 'EPERM')) {
      const tmpPath = path.join(os.tmpdir(), 'waitlist.json');
      await fs.writeFile(tmpPath, JSON.stringify(data, null, 2), 'utf8');
      return { path: tmpPath, fallback: true };
    }
    // rethrow other errors
    throw err;
  }
}

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const download = url.searchParams.get('download');
    const storePath = path.join(process.cwd(), 'data', 'waitlist.json');
  const store = await readStore(storePath);

    if (download === 'csv') {
      // build CSV
      const header = ['id', 'name', 'email', 'phone', 'address', 'message', 'createdAt'];
      const rows = store.map((r) => header.map((h) => {
        const v = (r as any)[h];
        if (v === undefined || v === null) return '';
        // escape double quotes
        return `"${String(v).replace(/"/g, '""')}"`;
      }).join(','));
      const csv = [header.join(','), ...rows].join('\r\n');
      return new Response(csv, {
        status: 200,
        headers: {
          'Content-Type': 'text/csv; charset=utf-8',
          'Content-Disposition': 'attachment; filename="waitlist.csv"',
        },
      });
    }

    return NextResponse.json({ ok: true, entries: store });
  } catch (err: any) {
    console.error('waitlist GET error', err);
    return NextResponse.json({ ok: false, error: err?.message || 'unknown' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, email, phone, address, message } = body;

    if (!name || !email) {
      return NextResponse.json({ ok: false, error: 'Name and email are required' }, { status: 400 });
    }

    const entry: WaitEntry = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      name: String(name),
      email: String(email),
      phone: phone ? String(phone) : undefined,
      address: address ? String(address) : undefined,
      message: message ? String(message) : undefined,
      createdAt: new Date().toISOString(),
    };

    const storePath = path.join(process.cwd(), 'data', 'waitlist.json');
    const store = await readStore(storePath);
    store.push(entry);
    const writeResult = await writeStore(storePath, store);

    // Inform caller where we persisted (or if it fell back to tmp)
    return NextResponse.json({ ok: true, entry, persistedTo: writeResult.path, fallback: !!(writeResult as any).fallback });
  } catch (err: any) {
    console.error('waitlist POST error', err);
    return NextResponse.json({ ok: false, error: err?.message || 'unknown' }, { status: 500 });
  }
}
