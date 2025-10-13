"use client";

import Navigation from "../components/Navigation";
import ContactForm from "../components/ContactForm";
import WaitlistForm from "../components/WaitlistForm";
import EventCard from "../components/EventCard";
import { useNavigation } from "../hooks/useNavigation";
import { useEvents } from "../hooks/useEvents";
import { useEffect } from "react";

export default function Home() {
  const { menuOpen, activeSection, setMenuOpen, setActiveSection, handleNavClick } = useNavigation();
  const { eventsComputed, showPast, setShowPast, refreshEvents } = useEvents();

  // Refresh events when events section becomes active
  useEffect(() => {
    if (activeSection === "events") {
      refreshEvents();
    }
  }, [activeSection, refreshEvents]);

  return (
    <div className="font-sans min-h-screen bg-green-50 text-gray-900 flex flex-col">
      <Navigation 
        menuOpen={menuOpen}
        activeSection={activeSection}
        onMenuToggle={() => setMenuOpen(!menuOpen)}
        onNavClick={handleNavClick}
      />
      
      {/* Add top padding to account for fixed header */}
      <div className="pt-16 sm:pt-20">

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
          {/* CTA removed per request - updated styling */}
        </div>
      </section>

      {/* About Us Section */}
      {(activeSection === "home" || activeSection === "about") && (
        <section id="about" className="section-container">
          <div className="text-center">
            <h2 className="section-title">About Us</h2>
            <p className="mb-8 text-gray-700 max-w-3xl mx-auto">
              Cromwell Fish & Game Club is a community-run organization dedicated to promoting responsible outdoor recreation,
              conservation, and education. Our members enjoy regular meetings, youth events, and habitat stewardship projects.
            </p>
            
            {/* Feature Boxes */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12">
              {/* Shooting Range */}
              <div className="bg-white rounded-lg shadow-lg p-6 border border-gray-200 hover:shadow-xl transition-shadow duration-300">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">Shooting Range</h3>
                <p className="text-gray-600">
                  Practice your marksmanship at our well-maintained shooting range. Open to members for target practice and training sessions.
                </p>
              </div>

              {/* Pheasant Hunting */}
              <div className="bg-white rounded-lg shadow-lg p-6 border border-gray-200 hover:shadow-xl transition-shadow duration-300">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">Pheasant Hunting</h3>
                <p className="text-gray-600">
                  Experience premier pheasant hunting on our managed grounds. Seasonal hunting opportunities for members and guests.
                </p>
              </div>

              {/* Skeet House */}
              <div className="bg-white rounded-lg shadow-lg p-6 border border-gray-200 hover:shadow-xl transition-shadow duration-300">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">Skeet House</h3>
                <p className="text-gray-600">
                  Test your skills at our skeet shooting facility. Perfect for both beginners learning the sport and experienced shooters.
                </p>
              </div>
            </div>

            <div className="mt-12">
              <p className="text-gray-700">
                We welcome hunters, anglers, and anyone interested in learning outdoor skills or supporting local conservation efforts.
              </p>
            </div>
          </div>
        </section>
      )}

      {/* Conditionally rendered content sections */}
      {(activeSection === "home" || activeSection === "events") && (
        <section id="events" className="section-container">
          <h2 className="section-title">Upcoming Events</h2>
          {/* Event cards */}
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm text-gray-700">Showing {eventsComputed.shown.length} event{eventsComputed.shown.length !== 1 ? 's' : ''}</p>
            <div className="flex items-center gap-4">
              <button onClick={refreshEvents} className="text-sm text-green-800 underline">
                Refresh Events
              </button>
              <button onClick={() => setShowPast(!showPast)} className="text-sm text-green-800 underline">
                {showPast ? 'Hide past events' : 'Show past events'}
              </button>
            </div>
          </div>
          <div className="grid-responsive">
            {eventsComputed.shown.map((event) => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>
        </section>
      )}

      {(activeSection === "home" || activeSection === "membership") && (
        <section id="membership" className="section-container">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-2xl sm:text-3xl font-semibold mb-4">Membership (Currently Full)</h2>
            <p className="mb-4 text-gray-700">
              Our membership is currently at capacity. We appreciate your interest — we maintain a wait list and will contact
              interested individuals as spots become available.
            </p>

            <WaitlistForm />

            <p className="mt-6 text-sm text-gray-600">
              Questions? Use the contact form above or visit the <a href="/contact" className="underline text-green-900">Contact page</a>.
            </p>
          </div>
        </section>
      )}

      {(activeSection === "home" || activeSection === "contact") && (
        <section id="contact" className="section-container text-center">
          <h2 className="section-title">Contact Us</h2>
          <p className="mb-6">Send us a message and we'll get back to you as soon as we can.</p>

          {/* Contact form */}
          <ContactForm />
        </section>
      )}

      {/* Footer */}
      <footer className="bg-green-800 text-white py-6 text-center">
        &copy; {new Date().getFullYear()} Cromwell Fish & Game Club. All rights reserved.
      </footer>
      </div>
    </div>
  );
}

