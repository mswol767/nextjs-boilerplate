import { NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';
import os from 'os';
import { cookies } from 'next/headers';

const TMP_DIR = path.join(os.tmpdir(), 'members_files');

export async function GET(req: Request) {
  // require admin_auth cookie
  const cookieStore = await cookies();
  const auth = cookieStore.get('admin_auth');
  if (!auth) return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });
  try {
    const url = new URL(req.url);
    const name = url.searchParams.get('name');
    if (!name) return NextResponse.json({ ok: false, error: 'Missing name' }, { status: 400 });
    const filePath = path.join(TMP_DIR, name);
  const data = await fs.readFile(filePath);
  // convert Node Buffer to Uint8Array for Web Response compatibility
  const uint8 = new Uint8Array(data.buffer, data.byteOffset, data.byteLength);
  // cast to any to satisfy TypeScript BodyInit typing
  return new Response(uint8 as any, { status: 200, headers: { 'Content-Type': 'application/pdf', 'Content-Disposition': `attachment; filename="${name}"` } });
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: err?.message || 'not found' }, { status: 404 });
  }
}
