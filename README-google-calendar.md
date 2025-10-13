# Google Calendar Integration Setup

To display events from your Google Calendar on the website, follow these steps:

## 1. Get Google Calendar API Key

1. Go to [Google Cloud Console](https://console.developers.google.com/)
2. Create a new project or select an existing one
3. Enable the Google Calendar API:
   - Go to "APIs & Services" > "Library"
   - Search for "Google Calendar API"
   - Click on it and press "Enable"
4. Create credentials:
   - Go to "APIs & Services" > "Credentials"
   - Click "Create Credentials" > "API Key"
   - Copy the API key

## 2. Make Your Calendar Public

1. Open [Google Calendar](https://calendar.google.com)
2. Find your calendar in the left sidebar
3. Click the three dots next to your calendar name
4. Select "Settings and sharing"
5. Under "Access permissions for events", check "Make available to public"
6. Note your calendar ID (usually your email address)

## 3. Set Environment Variables

Create a `.env.local` file in your project root with:

```
GOOGLE_API_KEY=your_api_key_here
GOOGLE_CALENDAR_ID=cromwellfgc@gmail.com
```

## 4. Deploy to Vercel

If deploying to Vercel, add these environment variables in your Vercel dashboard:
- Go to your project settings
- Navigate to "Environment Variables"
- Add `GOOGLE_API_KEY` and `GOOGLE_CALENDAR_ID`

## How It Works

- The website will first try to fetch events from your Google Calendar
- If that fails, it falls back to the static events API
- Events are automatically updated when you add/remove them in Google Calendar
- The "View Full Calendar" button links directly to your Google Calendar

## Troubleshooting

- Make sure your calendar is public
- Verify your API key is correct
- Check that the Google Calendar API is enabled in your Google Cloud project
- Events will only show if they have a start time and are within the next 3 months
