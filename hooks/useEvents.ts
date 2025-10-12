"use client";

import { useState, useEffect, useMemo } from "react";
import type { Event, EventComputed } from "../types";

export function useEvents() {
  const [eventsData, setEventsData] = useState<Event[] | null>(null);
  const [showPast, setShowPast] = useState(false);

  // Load events from API, fallback to public/events.json, then defaults
  useEffect(() => {
    let cancelled = false;
    
    async function load() {
      try {
        // First try the API
        const res = await fetch('/api/events');
        if (res.ok) {
          const result = await res.json();
          if (result.ok && result.data) {
            if (cancelled) return;
            setEventsData(result.data);
            return;
          }
        }
        
        // Fallback to public/events.json
        const res2 = await fetch('/events.json');
        if (res2.ok) {
          const data = await res2.json();
          if (cancelled) return;
          // convert start to Date
          const parsed = data.map((e: any) => ({ ...e, start: new Date(e.start) }));
          setEventsData(parsed);
          return;
        }
        
        // Use defaults if nothing else works
        if (cancelled) return;
        setEventsData(null);
      } catch (err) {
        // ignore, we'll use defaults
        if (cancelled) return;
        setEventsData(null);
      }
    }
    
    load();
    return () => { cancelled = true };
  }, []);

  const eventsComputed = useMemo((): EventComputed => {
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth();
    
    // Create upcoming events for the next few months
    const defaults: Event[] = [
      { 
        id: 'monthly-meeting', 
        title: 'Monthly Club Meeting', 
        description: 'Join us for our monthly club meeting to discuss upcoming events and club business.', 
        start: new Date(currentYear, currentMonth + 1, 15, 19, 0), 
        durationMinutes: 120 
      },
      { 
        id: 'hunting-season', 
        title: 'Hunting Season Kickoff', 
        description: 'Celebrate the start of hunting season with food, drinks, and planning sessions.', 
        start: new Date(currentYear, currentMonth + 1, 20, 18, 0), 
        durationMinutes: 180 
      },
      { 
        id: 'annual-banquet', 
        title: 'Annual Club Banquet', 
        description: 'Our annual celebration with awards, dinner, and entertainment for all members.', 
        start: new Date(currentYear + 1, 0, 25, 17, 0), 
        durationMinutes: 240 
      },
    ];
    
    const events = eventsData && eventsData.length ? eventsData : defaults;
    const upcoming = events.filter((e: Event) => new Date(e.start) >= now);
    const past = events.filter((e: Event) => new Date(e.start) < now);
    const shown = showPast ? [...upcoming, ...past] : upcoming;
    
    return { events, upcoming, past, shown };
  }, [eventsData, showPast]);

  return {
    eventsComputed,
    showPast,
    setShowPast
  };
}
