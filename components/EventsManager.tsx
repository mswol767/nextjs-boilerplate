"use client";

import { useState, useEffect } from 'react';
import type { Event } from '../types';
import LoadingSpinner from './LoadingSpinner';

export default function EventsManager() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    start: '',
    durationMinutes: 60
  });

  // Load events on component mount
  useEffect(() => {
    loadEvents();
  }, []);

  const loadEvents = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/events');
      const result = await response.json();
      
      if (!result.ok) {
        throw new Error(result.error || 'Failed to load events');
      }
      
      setEvents(result.data || []);
    } catch (err: any) {
      setError(err.message || 'Failed to load events');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: keyof typeof formData) => 
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      setFormData(prev => ({ ...prev, [field]: e.target.value }));
    };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      start: '',
      durationMinutes: 60
    });
    setEditingEvent(null);
    setShowForm(false);
  };

  const handleEdit = (event: Event) => {
    setEditingEvent(event);
    
    // Convert UTC date back to Eastern Time for the form
    const eventDate = new Date(event.start);
    
    // Convert UTC to Eastern Time
    const easternDate = new Date(eventDate.toLocaleString("en-US", {timeZone: "America/New_York"}));
    
    const year = easternDate.getFullYear();
    const month = String(easternDate.getMonth() + 1).padStart(2, '0');
    const day = String(easternDate.getDate()).padStart(2, '0');
    const hours = String(easternDate.getHours()).padStart(2, '0');
    const minutes = String(easternDate.getMinutes()).padStart(2, '0');
    const localDateTime = `${year}-${month}-${day}T${hours}:${minutes}`;
    
    setFormData({
      title: event.title,
      description: event.description,
      start: localDateTime,
      durationMinutes: event.durationMinutes
    });
    setShowForm(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!formData.title.trim() || !formData.start) {
      setError('Title and start date are required');
      return;
    }

    try {
      // Convert the datetime-local input to Eastern Time
      // The datetime-local input gives us a string like "2025-01-15T18:00"
      // We need to treat this as Eastern Time and convert it to UTC for storage
      
      // Parse the datetime-local string and treat it as Eastern Time
      const [datePart, timePart] = formData.start.split('T');
      const [year, month, day] = datePart.split('-').map(Number);
      const [hours, minutes] = timePart.split(':').map(Number);
      
      // Create a date string in Eastern Time format
      const easternTimeString = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}T${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:00`;
      
      // Create a date object and treat it as Eastern Time
      // We'll use a simple approach: assume EST (UTC-5) for now
      // This can be improved later to handle EDT automatically
      const easternDateTime = new Date(easternTimeString);
      const utcDateTime = new Date(easternDateTime.getTime() + (5 * 60 * 60 * 1000)); // Add 5 hours to convert EST to UTC
      
      const url = editingEvent ? '/api/events' : '/api/events';
      const method = editingEvent ? 'PUT' : 'POST';
      const body = editingEvent 
        ? { id: editingEvent.id, ...formData, start: utcDateTime.toISOString() }
        : { ...formData, start: utcDateTime.toISOString() };

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });

      const result = await response.json();

      if (!result.ok) {
        throw new Error(result.error || 'Failed to save event');
      }

      await loadEvents();
      resetForm();
    } catch (err: any) {
      setError(err.message || 'Failed to save event');
    }
  };

  const handleDelete = async (eventId: string) => {
    if (!confirm('Are you sure you want to delete this event?')) {
      return;
    }

    try {
      const response = await fetch(`/api/events?id=${eventId}`, {
        method: 'DELETE'
      });

      const result = await response.json();

      if (!result.ok) {
        throw new Error(result.error || 'Failed to delete event');
      }

      await loadEvents();
    } catch (err: any) {
      setError(err.message || 'Failed to delete event');
    }
  };

  const formatDate = (date: Date) => {
    return date.toLocaleString('en-US', { 
      dateStyle: 'medium', 
      timeStyle: 'short',
      timeZone: 'America/New_York' // Eastern Time
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <LoadingSpinner size="lg" />
        <span className="ml-3 text-gray-600">Loading events...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Error message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded p-4">
          <p className="text-red-800">{error}</p>
        </div>
      )}

      {/* Add/Edit Event Form */}
      {showForm && (
        <div className="bg-gray-50 rounded-lg p-6">
          <h3 className="text-lg font-semibold mb-4">
            {editingEvent ? 'Edit Event' : 'Add New Event'}
          </h3>
          
          <form onSubmit={handleSubmit} className="grid-form max-w-2xl">
            <input
              type="text"
              className="form-input"
              placeholder="Event Title"
              value={formData.title}
              onChange={handleInputChange('title')}
              required
            />
            
            <textarea
              className="form-textarea"
              placeholder="Event Description"
              value={formData.description}
              onChange={handleInputChange('description')}
              rows={3}
            />
            
            <input
              type="datetime-local"
              className="form-input"
              value={formData.start}
              onChange={handleInputChange('start')}
              required
            />
            
            <input
              type="number"
              className="form-input"
              placeholder="Duration (minutes)"
              value={formData.durationMinutes}
              onChange={handleInputChange('durationMinutes')}
              min="1"
              required
            />
            
            <div className="flex gap-3">
              <button type="submit" className="btn-primary">
                {editingEvent ? 'Update Event' : 'Add Event'}
              </button>
              <button 
                type="button" 
                onClick={resetForm}
                className="btn-clear"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Events List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">
            Events ({events.length})
          </h3>
          {!showForm && (
            <button 
              onClick={() => setShowForm(true)}
              className="btn-primary"
            >
              Add New Event
            </button>
          )}
        </div>

        {events.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <p>No events found. Add your first event to get started!</p>
          </div>
        ) : (
          <div className="grid gap-4">
            {events
              .sort((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime())
              .map((event) => (
                <div key={event.id} className="card">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h4 className="card-header">{event.title}</h4>
                      {event.description && (
                        <p className="text-gray-700 mb-2">{event.description}</p>
                      )}
                      <div className="text-sm text-gray-600 space-y-1">
                        <p><strong>Date:</strong> {formatDate(new Date(event.start))}</p>
                        <p><strong>Duration:</strong> {event.durationMinutes} minutes</p>
                      </div>
                    </div>
                    <div className="flex gap-2 ml-4">
                      <button
                        onClick={() => handleEdit(event)}
                        className="btn-secondary text-sm"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(event.id)}
                        className="bg-red-600 text-white px-3 py-2 rounded hover:bg-red-700 text-sm"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
          </div>
        )}
      </div>
    </div>
  );
}
