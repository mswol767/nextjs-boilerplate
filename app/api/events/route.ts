import { NextResponse } from 'next/server';
import type { Event, ApiResponse } from '../../../types';

// Simple in-memory storage for events
let events: Event[] = [
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
  },
  {
    id: 'spring-cleanup',
    title: 'Spring Property Cleanup',
    description: 'Help us clean up the club property and prepare for the spring season.',
    start: new Date('2025-03-15T09:00:00')
  },
  {
    id: 'youth-fishing',
    title: 'Youth Fishing Day',
    description: 'A special day for young anglers to learn fishing skills and enjoy the outdoors.',
    start: new Date('2025-03-22T10:00:00')
  }
];

// GET /api/events
export async function GET(): Promise<NextResponse<ApiResponse>> {
  try {
    return NextResponse.json({ 
      ok: true, 
      data: events 
    });
  } catch (error) {
    console.error('Error fetching events:', error);
    return NextResponse.json({ 
      ok: false, 
      error: 'Failed to fetch events' 
    }, { status: 500 });
  }
}

// POST /api/events
export async function POST(req: Request): Promise<NextResponse<ApiResponse>> {
  try {
    const body = await req.json();
    const { title, description, start } = body;
    
    if (!title || !start) {
      return NextResponse.json({ 
        ok: false, 
        error: 'Title and start date are required' 
      }, { status: 400 });
    }
    
    const newEvent: Event = {
      id: `event-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      title,
      description: description || '',
      start: new Date(start)
    };
    
    events.push(newEvent);
    
    return NextResponse.json({ 
      ok: true, 
      data: newEvent 
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating event:', error);
    return NextResponse.json({ 
      ok: false, 
      error: 'Failed to create event' 
    }, { status: 500 });
  }
}

// PUT /api/events
export async function PUT(req: Request): Promise<NextResponse<ApiResponse>> {
  try {
    const body = await req.json();
    const { id, title, description, start } = body;
    
    if (!id || !title || !start) {
      return NextResponse.json({ 
        ok: false, 
        error: 'ID, title, and start date are required' 
      }, { status: 400 });
    }
    
    const eventIndex = events.findIndex(event => event.id === id);
    
    if (eventIndex === -1) {
      return NextResponse.json({ 
        ok: false, 
        error: 'Event not found' 
      }, { status: 404 });
    }
    
    const updatedEvent: Event = {
      id,
      title,
      description: description || '',
      start: new Date(start)
    };
    
    events[eventIndex] = updatedEvent;
    
    return NextResponse.json({ 
      ok: true, 
      data: updatedEvent 
    });
  } catch (error) {
    console.error('Error updating event:', error);
    return NextResponse.json({ 
      ok: false, 
      error: 'Failed to update event' 
    }, { status: 500 });
  }
}

// DELETE /api/events
export async function DELETE(req: Request): Promise<NextResponse<ApiResponse>> {
  try {
    const url = new URL(req.url);
    const id = url.searchParams.get('id');
    
    if (!id) {
      return NextResponse.json({ 
        ok: false, 
        error: 'Event ID is required' 
      }, { status: 400 });
    }
    
    const eventIndex = events.findIndex(event => event.id === id);
    
    if (eventIndex === -1) {
      return NextResponse.json({ 
        ok: false, 
        error: 'Event not found' 
      }, { status: 404 });
    }
    
    events.splice(eventIndex, 1);
    
    return NextResponse.json({ 
      ok: true, 
      message: 'Event deleted successfully' 
    });
  } catch (error) {
    console.error('Error deleting event:', error);
    return NextResponse.json({ 
      ok: false, 
      error: 'Failed to delete event' 
    }, { status: 500 });
  }
}