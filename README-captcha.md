# CAPTCHA Setup for Waitlist Form

This project now includes Google reCAPTCHA v3 integration to prevent spam submissions on the waitlist form.

## Setup Instructions

### 1. Get reCAPTCHA Keys

1. Go to [Google reCAPTCHA Admin Console](https://www.google.com/recaptcha/admin)
2. Click "Create" to add a new site
3. Choose "reCAPTCHA v3"
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

1. **Frontend**: reCAPTCHA v3 runs invisibly in the background
2. **User Interaction**: No user interaction required - it analyzes user behavior
3. **Token Generation**: Google generates a token with a score (0.0-1.0) when form is submitted
4. **Server Verification**: The API route verifies the token and checks the score
5. **Submission**: Only submissions with scores above 0.5 are processed

### 5. Security Features

- **Invisible protection**: No user interaction required
- **Behavioral analysis**: Analyzes user behavior patterns
- **Score-based filtering**: Blocks submissions with low trust scores
- **Server-side verification**: Double-check with Google's API
- **Token expiration**: CAPTCHA tokens expire after 2 minutes
- **Error handling**: Clear error messages for failed verification

### 6. Customization

The score threshold can be adjusted in `app/api/waitlist/route.ts`:

```typescript
const minScore = 0.5; // Adjust this threshold as needed (0.0 to 1.0)
```

**Score Guidelines:**
- **0.9-1.0**: Very likely a good interaction
- **0.7-0.9**: Likely a good interaction  
- **0.5-0.7**: Neutral
- **0.1-0.5**: Likely a bot
- **0.0-0.1**: Very likely a bot

### 7. Testing

- Use Google's test keys for development
- Test with different browsers and devices
- Monitor the score values in your server logs
- Test with legitimate users to ensure they pass the score threshold

## Troubleshooting

### Common Issues

1. **"Security verification failed"**
   - Check that your secret key is correct
   - Ensure your domain is added to the reCAPTCHA site settings
   - Verify the token hasn't expired
   - Check if the score is below the threshold (0.5)

2. **Low scores from legitimate users**
   - Consider lowering the score threshold
   - Monitor your analytics to find the right balance
   - Some users may have privacy settings that affect scoring

3. **Development issues**
   - The form includes a fallback test key for development
   - Make sure to use your own keys for production
   - Test keys always return a score of 0.9

### Support

For reCAPTCHA-specific issues, refer to [Google's reCAPTCHA documentation](https://developers.google.com/recaptcha/docs/display).
