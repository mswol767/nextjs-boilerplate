import { NextResponse } from 'next/server';
import { prisma } from '../../../lib/prisma';
import type { Event, ApiResponse } from '../../../types';

// GET /api/events
export async function GET(): Promise<NextResponse<ApiResponse>> {
  try {
    const events = await prisma.event.findMany({
      orderBy: {
        start: 'asc'
      }
    });
    
    const formattedEvents: Event[] = events.map(event => ({
      id: event.id,
      title: event.title,
      description: event.description || '',
      start: event.start
    }));
    
    return NextResponse.json({ 
      ok: true, 
      data: formattedEvents 
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
    
    const startDate = new Date(start);
    
    const newEvent = await prisma.event.create({
      data: {
        title,
        description: description || '',
        start: startDate
      }
    });
    
    const formattedEvent: Event = {
      id: newEvent.id,
      title: newEvent.title,
      description: newEvent.description || '',
      start: newEvent.start
    };
    
    return NextResponse.json({ 
      ok: true, 
      data: formattedEvent 
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
    
    const startDate = new Date(start);
    
    const updatedEvent = await prisma.event.update({
      where: { id },
      data: {
        title,
        description: description || '',
        start: startDate
      }
    });
    
    const formattedEvent: Event = {
      id: updatedEvent.id,
      title: updatedEvent.title,
      description: updatedEvent.description || '',
      start: updatedEvent.start
    };
    
    return NextResponse.json({ 
      ok: true, 
      data: formattedEvent 
    });
  } catch (error) {
    console.error('Error updating event:', error);
    if (error instanceof Error && error.message.includes('Record to update not found')) {
      return NextResponse.json({ 
        ok: false, 
        error: 'Event not found' 
      }, { status: 404 });
    }
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
    
    await prisma.event.delete({
      where: { id }
    });
    
    return NextResponse.json({ 
      ok: true, 
      message: 'Event deleted successfully' 
    });
  } catch (error) {
    console.error('Error deleting event:', error);
    if (error instanceof Error && error.message.includes('Record to delete does not exist')) {
      return NextResponse.json({ 
        ok: false, 
        error: 'Event not found' 
      }, { status: 404 });
    }
    return NextResponse.json({ 
      ok: false, 
      error: 'Failed to delete event' 
    }, { status: 500 });
  }
}