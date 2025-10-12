import { NextResponse } from 'next/server';
import type { ApiResponse } from '../../../../types';

interface LoginRequest {
  password: string;
}

export async function POST(req: Request): Promise<NextResponse<ApiResponse>> {
  try {
    const { password }: LoginRequest = await req.json();
    const expected = process.env.ADMIN_PASS || '';
    
    if (!expected) {
      return NextResponse.json({ 
        ok: false, 
        error: 'Admin password not configured' 
      }, { status: 500 });
    }
    
    if (password !== expected) {
      return NextResponse.json({ 
        ok: false, 
        error: 'Invalid password' 
      }, { status: 401 });
    }

    const res = NextResponse.json({ ok: true });
    // set a simple auth cookie (not httpOnly in this simple example due to client-side checks)
    // In production you'd set httpOnly, secure cookies via server-only logic.
    res.cookies.set('admin_auth', '1', { 
      path: '/', 
      httpOnly: true, 
      secure: process.env.NODE_ENV === 'production', 
      maxAge: 60 * 60 
    });
    return res;
  } catch (err: any) {
    return NextResponse.json({ 
      ok: false, 
      error: err?.message || 'unknown' 
    }, { status: 500 });
  }
}
