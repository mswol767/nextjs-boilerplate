import { NextResponse } from 'next/server';

type Contact = { name: string; email: string; subject: string; message: string };

export async function POST(req: Request) {
  try {
    const data: Contact = await req.json();
    const { name, email, subject, message } = data;
    if (!name || !email || !subject || !message) {
      return NextResponse.json({ ok: false, error: 'Missing fields' }, { status: 400 });
    }

    // If SMTP is configured, attempt to send via nodemailer
    const smtpHost = process.env.SMTP_HOST;
    const smtpUser = process.env.SMTP_USER;
    const smtpPass = process.env.SMTP_PASS;

    if (smtpHost && smtpUser && smtpPass) {
      // dynamically import nodemailer to avoid bundling in client
      const nodemailer = await import('nodemailer');
      const transporter = nodemailer.createTransport({
        host: smtpHost,
        port: Number(process.env.SMTP_PORT || 587),
        secure: process.env.SMTP_SECURE === 'true',
        auth: { user: smtpUser, pass: smtpPass }
      });

      const from = `${name} <${email}>`;
      const to = process.env.CONTACT_TO || 'cromwellfgc@gmail.com';
      const info = await transporter.sendMail({ from, to, subject: `[Website Contact] ${subject}`, text: message });
      return NextResponse.json({ ok: true, info });
    }

    // No SMTP: return mailto fallback info
    const mailto = `mailto:${encodeURIComponent(process.env.CONTACT_TO || 'cromwellfgc@gmail.com')}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(`From: ${name} <${email}\n\n${message}`)}`;
    return NextResponse.json({ ok: false, fallback: { mailto } }, { status: 200 });
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: err?.message || 'unknown' }, { status: 500 });
  }
}
