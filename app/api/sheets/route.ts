import { NextResponse } from 'next/server';
import type { Event, ApiResponse } from '../../../types';

// Google Sheets configuration
const GOOGLE_SHEETS_ID = process.env.GOOGLE_SHEETS_ID || '1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms'; // Example sheet ID
const GOOGLE_API_KEY = process.env.GOOGLE_API_KEY;

// GET /api/sheets - Fetch events from Google Spreadsheet
export async function GET(): Promise<NextResponse<ApiResponse<Event[]>>> {
  try {
    // Check if API key is configured
    if (!GOOGLE_API_KEY) {
      console.warn('Google API key not configured, using fallback events');
      return NextResponse.json({
        ok: false,
        error: 'Google API key not configured',
      }, { status: 503 });
    }

    // Fetch data from Google Sheets (using Sheet1 as default)
    const response = await fetch(
      `https://sheets.googleapis.com/v4/spreadsheets/${GOOGLE_SHEETS_ID}/values/Sheet1!A:D?key=${GOOGLE_API_KEY}`
    );

    if (!response.ok) {
      throw new Error(`Google Sheets API error: ${response.status}`);
    }

    const data = await response.json();
    const rows = data.values || [];

    // Skip header row and transform data
    const events: Event[] = rows
      .slice(1) // Skip header row
      .filter((row: any[]) => row.length >= 3 && row[0] && row[1] && row[2]) // Ensure required fields exist
      .map((row: any[], index: number) => {
        const [title, description, dateTime, id] = row;
        
        // Parse the date/time - expecting format like "2025-02-15 19:00" or "2025-02-15T19:00:00"
        let startDate: Date;
        try {
          // Try parsing as ISO string first
          if (dateTime.includes('T')) {
            startDate = new Date(dateTime);
          } else {
            // Parse as "YYYY-MM-DD HH:MM" format and treat as Eastern Time
            const [datePart, timePart] = dateTime.split(' ');
            const [year, month, day] = datePart.split('-').map(Number);
            const [hours, minutes] = timePart.split(':').map(Number);
            
            // Create a date object and convert to Eastern Time
            // First create as if it's in Eastern Time, then convert to UTC for storage
            const tempDate = new Date(year, month - 1, day, hours, minutes);
            
            // Get the timezone offset for Eastern Time (EST is UTC-5, EDT is UTC-4)
            // For simplicity, we'll use EST (UTC-5) - you can adjust this if needed
            const easternOffset = 5 * 60; // 5 hours in minutes
            const utcTime = tempDate.getTime() + (easternOffset * 60 * 1000);
            startDate = new Date(utcTime);
          }
        } catch (error) {
          console.error('Error parsing date:', dateTime, error);
          // Fallback to current date + index days
          startDate = new Date();
          startDate.setDate(startDate.getDate() + index);
        }

        return {
          id: id || `event-${index}-${Date.now()}`,
          title: title.trim(),
          description: description?.trim() || '',
          start: startDate,
        };
      })
      .filter((event: Event) => {
        // Only include future events or events from the last 30 days
        const now = new Date();
        const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        return event.start >= monthAgo;
      })
      .sort((a: Event, b: Event) => a.start.getTime() - b.start.getTime()); // Sort by date

    return NextResponse.json({
      ok: true,
      data: events,
    });

  } catch (error: any) {
    console.error('Error fetching Google Sheets events:', error);
    
    // Return fallback events if Google Sheets fails
    const fallbackEvents: Event[] = [
      {
        id: 'monthly-meeting',
        title: 'Monthly Club Meeting',
        description: 'Join us for our monthly club meeting to discuss upcoming events and club business.',
        start: new Date('2025-02-15T19:00:00')
      },
      {
        id: 'hunting-season',
        title: 'Hunting Season Kickoff',
        description: 'Celebrate the start of hunting season with food, drinks, and planning sessions.',
        start: new Date('2025-02-20T18:00:00')
      },
      {
        id: 'annual-banquet',
        title: 'Annual Club Banquet',
        description: 'Our annual celebration with awards, dinner, and entertainment for all members.',
        start: new Date('2025-02-25T17:00:00')
      }
    ];

    return NextResponse.json({
      ok: true,
      data: fallbackEvents,
    });
  }
}
