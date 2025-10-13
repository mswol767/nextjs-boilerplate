# Google Sheets Events Integration

This is much easier than Google Calendar! You can manage all your events in a simple Google Spreadsheet.

## 📊 How to Set Up Your Events Spreadsheet

### 1. Create a Google Spreadsheet

1. Go to [Google Sheets](https://sheets.google.com)
2. Create a new spreadsheet
3. Name it "Cromwell Fish & Game Club Events"

### 2. Set Up the Columns

Create these columns in row 1 (header row):

| A | B | C | D |
|---|---|---|---|
| **Title** | **Description** | **Date & Time** | **ID** |

### 3. Add Your Events

Fill in your events like this:

| Title | Description | Date & Time | ID |
|-------|-------------|-------------|-----|
| Monthly Club Meeting | Join us for our monthly club meeting to discuss upcoming events and club business. | 2025-02-15 19:00 | monthly-meeting |
| Hunting Season Kickoff | Celebrate the start of hunting season with food, drinks, and planning sessions. | 2025-02-20 18:00 | hunting-season |
| Annual Club Banquet | Our annual celebration with awards, dinner, and entertainment for all members. | 2025-02-25 17:00 | annual-banquet |

### 4. Make the Sheet Public

1. Click "Share" in the top-right corner
2. Click "Change to anyone with the link"
3. Set permission to "Viewer"
4. Copy the link

### 5. Get the Sheet ID

From your Google Sheets URL, copy the long ID between `/d/` and `/edit`:

```
https://docs.google.com/spreadsheets/d/1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms/edit
                                                                    ↑ This is your Sheet ID
```

### 6. Update Environment Variables

Update your `.env.local` file with your actual Sheet ID:

```
GOOGLE_API_KEY=AIzaSyAqNqqASZ_XEQnrKSQbXFKJ6ggJbsJSyPk
GOOGLE_SHEETS_ID=your_actual_sheet_id_here
GOOGLE_CALENDAR_ID=cromwellfgc@gmail.com
ADMIN_PASS=CFG2025
```

## 🎯 Date & Time Formats

You can use any of these formats for the Date & Time column:

- `2025-02-15 19:00` (recommended)
- `2025-02-15T19:00:00`
- `Feb 15, 2025 7:00 PM`

## ✅ Benefits of Google Sheets

- **Easy to edit** - Anyone can update events
- **No authentication** - Just need the sheet ID
- **Flexible** - Add custom columns if needed
- **Real-time** - Changes appear on website immediately
- **Collaborative** - Multiple people can manage events

## 🔄 How It Works

1. Website fetches data from your Google Sheet
2. Events are automatically sorted by date
3. Only future events (and events from last 7 days) are shown
4. Changes in the sheet appear on the website within minutes

## 🚀 For Vercel Deployment

Add these environment variables in your Vercel dashboard:
- `GOOGLE_API_KEY`
- `GOOGLE_SHEETS_ID`
- `ADMIN_PASS`
