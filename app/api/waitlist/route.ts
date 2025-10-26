import { NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';
import os from 'os';
import nodemailer from 'nodemailer';
import type { WaitEntry, WaitlistFormData, WaitlistResponse } from '../../../types';

// Dynamically import google APIs when needed
let googleSheets: any = null;
async function getGoogleSheets() {
  if (googleSheets) return googleSheets;
  try {
    const { google } = await import('googleapis');
    googleSheets = google.sheets('v4');
    return googleSheets;
  } catch (err) {
    return null;
  }
}

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
  const header = ['id', 'name', 'email', 'phone', 'address', 'town', 'state', 'createdAt'];
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

export async function POST(req: Request): Promise<NextResponse<WaitlistResponse>> {
  try {
    const body = await req.json();
    const { name, email, phone, address, town, state, captchaToken }: WaitlistFormData = body;

    if (!name || !email) {
      return NextResponse.json({ 
        ok: false, 
        error: 'Name and email are required' 
      }, { status: 400 });
    }

    // Verify CAPTCHA token
    if (!captchaToken) {
      return NextResponse.json({ 
        ok: false, 
        error: 'CAPTCHA verification is required' 
      }, { status: 400 });
    }

    // Verify CAPTCHA with Google (v3)
    const recaptchaSecret = process.env.RECAPTCHA_SECRET_KEY;
    if (recaptchaSecret) {
      try {
        const recaptchaResponse = await fetch('https://www.google.com/recaptcha/api/siteverify', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          body: `secret=${recaptchaSecret}&response=${captchaToken}`,
        });

        const recaptchaResult = await recaptchaResponse.json();
        
        if (!recaptchaResult.success) {
          return NextResponse.json({ 
            ok: false, 
            error: 'Security verification failed. Please try again.' 
          }, { status: 400 });
        }

        // For v3, also check the score (0.0 to 1.0, where 1.0 is very likely a good interaction)
        const score = recaptchaResult.score || 0;
        const minScore = 0.5; // Adjust this threshold as needed
        
        if (score < minScore) {
          console.log(`reCAPTCHA score too low: ${score} (minimum: ${minScore})`);
          return NextResponse.json({ 
            ok: false, 
            error: 'Security verification failed. Please try again.' 
          }, { status: 400 });
        }
      } catch (err) {
        console.error('CAPTCHA verification error:', err);
        return NextResponse.json({ 
          ok: false, 
          error: 'Security verification failed. Please try again.' 
        }, { status: 400 });
      }
    }

    const entry: WaitEntry = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      name: String(name),
      email: String(email),
      phone: phone ? String(phone) : undefined,
      address: address ? String(address) : undefined,
      town: town ? String(town) : undefined,
      state: state ? String(state) : undefined,
      createdAt: new Date().toISOString(),
    };

    const storePath = path.join(process.cwd(), 'data', 'waitlist.json');
    const store = await readStore(storePath);
    store.push(entry);
    // If a Google Apps Script web-app URL is provided, try forwarding the entry there first.
    // This lets you deploy a small Apps Script (owned by your Gmail) that appends rows to a sheet.
    const webAppUrl = process.env.WEB_APP_URL;
    // If Google Sheets configured, try to append there (service-account) as a fallback
    const sheetId = process.env.SHEET_ID;
    const saJsonBase64 = process.env.GOOGLE_SERVICE_ACCOUNT;
    let sheetAppended = false;

    if (webAppUrl) {
      try {
        const resp = await fetch(webAppUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ entry }),
        });
        if (resp.ok) {
          sheetAppended = true;
        } else {
          console.error('Web-app append failed, status', resp.status, await resp.text());
        }
      } catch (err: any) {
        console.error('Web-app append error', err?.message || err);
      }
    }

    // If web-app wasn't used or failed, try the service-account Sheets append when configured
    if (!sheetAppended && sheetId && saJsonBase64) {
      try {
        const sheets = await getGoogleSheets();
        if (sheets) {
          const keyJson = Buffer.from(saJsonBase64, 'base64').toString('utf8');
          const auth = new (await import('google-auth-library')).JWT({
            email: JSON.parse(keyJson).client_email,
            key: JSON.parse(keyJson).private_key,
            scopes: ['https://www.googleapis.com/auth/spreadsheets'],
          });
          await auth.authorize();
          await sheets.spreadsheets.values.append({
            spreadsheetId: sheetId,
            range: 'Sheet1!A:H',
            valueInputOption: 'RAW',
            requestBody: {
              values: [[entry.id, entry.name, entry.email, entry.phone || '', entry.address || '', entry.town || '', entry.state || '', entry.createdAt]]
            },
            auth,
          });
          sheetAppended = true;
        }
      } catch (err: any) {
        console.error('Sheets append failed, falling back to file:', err?.message || err);
      }
    }

    const writeResult = await writeStore(storePath, store);

    // If SMTP configured, try to send an email notification about the new entry
    let mailed = false;
    try {
      const smtpHost = process.env.SMTP_HOST;
      const smtpPort = process.env.SMTP_PORT ? parseInt(process.env.SMTP_PORT, 10) : undefined;
      const smtpUser = process.env.SMTP_USER;
      const smtpPass = process.env.SMTP_PASS;
      const emailTo = process.env.EMAIL_TO; // recipient

      if (smtpHost && smtpPort && smtpUser && smtpPass && emailTo) {
        const transporter = nodemailer.createTransport({
          host: smtpHost,
          port: smtpPort,
          secure: smtpPort === 465, // true for 465, false for other ports
          auth: { user: smtpUser, pass: smtpPass },
        });

  const text = `New waitlist entry:\n\nName: ${entry.name}\nEmail: ${entry.email}\nPhone: ${entry.phone || ''}\nAddress: ${entry.address || ''}\nTown: ${entry.town || ''}\nState: ${entry.state || ''}\nCreatedAt: ${entry.createdAt}`;

        await transporter.sendMail({
          from: smtpUser,
          to: emailTo,
          subject: `New waitlist entry: ${entry.name}`,
          text,
        });
        mailed = true;
      }
    } catch (err: any) {
      console.error('Failed to send waitlist email', err?.message || err);
    }

    // Inform caller where we persisted (or if it fell back to tmp) and sheet status
    return NextResponse.json({ 
      ok: true, 
      entry, 
      persistedTo: writeResult.path, 
      fallback: !!(writeResult as any).fallback, 
      sheetAppended, 
      mailed 
    });
  } catch (err: any) {
    console.error('waitlist POST error', err);
    return NextResponse.json({ 
      ok: false, 
      error: err?.message || 'unknown' 
    }, { status: 500 });
  }
}
