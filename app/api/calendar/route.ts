import { NextResponse } from 'next/server';
import { google } from 'googleapis';
import type { Event, ApiResponse } from '../../../types';

// Google Calendar API configuration
const GOOGLE_CALENDAR_ID = process.env.GOOGLE_CALENDAR_ID || 'cromwellfgc@gmail.com';
const GOOGLE_API_KEY = process.env.GOOGLE_API_KEY;

// GET /api/calendar - Fetch events from Google Calendar
export async function GET(): Promise<NextResponse<ApiResponse<Event[]>>> {
  try {
    // Check if API key is configured
    if (!GOOGLE_API_KEY) {
      console.warn('Google Calendar API key not configured, using fallback events');
      return NextResponse.json({
        ok: false,
        error: 'Google Calendar API not configured',
      }, { status: 503 });
    }

    // Initialize Google Calendar API
    const calendar = google.calendar({ version: 'v3', auth: GOOGLE_API_KEY });

    // Get current date and 3 months from now
    const now = new Date();
    const threeMonthsFromNow = new Date();
    threeMonthsFromNow.setMonth(now.getMonth() + 3);

    // Fetch events from Google Calendar
    const response = await calendar.events.list({
      calendarId: GOOGLE_CALENDAR_ID,
      timeMin: now.toISOString(),
      timeMax: threeMonthsFromNow.toISOString(),
      singleEvents: true,
      orderBy: 'startTime',
      maxResults: 50,
    });

    const events = response.data.items || [];

    // Transform Google Calendar events to our Event format
    const transformedEvents: Event[] = events
      .filter(event => event.start && (event.start.dateTime || event.start.date))
      .map(event => {
        const startDate = event.start?.dateTime 
          ? new Date(event.start.dateTime)
          : new Date(event.start?.date + 'T00:00:00');

        return {
          id: event.id || `event-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
          title: event.summary || 'Untitled Event',
          description: event.description || '',
          start: startDate,
        };
      });

    return NextResponse.json({
      ok: true,
      data: transformedEvents,
    });

  } catch (error: any) {
    console.error('Error fetching Google Calendar events:', error);
    
    // Return fallback events if Google Calendar fails
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
