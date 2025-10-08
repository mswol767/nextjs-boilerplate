import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { promises as fs } from 'fs';
import path from 'path';
import os from 'os';

type FileEntry = { name: string; url: string; size: number; createdAt: string; fallback?: boolean };

const PUBLIC_DIR = path.join(process.cwd(), 'public', 'members_files');
const TMP_DIR = path.join(os.tmpdir(), 'members_files');

async function readDirSafe(dir: string) {
  try {
    await fs.mkdir(dir, { recursive: true });
    const names = await fs.readdir(dir);
    const files = await Promise.all(names.map(async (n) => {
      const stat = await fs.stat(path.join(dir, n));
      return { name: n, size: stat.size, createdAt: stat.birthtime.toISOString() };
    }));
    return files;
  } catch (err) {
    return [] as { name: string; size: number; createdAt: string }[];
  }
}

export async function GET() {
  // require admin_auth cookie
  const cookieStore = await cookies();
  const auth = cookieStore.get('admin_auth');
  if (!auth) return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });
  try {
    const publicFiles = await readDirSafe(PUBLIC_DIR);
    const tmpFiles = await readDirSafe(TMP_DIR);

    const entries: FileEntry[] = [];
    for (const f of publicFiles) {
      entries.push({ name: f.name, url: `/members_files/${encodeURIComponent(f.name)}`, size: f.size, createdAt: f.createdAt });
    }
    for (const f of tmpFiles) {
      // tmp files served via API
      entries.push({ name: f.name, url: `/api/members/uploads/file?name=${encodeURIComponent(f.name)}`, size: f.size, createdAt: f.createdAt, fallback: true });
    }

    // sort by createdAt desc
    entries.sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
    return NextResponse.json({ ok: true, files: entries });
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: err?.message || 'unknown' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  // require admin_auth cookie
  const cookieStore = await cookies();
  const auth = cookieStore.get('admin_auth');
  if (!auth) return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });
  try {
    const body = await req.json();
    const { filename, data } = body as { filename: string; data: string };
    if (!filename || !data) return NextResponse.json({ ok: false, error: 'Missing filename or data' }, { status: 400 });

    // only allow pdf
    const ext = path.extname(filename).toLowerCase();
    if (ext !== '.pdf') return NextResponse.json({ ok: false, error: 'Only PDF files allowed' }, { status: 400 });

    // data may be 'data:application/pdf;base64,...' or raw base64
    const base64 = data.includes(',') ? data.split(',')[1] : data;
    const buf = Buffer.from(base64, 'base64');
    // basic PDF magic check
    if (!buf.slice(0, 4).equals(Buffer.from('%PDF'))) {
      return NextResponse.json({ ok: false, error: 'Invalid PDF file' }, { status: 400 });
    }

    const safeName = filename.replace(/[^a-zA-Z0-9._-]/g, '_');
    const destPath = path.join(PUBLIC_DIR, safeName);
    try {
      await fs.mkdir(PUBLIC_DIR, { recursive: true });
      await fs.writeFile(destPath, buf);
      return NextResponse.json({ ok: true, name: safeName, url: `/members_files/${encodeURIComponent(safeName)}` });
    } catch (err: any) {
      // fallback to tmp dir
      if (err && (err.code === 'EROFS' || err.code === 'EACCES' || err.code === 'EPERM')) {
        await fs.mkdir(TMP_DIR, { recursive: true });
        const tmpPath = path.join(TMP_DIR, safeName);
        await fs.writeFile(tmpPath, buf);
        return NextResponse.json({ ok: true, name: safeName, url: `/api/members/uploads/file?name=${encodeURIComponent(safeName)}`, fallback: true });
      }
      throw err;
    }
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: err?.message || 'unknown' }, { status: 500 });
  }
}
