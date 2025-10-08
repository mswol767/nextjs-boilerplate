"use client";

import { useState } from 'react';

export default function ContactPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [status, setStatus] = useState('');

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setStatus('');
    if (!name.trim() || !email.trim() || !message.trim()) {
      setStatus('Please provide your name, email, and a message.');
      return;
    }
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, subject, message }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.error || 'Failed to send');
      setStatus('Thanks — your message was sent.');
      setName(''); setEmail(''); setSubject(''); setMessage('');
    } catch (err: any) {
      setStatus(`Error: ${err?.message || 'Could not send message'}`);
    }
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-8 py-12">
      <h1 className="text-2xl sm:text-3xl font-semibold mb-4">Contact Us</h1>
      <p className="mb-6">Send us a message and we'll get back to you as soon as we can.</p>
      <form onSubmit={submit} className="max-w-2xl mx-auto text-left grid gap-3">
        <input className="w-full px-3 py-2 rounded border" placeholder="Your name" value={name} onChange={(e) => setName(e.target.value)} required />
        <input className="w-full px-3 py-2 rounded border" placeholder="Your email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        <input className="w-full px-3 py-2 rounded border" placeholder="Subject (optional)" value={subject} onChange={(e) => setSubject(e.target.value)} />
        <textarea className="w-full px-3 py-2 rounded border" placeholder="Message" value={message} onChange={(e) => setMessage(e.target.value)} rows={8} required />
        <div className="flex items-center gap-3">
          <button type="submit" className="bg-green-800 text-white px-4 py-2 rounded hover:bg-green-700">Send Message</button>
          <button type="button" onClick={() => { setName(''); setEmail(''); setSubject(''); setMessage(''); setStatus(''); }} className="text-sm text-gray-700 underline">Clear</button>
        </div>
        {status && <p className="mt-2 text-sm text-green-800">{status}</p>}
      </form>
    </div>
  );
}
