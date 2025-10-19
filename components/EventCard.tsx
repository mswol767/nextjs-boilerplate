"use client";

import type { Event } from "../types";

interface EventCardProps {
  event: Event;
}

export default function EventCard({ event }: EventCardProps) {
  // Ensure start is always a Date object
  const eventStart = new Date(event.start);
  
  const formatLocal = (d: Date) => {
    return d.toLocaleString('en-US', { 
      dateStyle: 'medium', 
      timeStyle: 'short',
      timeZone: 'America/New_York' // Eastern Time
    });
  };

  const pad = (n: number) => n.toString().padStart(2, '0');

  const toGoogleDate = (d: Date) => {
    const y = d.getUTCFullYear();
    const m = pad(d.getUTCMonth() + 1);
    const day = pad(d.getUTCDate());
    const hh = pad(d.getUTCHours());
    const mm = pad(d.getUTCMinutes());
    const ss = pad(d.getUTCSeconds());
    return `${y}${m}${day}T${hh}${mm}${ss}Z`;
  };


  const buildICS = (ev: Event) => {
    const dtstamp = toGoogleDate(new Date());
    const dtstart = toGoogleDate(eventStart);
    const dtend = toGoogleDate(new Date(eventStart.getTime() + 2 * 60 * 60000)); // Default 2 hours
    const uid = `${ev.id}@cromwellfgc.local`;
    return [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//Cromwell FGC//EN',
      'CALSCALE:GREGORIAN',
      'BEGIN:VEVENT',
      `UID:${uid}`,
      `DTSTAMP:${dtstamp}`,
      `DTSTART:${dtstart}`,
      `DTEND:${dtend}`,
      `SUMMARY:${ev.title}`,
      `DESCRIPTION:${ev.description || ''}`,
      `LOCATION:Cromwell Fish & Game Club`,
      'END:VEVENT',
      'END:VCALENDAR',
    ].join('\r\n');
  };

  const downloadICS = (ev: Event) => {
    const ics = buildICS(ev);
    const blob = new Blob([ics], { type: 'text/calendar;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${ev.id}.ics`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 5000);
  };

  return (
    <article className="card">
      <h3 className="card-header">{event.title}</h3>
      <p className="text-sm text-green-700 mb-2">
        {formatLocal(eventStart)}
      </p>
      <p className="text-sm mb-3 text-gray-700">{event.description}</p>
      <div className="flex gap-3">
        <button 
          onClick={() => downloadICS(event)} 
          className="btn-primary flex items-center gap-2"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          Add to Calendar
        </button>
      </div>
    </article>
  );
}
