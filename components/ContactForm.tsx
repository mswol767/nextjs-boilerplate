"use client";

import { useState } from "react";
import type { ContactFormData } from "../types";
import LoadingSpinner from "./LoadingSpinner";

export default function ContactForm() {
  const [formData, setFormData] = useState<ContactFormData>({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(false);

  const handleInputChange = (field: keyof ContactFormData) => 
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      setFormData(prev => ({ ...prev, [field]: e.target.value }));
    };

  const clearForm = () => {
    setFormData({ name: '', email: '', subject: '', message: '' });
    setStatus('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('');
    setLoading(true);

    if (!formData.name.trim() || !formData.email.trim() || !formData.message.trim()) {
      setStatus('Please provide your name, email, and a message.');
      setLoading(false);
      return;
    }

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      
      const json = await res.json();
      
      if (!res.ok) {
        throw new Error(json?.error || 'Failed to send');
      }
      
      setStatus('Thanks — your message was sent.');
      clearForm();
    } catch (err: any) {
      setStatus(`Error: ${err?.message || 'Could not send message'}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-2xl mx-auto text-left grid-form">
      <input 
        className="form-input" 
        placeholder="Your name" 
        value={formData.name} 
        onChange={handleInputChange('name')} 
        required 
      />
      <input 
        className="form-input" 
        placeholder="Your email" 
        type="email" 
        value={formData.email} 
        onChange={handleInputChange('email')} 
        required 
      />
      <input 
        className="form-input" 
        placeholder="Subject (optional)" 
        value={formData.subject} 
        onChange={handleInputChange('subject')} 
      />
      <textarea 
        className="form-textarea" 
        placeholder="Message" 
        value={formData.message} 
        onChange={handleInputChange('message')} 
        rows={6} 
        required 
      />
      <div className="flex items-center gap-3">
        <button 
          type="submit" 
          className="btn-primary flex items-center gap-2"
          disabled={loading}
        >
          {loading && <LoadingSpinner size="sm" />}
          {loading ? 'Sending...' : 'Send Message'}
        </button>
        <button 
          type="button" 
          onClick={clearForm} 
          className="btn-clear"
        >
          Clear
        </button>
      </div>
      {status && (
        <p className={`mt-2 ${status.includes('Error') ? 'status-error' : 'status-success'}`}>
          {status}
        </p>
      )}
    </form>
  );
}
