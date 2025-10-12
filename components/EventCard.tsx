"use client";

import type { Event } from "../types";

interface EventCardProps {
  event: Event;
}

export default function EventCard({ event }: EventCardProps) {
  const formatLocal = (d: Date) => {
    return d.toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' });
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

  const getGoogleUrl = (ev: Event) => {
    const start = toGoogleDate(ev.start);
    const end = toGoogleDate(new Date(ev.start.getTime() + ev.durationMinutes * 60000));
    const text = encodeURIComponent(ev.title);
    const details = encodeURIComponent(ev.description || '');
    const location = encodeURIComponent('Cromwell Fish & Game Club');
    return `https://www.google.com/calendar/render?action=TEMPLATE&text=${text}&dates=${start}/${end}&details=${details}&location=${location}&sf=true&output=xml`;
  };

  const buildICS = (ev: Event) => {
    const dtstamp = toGoogleDate(new Date());
    const dtstart = toGoogleDate(ev.start);
    const dtend = toGoogleDate(new Date(ev.start.getTime() + ev.durationMinutes * 60000));
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
        {formatLocal(new Date(event.start))} • {Math.round(event.durationMinutes/60)} hr{event.durationMinutes > 60 ? 's' : ''}
      </p>
      <p className="text-sm mb-3 text-gray-700">{event.description}</p>
      <div className="flex gap-3">
        <a 
          href={getGoogleUrl(event)} 
          target="_blank" 
          rel="noopener noreferrer" 
          className="btn-primary"
        >
          Add to Google Calendar
        </a>
        <button 
          onClick={() => downloadICS(event)} 
          className="btn-secondary"
        >
          Download .ics
        </button>
      </div>
    </article>
  );
}
