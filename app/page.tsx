"use client";

import { useState, useEffect, useRef, useMemo } from "react";

export default function Home() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState<string>("about");
  const manualNavRef = useRef(false);
  const [eventsData, setEventsData] = useState<any[] | null>(null);
  const [showPast, setShowPast] = useState(false);
  // Waitlist state for membership
  const [waitName, setWaitName] = useState('');
  const [waitEmail, setWaitEmail] = useState('');
  const [waitPhone, setWaitPhone] = useState('');
  const [waitAddress, setWaitAddress] = useState('');
  const [waitMessage, setWaitMessage] = useState('');
  const [waitSuccess, setWaitSuccess] = useState('');

  // Smoothly scroll to section and mark active; close mobile menu when used
  function handleNavClick(e: React.MouseEvent<HTMLAnchorElement>, id: string) {
    e.preventDefault();
  // If the user clicks Home, show About section instead (per request)
  const mappedId = id === 'home' ? 'about' : id;
  // set active immediately so conditional rendering can show the section
  setActiveSection(mappedId);
  setMenuOpen(false);
  // mark manual nav so the observer doesn't override our choice while scrolling
  manualNavRef.current = true;
    // update hash without jumping instantly
    // keep the URL hash as #home when they click Home for compatibility
    history.replaceState(null, "", `#${id}`);

    // wait a tick for DOM updates (in case the target was conditionally rendered), then scroll
    requestAnimationFrame(() => {
      // small delay to ensure layout settled
      setTimeout(() => {
        const el = document.getElementById(id);
        if (el) {
          // compute offset for header height so section isn't hidden under sticky header
          const header = document.querySelector('header');
          const headerHeight = header ? (header as HTMLElement).offsetHeight : 0;
          const extraOffset = 12; // small breathing room
          const top = el.getBoundingClientRect().top + window.scrollY - headerHeight - extraOffset;
          window.scrollTo({ top, behavior: 'smooth' });
        }
        // allow the observer to resume after the scroll finishes
        setTimeout(() => {
          manualNavRef.current = false;
        }, 600);
      }, 50);
    });
  }

  // Optional: update activeSection on scroll using IntersectionObserver
  useEffect(() => {
  const ids = ["home", "about", "events", "membership", "contact"];
    const observers: IntersectionObserver[] = [];
    ids.forEach((id) => {
      const el = document.getElementById(id);
      if (!el) return;
      const obs = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting && !manualNavRef.current) setActiveSection(id);
          });
        },
        { root: null, rootMargin: "-20% 0px -60% 0px", threshold: 0 }
      );
      obs.observe(el);
      observers.push(obs);
    });
    return () => observers.forEach((o) => o.disconnect());
  }, []);

  // Load events.json from public/ if available
  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const res = await fetch('/events.json');
        if (!res.ok) throw new Error('no events.json');
        const data = await res.json();
        if (cancelled) return;
        // convert start to Date
        const parsed = data.map((e: any) => ({ ...e, start: new Date(e.start) }));
        setEventsData(parsed);
      } catch (err) {
        // ignore, we'll use defaults
        setEventsData(null);
      }
    }
    load();
    return () => { cancelled = true };
  }, []);

  // Event helper functions and computed lists
  function pad(n: number) { return n.toString().padStart(2, '0'); }

  function toGoogleDate(d: Date) {
    // YYYYMMDDTHHMMSSZ in UTC
    const y = d.getUTCFullYear();
    const m = pad(d.getUTCMonth() + 1);
    const day = pad(d.getUTCDate());
    const hh = pad(d.getUTCHours());
    const mm = pad(d.getUTCMinutes());
    const ss = pad(d.getUTCSeconds());
    return `${y}${m}${day}T${hh}${mm}${ss}Z`;
  }

  function formatLocal(d: Date) {
    return d.toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' });
  }

  function getGoogleUrl(ev: any) {
    const start = toGoogleDate(ev.start);
    const end = toGoogleDate(new Date(ev.start.getTime() + ev.durationMinutes * 60000));
    const text = encodeURIComponent(ev.title);
    const details = encodeURIComponent(ev.description || '');
    const location = encodeURIComponent('Cromwell Fish & Game Club');
    return `https://www.google.com/calendar/render?action=TEMPLATE&text=${text}&dates=${start}/${end}&details=${details}&location=${location}&sf=true&output=xml`;
  }

  function buildICS(ev: any) {
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
  }

  function downloadICS(ev: any) {
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
  }

  const eventsComputed = useMemo(() => {
    const defaultYear = new Date().getFullYear();
    const defaults = [
      { id: 'oct-meeting', title: 'October Meeting', description: 'Monthly club meeting', start: new Date(defaultYear, 9, 2, 18, 30), durationMinutes: 60 },
      { id: 'annual', title: 'Annual Member Meeting', description: 'Annual meeting for members', start: new Date(defaultYear, 9, 2, 19, 0), durationMinutes: 90 },
      { id: 'nov-meeting', title: 'November Meeting', description: 'Monthly club meeting', start: new Date(defaultYear, 10, 6, 18, 30), durationMinutes: 60 },
    ];
    const events = eventsData && eventsData.length ? eventsData : defaults;
    const now = new Date();
    const upcoming = events.filter((e: any) => new Date(e.start) >= now);
    const past = events.filter((e: any) => new Date(e.start) < now);
    const shown = showPast ? [...upcoming, ...past] : upcoming;
    return { events, upcoming, past, shown };
  }, [eventsData, showPast]);

  return (
    <div className="font-sans min-h-screen bg-green-50 text-gray-900 flex flex-col">
      {/* Navigation */}
  <header className={`bg-green-800 w-full text-white transition-all duration-500 overflow-hidden ${menuOpen ? 'h-auto' : (activeSection === 'home' ? 'h-auto' : 'h-16 sm:h-20')}`}>
        <div className="max-w-7xl mx-auto flex items-center justify-between p-4 sm:p-6">
          <h1 className="text-xl sm:text-2xl font-bold">Cromwell Fish & Game Club</h1>
          {/* Mobile menu button */}
          <button
            className="sm:hidden text-white text-2xl"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            {menuOpen ? "✕" : "☰"}
          </button>
          {/* Desktop Menu */}
          <nav className="hidden sm:flex gap-6 text-lg font-medium">
            <a href="#home" onClick={(e) => handleNavClick(e, "home")} className={`hover:underline ${activeSection === "home" ? "underline decoration-2" : ""}`}>Home</a>
            <a href="#events" onClick={(e) => handleNavClick(e, "events")} className={`hover:underline ${activeSection === "events" ? "underline decoration-2" : ""}`}>Events</a>
            <a href="#membership" onClick={(e) => handleNavClick(e, "membership")} className={`hover:underline ${activeSection === "membership" ? "underline decoration-2" : ""}`}>Membership</a>
            <a href="#contact" onClick={(e) => handleNavClick(e, "contact")} className={`hover:underline ${activeSection === "contact" ? "underline decoration-2" : ""}`}>Contact</a>
          </nav>
        </div>
        {/* Show all button when in single-section view */}
        {activeSection !== 'home' && (
          <div className="max-w-7xl mx-auto px-4 pb-2">
            <button onClick={() => setActiveSection('home')} className="text-sm text-white/90 hover:text-white underline">
              Show all
            </button>
          </div>
        )}
        {/* Mobile Menu */}
        {menuOpen && (
          <nav className="sm:hidden flex flex-col gap-4 bg-green-700 p-4 text-lg">
            <a href="#home" className={`hover:underline ${activeSection === "home" ? "underline" : ""}`} onClick={(e) => handleNavClick(e, "home")}>Home</a>
            <a href="#events" className={`hover:underline ${activeSection === "events" ? "underline" : ""}`} onClick={(e) => handleNavClick(e, "events")}>Events</a>
            <a href="#membership" className={`hover:underline ${activeSection === "membership" ? "underline" : ""}`} onClick={(e) => handleNavClick(e, "membership")}>Membership</a>
            <a href="#contact" className={`hover:underline ${activeSection === "contact" ? "underline" : ""}`} onClick={(e) => handleNavClick(e, "contact")}>Contact</a>
          </nav>
        )}
      </header>

      {/* Full-width Header Banner */}
      <section
        id="home"
        className="w-full relative bg-cover bg-center"
        style={{ backgroundImage: "url('/header.jpg')" }}
      >
        {/* Overlay */}
        <div className="absolute inset-0 bg-black/30 z-10" />
        <div className="max-w-7xl mx-auto px-4 py-24 sm:py-32 text-center relative z-20">
          <h2 className="text-3xl sm:text-5xl font-bold text-white mb-4">Welcome to Cromwell Fish & Game Club</h2>
          <p className="text-lg sm:text-xl max-w-2xl mx-auto text-white/90 mb-6">
            Join our community of outdoor enthusiasts! Hunting, fishing, and community events for all ages.
          </p>
          {/* CTA removed per request */}
        </div>
      </section>

      {/* About Us Section */}
      {(activeSection === "home" || activeSection === "about") && (
        <section id="about" className="max-w-4xl mx-auto px-4 sm:px-8 py-12">
          <div className="text-center">
            <h2 className="text-2xl sm:text-3xl font-semibold mb-4">About Us</h2>
            <p className="mb-4 text-gray-700">
              Cromwell Fish & Game Club is a community-run organization dedicated to promoting responsible outdoor recreation,
              conservation, and education. Our members enjoy regular meetings, youth events, and habitat stewardship projects.
            </p>
            <p className="text-gray-700">
              We welcome hunters, anglers, and anyone interested in learning outdoor skills or supporting local conservation efforts.
            </p>
          </div>
        </section>
      )}

      {/* Conditionally rendered content sections */}
      {(activeSection === "home" || activeSection === "events") && (
        <section id="events" className="max-w-4xl mx-auto px-4 sm:px-8 py-12">
          <h2 className="text-2xl sm:text-3xl font-semibold mb-6 text-center">Upcoming Events</h2>
          {/* Event cards */}
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm text-gray-700">Showing {eventsComputed.shown.length} event{eventsComputed.shown.length !== 1 ? 's' : ''}</p>
            <button onClick={() => setShowPast(!showPast)} className="text-sm text-green-800 underline">{showPast ? 'Hide past events' : 'Show past events'}</button>
          </div>
          <div className="grid gap-6 sm:grid-cols-2">
            {eventsComputed.shown.map((ev: any) => (
              <article key={ev.id} className="bg-white rounded shadow p-4 border-l-4 border-green-800">
                <h3 className="text-lg font-semibold text-green-900">{ev.title}</h3>
                <p className="text-sm text-green-700 mb-2">{formatLocal(new Date(ev.start))} • {Math.round(ev.durationMinutes/60)} hr{ev.durationMinutes>60? 's' : ''}</p>
                <p className="text-sm mb-3 text-gray-700">{ev.description}</p>
                <div className="flex gap-3">
                  <a href={getGoogleUrl(ev)} target="_blank" rel="noopener noreferrer" className="inline-block bg-green-800 text-white px-3 py-2 rounded hover:bg-green-700">Add to Google Calendar</a>
                  <button onClick={() => downloadICS(ev)} className="inline-block bg-green-600 text-white px-3 py-2 rounded hover:bg-green-500">Download .ics</button>
                </div>
              </article>
            ))}
          </div>
        </section>
      )}

      {(activeSection === "home" || activeSection === "membership") && (
        <section id="membership" className="bg-green-100 py-12 px-4 sm:px-8">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-2xl sm:text-3xl font-semibold mb-4">Membership (Currently Full)</h2>
            <p className="mb-4 text-gray-700">
              Our membership is currently at capacity. We appreciate your interest — we maintain a wait list and will contact
              interested individuals as spots become available.
            </p>
            <p className="mb-6 text-gray-700">
              Please join the wait list below and we'll notify you by email when a place opens up.
            </p>

            <form className="grid gap-3 sm:grid-cols-1 mb-4" onSubmit={async (e) => {
              e.preventDefault();
              setWaitSuccess('');
              // simple address validation: require at least 5 characters if provided and contain a number (street number)
              if (waitAddress) {
                const addrTrim = waitAddress.trim();
                if (addrTrim.length < 5 || !/\d/.test(addrTrim)) {
                  setWaitSuccess('Please enter a valid address (include street number).');
                  return;
                }
              }

              try {
                const res = await fetch('/api/waitlist', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ name: waitName, email: waitEmail, phone: waitPhone, address: waitAddress, message: waitMessage }),
                });
                const json = await res.json();
                if (!res.ok) throw new Error(json?.error || 'Submission failed');
                if (json.fallback) {
                  setWaitSuccess(`Thanks — added to wait list (stored temporarily).`);
                } else if (json.persistedTo) {
                  setWaitSuccess('Thanks — you have been added to the wait list.');
                } else {
                  setWaitSuccess('Thanks — you have been added to the wait list.');
                }
                // clear the form
                setWaitName(''); setWaitEmail(''); setWaitPhone(''); setWaitAddress(''); setWaitMessage('');
              } catch (err: any) {
                setWaitSuccess(`Error: ${err?.message || 'Could not submit'}`);
              }
            }}>
              <input className="w-full px-3 py-2 rounded border" placeholder="Full name" value={waitName} onChange={(e) => setWaitName(e.target.value)} required />
              <input className="w-full px-3 py-2 rounded border" placeholder="Email address" type="email" value={waitEmail} onChange={(e) => setWaitEmail(e.target.value)} required />
              <input className="w-full px-3 py-2 rounded border" placeholder="Phone number" type="tel" value={waitPhone} onChange={(e) => setWaitPhone(e.target.value)} />
              <input className="w-full px-3 py-2 rounded border" placeholder="Address (optional, include street number)" value={waitAddress} onChange={(e) => setWaitAddress(e.target.value)} />
              <textarea className="w-full px-3 py-2 rounded border" placeholder="Optional message (interests/notes)" value={waitMessage} onChange={(e) => setWaitMessage(e.target.value)} rows={3} />
              <div className="flex items-center justify-center gap-3">
                <button type="submit" className="bg-green-800 text-white px-6 py-3 rounded hover:bg-green-700 transition">Join the Wait List</button>
                <button type="button" onClick={() => { setWaitName(''); setWaitEmail(''); setWaitPhone(''); setWaitAddress(''); setWaitMessage(''); setWaitSuccess(''); }} className="text-sm text-gray-700 underline">Clear</button>
              </div>
            </form>

            {waitSuccess && <p className="text-sm text-green-800">{waitSuccess}</p>}
            <p className="mt-6 text-sm text-gray-600">Questions? Email <a href="mailto:cromwellfgc@gmail.com" className="underline text-green-900">cromwellfgc@gmail.com</a>.</p>
          </div>
        </section>
      )}

      {(activeSection === "home" || activeSection === "contact") && (
        <section id="contact" className="max-w-4xl mx-auto px-4 sm:px-8 py-12 text-center">
          <h2 className="text-2xl sm:text-3xl font-semibold mb-4">Contact Us</h2>
          <p className="mb-4">Email: <a href="mailto:cromwellfgc@gmail.com" aria-label="Email Cromwell Fish and Game Club" className="text-green-900 underline hover:text-green-700">cromwellfgc@gmail.com</a></p>
        </section>
      )}


      {/* Footer */}
      <footer className="bg-green-800 text-white py-6 text-center">
        &copy; {new Date().getFullYear()} Cromwell Fish & Game Club. All rights reserved.
      </footer>
    </div>
  );
}

