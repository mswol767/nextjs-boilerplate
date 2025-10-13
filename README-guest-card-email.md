# Guest Card Email Setup

The guest card generator automatically sends an email to `cromwellfgc@gmail.com` when a new guest card is created.

## Current Setup

The email functionality uses the **same SMTP configuration** as your contact and waitlist forms, so no additional setup is needed if those are already working!

### Email Modes

1. **With SMTP Configured** (Production)
   - Real emails are sent via your SMTP server
   - Uses the same nodemailer setup as contact/waitlist forms
   - No additional configuration needed

2. **Without SMTP** (Development)
   - Emails are logged to the console
   - Card generation still works normally
   - Useful for testing without sending real emails

## SMTP Configuration

The guest card email uses these environment variables from your `.env.local` file:

```env
SMTP_HOST=your-smtp-host.com
SMTP_PORT=587
SMTP_USER=your-email@example.com
SMTP_PASS=your-password
EMAIL_TO=cromwellfgc@gmail.com
```

**Note:** If these are already set up for your contact/waitlist forms, guest card emails will automatically work!

## Testing

1. Fill out the guest card form
2. Click "Generate Guest Card"
3. Check:
   - Console logs (development mode)
   - Email inbox at cromwellfgc@gmail.com (production mode)

## Email Content

The email includes:
- Guest Name
- Phone Number
- Sponsored By (Member Name)
- Type of Hunt
- Date of Hunt
- Issue Date
- Timestamp of when card was generated

## Troubleshooting

### Email not sending
1. Check console for error messages
2. Verify SMTP settings in `.env.local` are correct
3. Restart the development server after changing environment variables
4. Test your SMTP credentials with the contact form first

### Emails going to spam
1. Ensure your SMTP server has proper SPF and DKIM records
2. Use a verified email address for `SMTP_USER`
3. Contact your email provider if issues persist

## Email Sent To

By default, guest card emails are sent to the address specified in:
1. `EMAIL_TO` environment variable (if set)
2. Falls back to `cromwellfgc@gmail.com`

To change the recipient, update your `.env.local`:
```env
EMAIL_TO=your-email@example.com
```

