# CAPTCHA Setup for Waitlist Form

This project now includes Google reCAPTCHA v2 integration to prevent spam submissions on the waitlist form.

## Setup Instructions

### 1. Get reCAPTCHA Keys

1. Go to [Google reCAPTCHA Admin Console](https://www.google.com/recaptcha/admin)
2. Click "Create" to add a new site
3. Choose "reCAPTCHA v2" → "I'm not a robot" Checkbox
4. Add your domain(s) to the domain list
5. Copy the **Site Key** and **Secret Key**

### 2. Environment Variables

Add these environment variables to your `.env.local` file:

```bash
# Google reCAPTCHA Configuration
NEXT_PUBLIC_RECAPTCHA_SITE_KEY=your_site_key_here
RECAPTCHA_SECRET_KEY=your_secret_key_here
```

### 3. Development vs Production

- **Development**: The form will work with Google's test keys if no environment variables are set
- **Production**: You must set up your own reCAPTCHA keys for your domain

### 4. How It Works

1. **Frontend**: The reCAPTCHA widget appears on the waitlist form
2. **User Interaction**: Users must complete the "I'm not a robot" challenge
3. **Token Generation**: Google generates a token when the challenge is completed
4. **Server Verification**: The API route verifies the token with Google's servers
5. **Submission**: Only verified submissions are processed

### 5. Security Features

- **Client-side validation**: Form won't submit without CAPTCHA completion
- **Server-side verification**: Double-check with Google's API
- **Token expiration**: CAPTCHA tokens expire after 2 minutes
- **Error handling**: Clear error messages for failed verification

### 6. Customization

The CAPTCHA component can be customized in `components/WaitlistForm.tsx`:

```tsx
<ReCAPTCHA
  sitekey={process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY}
  onChange={(token) => setCaptchaToken(token)}
  theme="light"        // or "dark"
  size="normal"        // or "compact"
/>
```

### 7. Testing

- Use Google's test keys for development
- Test with different browsers and devices
- Verify that submissions are blocked without CAPTCHA completion

## Troubleshooting

### Common Issues

1. **"CAPTCHA verification failed"**
   - Check that your secret key is correct
   - Ensure your domain is added to the reCAPTCHA site settings
   - Verify the token hasn't expired

2. **CAPTCHA not loading**
   - Check your site key is correct
   - Ensure your domain is whitelisted
   - Check browser console for errors

3. **Development issues**
   - The form includes a fallback test key for development
   - Make sure to use your own keys for production

### Support

For reCAPTCHA-specific issues, refer to [Google's reCAPTCHA documentation](https://developers.google.com/recaptcha/docs/display).
