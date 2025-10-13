"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import type { Event, EventComputed } from "../types";

export function useEvents() {
  const [eventsData, setEventsData] = useState<Event[] | null>(null);
  const [showPast, setShowPast] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // Load events from events API (working solution), fallback to defaults
  useEffect(() => {
    let cancelled = false;
    
    async function load() {
      try {
        // Use the working events API
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
  }, [refreshTrigger]);

  // Function to refresh events data
  const refreshEvents = useCallback(() => {
    setRefreshTrigger(prev => prev + 1);
  }, []);

  const eventsComputed = useMemo((): EventComputed => {
    const now = new Date();
    
    // Create upcoming events for the next few months - using static dates to avoid hydration mismatch
    const defaults: Event[] = [
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
    
    const events = eventsData !== null ? eventsData : defaults;
    const upcoming = events.filter((e: Event) => new Date(e.start) >= now);
    const past = events.filter((e: Event) => new Date(e.start) < now);
    const shown = showPast ? [...upcoming, ...past] : upcoming;
    
    return { events, upcoming, past, shown };
  }, [eventsData, showPast]);

  return {
    eventsComputed,
    showPast,
    setShowPast,
    refreshEvents
  };
}
