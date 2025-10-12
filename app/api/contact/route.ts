import { NextResponse } from 'next/server';
import type { ContactFormData, ContactResponse } from '../../../types';

export async function POST(req: Request): Promise<NextResponse<ContactResponse>> {
  try {
    const body = await req.json();
    const { name, email, subject, message }: ContactFormData = body;
    
    if (!name || !email || !message) {
      return NextResponse.json({ 
        ok: false, 
        error: 'Name, email and message are required' 
      }, { status: 400 });
    }

    const smtpHost = process.env.SMTP_HOST;
    const smtpPort = process.env.SMTP_PORT ? parseInt(process.env.SMTP_PORT, 10) : undefined;
    const smtpUser = process.env.SMTP_USER;
    const smtpPass = process.env.SMTP_PASS;
    const emailTo = process.env.EMAIL_TO || process.env.CONTACT_TO || 'cromwellfgc@gmail.com';

    // If SMTP configured, try to send. Otherwise return a mailto fallback payload for client-side handling.
    if (smtpHost && smtpPort && smtpUser && smtpPass) {
      const nodemailer = await import('nodemailer');
      const transporter = nodemailer.createTransport({
        host: smtpHost,
        port: smtpPort,
        secure: smtpPort === 465,
        auth: { user: smtpUser, pass: smtpPass },
      });

      const text = `Contact message from ${name} <${email}>\n\nSubject: ${subject || ''}\n\n${message}`;
      await transporter.sendMail({
        from: smtpUser,
        to: emailTo,
        subject: subject ? `Website contact: ${subject}` : `Website contact from ${name}`,
        text,
        replyTo: email,
      });

      return NextResponse.json({ 
        ok: true, 
        mailed: true 
      });
    }

    // No SMTP: return a mailto fallback so the client can open the user's mail client if desired
    const mailto = `mailto:${encodeURIComponent(emailTo)}?subject=${encodeURIComponent(subject || 'Website contact')}&body=${encodeURIComponent(`From: ${name} <${email}>\n\n${message}`)}`;
    return NextResponse.json({ 
      ok: false, 
      fallback: { mailto } 
    }, { status: 200 });
  } catch (err: any) {
    console.error('contact POST error', err);
    return NextResponse.json({ 
      ok: false, 
      error: err?.message || 'unknown' 
    }, { status: 500 });
  }
}
