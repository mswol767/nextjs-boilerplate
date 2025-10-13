import { NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';
import type { Event, ApiResponse } from '../../../types';
import { getEventsConfig, DEFAULT_EVENTS } from './config';

const EVENTS_FILE = path.join(process.cwd(), 'data', 'events.json');

// In-memory store for production environments
let inMemoryEvents: Event[] = [];
let hasInitializedDefaults = false;

// Initialize with default events for serverless environments
function initializeDefaultEvents(): void {
  if (!hasInitializedDefaults) {
    inMemoryEvents = [...DEFAULT_EVENTS];
    hasInitializedDefaults = true;
  }
}

// Helper function to read events
async function readEvents(): Promise<Event[]> {
  const config = getEventsConfig();
  
  if (config.useInMemory) {
    // In serverless, use in-memory store
    return inMemoryEvents;
  }

  if (config.useFileSystem) {
    try {
      const data = await fs.readFile(EVENTS_FILE, 'utf8');
      const events = JSON.parse(data);
      // Convert start dates back to Date objects
      return events.map((event: any) => ({
        ...event,
        start: new Date(event.start)
      }));
    } catch (error) {
      // If file doesn't exist, return empty array
      return [];
    }
  }

  // Fallback to in-memory store
  return inMemoryEvents;
}

// Helper function to write events
async function writeEvents(events: Event[]): Promise<void> {
  const config = getEventsConfig();
  
  if (config.useInMemory) {
    // In serverless, update in-memory store
    inMemoryEvents = events;
    return;
  }

  if (config.useFileSystem) {
    try {
      const dir = path.dirname(EVENTS_FILE);
      await fs.mkdir(dir, { recursive: true });
      
      // Convert Date objects to ISO strings for storage
      const eventsForStorage = events.map(event => ({
        ...event,
        start: event.start.toISOString()
      }));
      
      await fs.writeFile(EVENTS_FILE, JSON.stringify(eventsForStorage, null, 2), 'utf8');
    } catch (error) {
      console.error('Failed to write to file system, falling back to in-memory store:', error);
      // Fallback to in-memory store if file system write fails
      inMemoryEvents = events;
      hasInitializedDefaults = true; // Mark that we've modified events
    }
  } else {
    // Fallback to in-memory store
    inMemoryEvents = events;
    hasInitializedDefaults = true; // Mark that we've modified events
  }
}

// GET - Retrieve all events
export async function GET(): Promise<NextResponse<ApiResponse<Event[]>>> {
  try {
    const events = await readEvents();
    return NextResponse.json({ 
      ok: true, 
      data: events 
    });
  } catch (error: any) {
    console.error('Error reading events:', error);
    return NextResponse.json({ 
      ok: false, 
      error: error?.message || 'Failed to read events' 
    }, { status: 500 });
  }
}

// POST - Create a new event
export async function POST(req: Request): Promise<NextResponse<ApiResponse<Event>>> {
  try {
    const body = await req.json();
    const { title, description, start, durationMinutes }: Partial<Event> = body;

    // Validation
    if (!title || !start || !durationMinutes) {
      return NextResponse.json({ 
        ok: false, 
        error: 'Title, start date, and duration are required' 
      }, { status: 400 });
    }

    // Additional validation
    if (title.trim().length < 3) {
      return NextResponse.json({ 
        ok: false, 
        error: 'Title must be at least 3 characters long' 
      }, { status: 400 });
    }

    if (durationMinutes < 1 || durationMinutes > 1440) {
      return NextResponse.json({ 
        ok: false, 
        error: 'Duration must be between 1 and 1440 minutes (24 hours)' 
      }, { status: 400 });
    }

    const startDate = new Date(start);
    if (isNaN(startDate.getTime())) {
      return NextResponse.json({ 
        ok: false, 
        error: 'Invalid start date format' 
      }, { status: 400 });
    }

    const events = await readEvents();
    
    // Create new event
    const newEvent: Event = {
      id: `event-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      title: title.trim(),
      description: description?.trim() || '',
      start: new Date(start),
      durationMinutes: parseInt(durationMinutes.toString())
    };

    events.push(newEvent);
    await writeEvents(events);

    return NextResponse.json({ 
      ok: true, 
      data: newEvent 
    });
  } catch (error: any) {
    console.error('Error creating event:', error);
    return NextResponse.json({ 
      ok: false, 
      error: error?.message || 'Failed to create event' 
    }, { status: 500 });
  }
}

// PUT - Update an existing event
export async function PUT(req: Request): Promise<NextResponse<ApiResponse<Event>>> {
  try {
    const body = await req.json();
    const { id, title, description, start, durationMinutes }: Partial<Event> & { id: string } = body;

    if (!id) {
      return NextResponse.json({ 
        ok: false, 
        error: 'Event ID is required' 
      }, { status: 400 });
    }

    // Validation for update fields
    if (title && title.trim().length < 3) {
      return NextResponse.json({ 
        ok: false, 
        error: 'Title must be at least 3 characters long' 
      }, { status: 400 });
    }

    if (durationMinutes && (durationMinutes < 1 || durationMinutes > 1440)) {
      return NextResponse.json({ 
        ok: false, 
        error: 'Duration must be between 1 and 1440 minutes (24 hours)' 
      }, { status: 400 });
    }

    if (start) {
      const startDate = new Date(start);
      if (isNaN(startDate.getTime())) {
        return NextResponse.json({ 
          ok: false, 
          error: 'Invalid start date format' 
        }, { status: 400 });
      }
    }

    const events = await readEvents();
    const eventIndex = events.findIndex(event => event.id === id);

    if (eventIndex === -1) {
      return NextResponse.json({ 
        ok: false, 
        error: 'Event not found' 
      }, { status: 404 });
    }

    // Update event
    const updatedEvent: Event = {
      ...events[eventIndex],
      title: title?.trim() || events[eventIndex].title,
      description: description?.trim() || events[eventIndex].description,
      start: start ? new Date(start) : events[eventIndex].start,
      durationMinutes: durationMinutes ? parseInt(durationMinutes.toString()) : events[eventIndex].durationMinutes
    };

    events[eventIndex] = updatedEvent;
    await writeEvents(events);

    return NextResponse.json({ 
      ok: true, 
      data: updatedEvent 
    });
  } catch (error: any) {
    console.error('Error updating event:', error);
    return NextResponse.json({ 
      ok: false, 
      error: error?.message || 'Failed to update event' 
    }, { status: 500 });
  }
}

// DELETE - Delete an event
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

    const events = await readEvents();
    const eventIndex = events.findIndex(event => event.id === id);

    if (eventIndex === -1) {
      return NextResponse.json({ 
        ok: false, 
        error: 'Event not found' 
      }, { status: 404 });
    }

    events.splice(eventIndex, 1);
    await writeEvents(events);

    return NextResponse.json({ 
      ok: true 
    });
  } catch (error: any) {
    console.error('Error deleting event:', error);
    return NextResponse.json({ 
      ok: false, 
      error: error?.message || 'Failed to delete event' 
    }, { status: 500 });
  }
}
