"use client";

import Navigation from "../components/Navigation";
import ContactForm from "../components/ContactForm";
import WaitlistForm from "../components/WaitlistForm";
import EventCard from "../components/EventCard";
import { useNavigation } from "../hooks/useNavigation";
import { useEvents } from "../hooks/useEvents";

export default function Home() {
  const { menuOpen, activeSection, setMenuOpen, setActiveSection, handleNavClick } = useNavigation();
  const { eventsComputed, showPast, setShowPast } = useEvents();


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
          {/* CTA removed per request */}
        </div>
      </section>

      {/* About Us Section */}
      {(activeSection === "home" || activeSection === "about") && (
        <section id="about" className="section-container">
          <div className="text-center">
            <h2 className="section-title">About Us</h2>
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
        <section id="events" className="section-container">
          <h2 className="section-title">Upcoming Events</h2>
          {/* Event cards */}
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm text-gray-700">Showing {eventsComputed.shown.length} event{eventsComputed.shown.length !== 1 ? 's' : ''}</p>
            <button onClick={() => setShowPast(!showPast)} className="text-sm text-green-800 underline">
              {showPast ? 'Hide past events' : 'Show past events'}
            </button>
          </div>
          <div className="grid-responsive">
            {eventsComputed.shown.map((event) => (
              <EventCard key={event.id} event={event} />
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

