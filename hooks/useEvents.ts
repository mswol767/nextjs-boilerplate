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
    const defaultYear = new Date().getFullYear();
    const defaults: Event[] = [
      { 
        id: 'oct-meeting', 
        title: 'October Meeting', 
        description: 'Monthly club meeting', 
        start: new Date(defaultYear, 9, 2, 18, 30), 
        durationMinutes: 60 
      },
      { 
        id: 'annual', 
        title: 'Annual Member Meeting', 
        description: 'Annual meeting for members', 
        start: new Date(defaultYear, 9, 2, 19, 0), 
        durationMinutes: 90 
      },
      { 
        id: 'nov-meeting', 
        title: 'November Meeting', 
        description: 'Monthly club meeting', 
        start: new Date(defaultYear, 10, 6, 18, 30), 
        durationMinutes: 60 
      },
    ];
    
    const events = eventsData && eventsData.length ? eventsData : defaults;
    const now = new Date();
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
