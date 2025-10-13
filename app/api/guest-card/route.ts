import { NextResponse } from 'next/server';
import type { ApiResponse } from '../../../types';

interface GuestCardEmailData {
  guestName: string;
  memberName: string;
  huntDate: string;
  huntType: string;
  phoneNumber: string;
  issueDate: string;
}

export async function POST(req: Request): Promise<NextResponse<ApiResponse>> {
  try {
    const data: GuestCardEmailData = await req.json();
    
    // Validate required fields
    if (!data.guestName || !data.memberName || !data.huntDate || !data.huntType || !data.phoneNumber) {
      return NextResponse.json({
        ok: false,
        error: 'All fields are required',
      }, { status: 400 });
    }

    const smtpHost = process.env.SMTP_HOST;
    const smtpPort = process.env.SMTP_PORT ? parseInt(process.env.SMTP_PORT, 10) : undefined;
    const smtpUser = process.env.SMTP_USER;
    const smtpPass = process.env.SMTP_PASS;
    const emailTo = process.env.EMAIL_TO || 'cromwellfgc@gmail.com';

    // Calculate cost based on hunt type
    const getHuntCost = (huntType: string): string => {
      if (huntType === 'Pheasant Hunt') return '$50';
      if (huntType === 'Opening Day of Duck') return '$100';
      return 'N/A';
    };
    const cost = getHuntCost(data.huntType);

    // Format the email content
    const emailSubject = `New Guest Card Generated - ${data.guestName}`;
    const emailBody = `
New Guest Card Generated

Guest Information:
------------------
Guest Name: ${data.guestName}
Phone Number: ${data.phoneNumber}
Sponsored By: ${data.memberName}
Type of Hunt: ${data.huntType}
Cost: ${cost}
Date of Hunt: ${new Date(data.huntDate).toLocaleDateString('en-US', { 
  year: 'numeric', 
  month: 'long', 
  day: 'numeric' 
})}
Issue Date: ${new Date(data.issueDate).toLocaleDateString('en-US', { 
  year: 'numeric', 
  month: 'long', 
  day: 'numeric' 
})}

------------------
Generated at: ${new Date().toLocaleString('en-US', { 
  timeZone: 'America/New_York',
  year: 'numeric',
  month: 'long',
  day: 'numeric',
  hour: '2-digit',
  minute: '2-digit'
})} EST
    `.trim();

    // Use SMTP if configured (same as contact/waitlist forms)
    if (smtpHost && smtpPort && smtpUser && smtpPass) {
      const nodemailer = await import('nodemailer');
      const transporter = nodemailer.createTransport({
        host: smtpHost,
        port: smtpPort,
        secure: smtpPort === 465,
        auth: { user: smtpUser, pass: smtpPass },
      });

      await transporter.sendMail({
        from: smtpUser,
        to: emailTo,
        subject: emailSubject,
        text: emailBody,
      });

      console.log('Guest card email sent successfully to:', emailTo);

      return NextResponse.json({
        ok: true,
        data: { message: 'Email sent successfully' },
      });
    } else {
      // No SMTP configured: Just log the email content
      console.log('=== Guest Card Email (No SMTP Configured) ===');
      console.log('To:', emailTo);
      console.log('Subject:', emailSubject);
      console.log('Body:\n', emailBody);
      console.log('================================================');

      return NextResponse.json({
        ok: true,
        data: { message: 'Email logged (no SMTP configured)' },
      });
    }
  } catch (error: any) {
    console.error('Error sending guest card email:', error);
    return NextResponse.json({
      ok: false,
      error: error?.message || 'Failed to send email',
    }, { status: 500 });
  }
}

