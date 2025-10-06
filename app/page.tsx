"use client";

import { useState } from "react";

export default function Home() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="font-sans min-h-screen bg-green-50 text-gray-900 flex flex-col">
      {/* Navigation */}
      <header className="bg-green-800 w-full text-white">
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
            <a href="#home" className="hover:underline">Home</a>
            <a href="#events" className="hover:underline">Events</a>
            <a href="#membership" className="hover:underline">Membership</a>
            <a href="#contact" className="hover:underline">Contact</a>
          </nav>
        </div>
        {/* Mobile Menu */}
        {menuOpen && (
          <nav className="sm:hidden flex flex-col gap-4 bg-green-700 p-4 text-lg">
            <a href="#home" className="hover:underline" onClick={() => setMenuOpen(false)}>Home</a>
            <a href="#events" className="hover:underline" onClick={() => setMenuOpen(false)}>Events</a>
            <a href="#membership" className="hover:underline" onClick={() => setMenuOpen(false)}>Membership</a>
            <a href="#contact" className="hover:underline" onClick={() => setMenuOpen(false)}>Contact</a>
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
          <a
            href="#membership"
            className="inline-block bg-green-800 text-white px-6 py-3 rounded hover:bg-green-700 transition"
          >
            Become a Member
          </a>
        </div>
      </section>

      {/* Events Section */}
      <section id="events" className="max-w-4xl mx-auto px-4 sm:px-8 py-12">
        <h2 className="text-2xl sm:text-3xl font-semibold mb-6 text-center">Upcoming Events</h2>
        <ul className="list-disc list-inside space-y-2 text-center sm:text-left">
          <li>October 12: Fall Hunting Seminar</li>
          <li>October 19: Youth Fishing Day</li>
          <li>November 5: Annual Membership Meeting</li>
        </ul>
      </section>

      {/* Membership Section */}
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

      {/* Contact Section */}
      <section id="contact" className="max-w-4xl mx-auto px-4 sm:px-8 py-12 text-center">
        <h2 className="text-2xl sm:text-3xl font-semibold mb-4">Contact Us</h2>
        <p className="mb-4">Email: cromwellfgc@gmail.com</p>
        <p>Phone: (860) 555-1234</p>
      </section>


      {/* Footer */}
      <footer className="bg-green-800 text-white py-6 text-center">
        &copy; {new Date().getFullYear()} Cromwell Fish & Game Club. All rights reserved.
      </footer>
    </div>
  );
}

