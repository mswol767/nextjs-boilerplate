"use client";

import { useState, useEffect, useRef } from "react";

export default function Home() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState<string>("home");
  const manualNavRef = useRef(false);

  // Smoothly scroll to section and mark active; close mobile menu when used
  function handleNavClick(e: React.MouseEvent<HTMLAnchorElement>, id: string) {
    e.preventDefault();
  // set active immediately so conditional rendering can show the section
  setActiveSection(id);
  setMenuOpen(false);
  // mark manual nav so the observer doesn't override our choice while scrolling
  manualNavRef.current = true;
    // update hash without jumping instantly
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
    const ids = ["home", "events", "membership", "contact"];
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

      {/* Conditionally rendered content sections */}
      {(activeSection === "home" || activeSection === "events") && (
        <section id="events" className="max-w-4xl mx-auto px-4 sm:px-8 py-12">
          <h2 className="text-2xl sm:text-3xl font-semibold mb-6 text-center">Upcoming Events</h2>
          {/* Event cards */}
          <div className="grid gap-6 sm:grid-cols-2">
            {(() => {
              const year = new Date().getFullYear();
              const events = [
                {
                  id: 'oct-meeting',
                  title: 'October Meeting',
                  description: 'Monthly club meeting',
                  start: new Date(year, 9, 2, 18, 30), // Oct is month 9
                  durationMinutes: 60,
                },
                {
                  id: 'annual',
                  title: 'Annual Member Meeting',
                  description: 'Annual meeting for members',
                  start: new Date(year, 9, 2, 19, 0),
                  durationMinutes: 90,
                },
                {
                  id: 'nov-meeting',
                  title: 'November Meeting',
                  description: 'Monthly club meeting',
                  start: new Date(year, 10, 6, 18, 30), // Nov is month 10
                  durationMinutes: 60,
                },
              ];

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

              return events.map((ev) => (
                <article key={ev.id} className="bg-white rounded shadow p-4 border-l-4 border-green-800">
                  <h3 className="text-lg font-semibold text-green-900">{ev.title}</h3>
                  <p className="text-sm text-green-700 mb-2">{formatLocal(ev.start)} • {Math.round(ev.durationMinutes/60)} hr{ev.durationMinutes>60? 's' : ''}</p>
                  <p className="text-sm mb-3 text-gray-700">{ev.description}</p>
                  <div className="flex gap-3">
                    <a href={getGoogleUrl(ev)} target="_blank" rel="noopener noreferrer" className="inline-block bg-green-800 text-white px-3 py-2 rounded hover:bg-green-700">Add to Google Calendar</a>
                    <button onClick={() => downloadICS(ev)} className="inline-block bg-green-600 text-white px-3 py-2 rounded hover:bg-green-500">Download .ics</button>
                  </div>
                </article>
              ));
            })()}
          </div>
        </section>
      )}

      {(activeSection === "home" || activeSection === "membership") && (
        <section id="membership" className="bg-green-100 py-12 px-4 sm:px-8 text-center">
          <h2 className="text-2xl sm:text-3xl font-semibold mb-4">Become a Member</h2>
          <p className="mb-6 max-w-2xl mx-auto">
            Membership gives you access to our club facilities, events, and the chance to join a community of outdoor enthusiasts.
          </p>
          <a
            href="#contact"
            className="bg-green-800 text-white px-6 py-3 rounded hover:bg-green-700 transition"
          >
            Join Now
          </a>
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

