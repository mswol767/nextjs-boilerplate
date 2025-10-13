import { NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';
import type { Event, ApiResponse } from '../../../types';

// Initialize the events table if it doesn't exist
async function initializeTable() {
  try {
    await sql`
      CREATE TABLE IF NOT EXISTS events (
        id VARCHAR(255) PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        start TIMESTAMP WITH TIME ZONE NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )
    `;
  } catch (error) {
    console.error('Error creating events table:', error);
  }
}

// GET /api/events
export async function GET(): Promise<NextResponse<ApiResponse>> {
  try {
    await initializeTable();
    
    const result = await sql`
      SELECT id, title, description, start, created_at, updated_at
      FROM events
      ORDER BY start ASC
    `;
    
    const events: Event[] = result.rows.map((row: any) => ({
      id: row.id,
      title: row.title,
      description: row.description || '',
      start: new Date(row.start)
    }));
    
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
    await initializeTable();
    
    const body = await req.json();
    const { title, description, start } = body;
    
    if (!title || !start) {
      return NextResponse.json({ 
        ok: false, 
        error: 'Title and start date are required' 
      }, { status: 400 });
    }
    
    const id = `event-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    const startDate = new Date(start);
    
    await sql`
      INSERT INTO events (id, title, description, start)
      VALUES (${id}, ${title}, ${description || ''}, ${startDate.toISOString()})
    `;
    
    const newEvent: Event = {
      id,
      title,
      description: description || '',
      start: startDate
    };
    
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
    await initializeTable();
    
    const body = await req.json();
    const { id, title, description, start } = body;
    
    if (!id || !title || !start) {
      return NextResponse.json({ 
        ok: false, 
        error: 'ID, title, and start date are required' 
      }, { status: 400 });
    }
    
    const startDate = new Date(start);
    
    const result = await sql`
      UPDATE events 
      SET title = ${title}, 
          description = ${description || ''}, 
          start = ${startDate.toISOString()},
          updated_at = NOW()
      WHERE id = ${id}
      RETURNING id, title, description, start
    `;
    
    if (result.rows.length === 0) {
      return NextResponse.json({ 
        ok: false, 
        error: 'Event not found' 
      }, { status: 404 });
    }
    
    const updatedEvent: Event = {
      id: result.rows[0].id,
      title: result.rows[0].title,
      description: result.rows[0].description || '',
      start: new Date(result.rows[0].start)
    };
    
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
    await initializeTable();
    
    const url = new URL(req.url);
    const id = url.searchParams.get('id');
    
    if (!id) {
      return NextResponse.json({ 
        ok: false, 
        error: 'Event ID is required' 
      }, { status: 400 });
    }
    
    const result = await sql`
      DELETE FROM events 
      WHERE id = ${id}
      RETURNING id
    `;
    
    if (result.rows.length === 0) {
      return NextResponse.json({ 
        ok: false, 
        error: 'Event not found' 
      }, { status: 404 });
    }
    
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