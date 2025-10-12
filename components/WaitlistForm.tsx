"use client";

import { useState } from "react";
import type { WaitlistFormData } from "../types";
import LoadingSpinner from "./LoadingSpinner";

export default function WaitlistForm() {
  const [formData, setFormData] = useState<WaitlistFormData>({
    name: '',
    email: '',
    phone: '',
    address: '',
    town: '',
    state: '',
    message: ''
  });
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(false);

  const handleInputChange = (field: keyof WaitlistFormData) => 
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      setFormData(prev => ({ ...prev, [field]: e.target.value }));
    };

  const clearForm = () => {
    setFormData({
      name: '',
      email: '',
      phone: '',
      address: '',
      town: '',
      state: '',
      message: ''
    });
    setStatus('');
  };

  const validateForm = (): string | null => {
    // Simple address validation: require at least 5 characters if provided and contain a number (street number)
    if (formData.address) {
      const addrTrim = formData.address.trim();
      if (addrTrim.length < 5 || !/\d/.test(addrTrim)) {
        return 'Please enter a valid address (include street number).';
      }
    }

    // Require town and state
    if (!formData.town.trim() || !formData.state.trim()) {
      return 'Please provide your town and state.';
    }

    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('');
    setLoading(true);

    const validationError = validateForm();
    if (validationError) {
      setStatus(validationError);
      setLoading(false);
      return;
    }

    try {
      const res = await fetch('/api/waitlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      
      const json = await res.json();
      
      if (!res.ok) {
        throw new Error(json?.error || 'Submission failed');
      }
      
      if (json.fallback) {
        setStatus('Thanks — added to wait list (stored temporarily).');
      } else if (json.persistedTo) {
        setStatus('Thanks — you have been added to the wait list.');
      } else {
        setStatus('Thanks — you have been added to the wait list.');
      }
      
      clearForm();
    } catch (err: any) {
      setStatus(`Error: ${err?.message || 'Could not submit'}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="grid-form mb-4">
      <input 
        className="form-input" 
        placeholder="Full name" 
        value={formData.name} 
        onChange={handleInputChange('name')} 
        required 
      />
      <input 
        className="form-input" 
        placeholder="Email address" 
        type="email" 
        value={formData.email} 
        onChange={handleInputChange('email')} 
        required 
      />
      <input 
        className="form-input" 
        placeholder="Phone number" 
        type="tel" 
        value={formData.phone} 
        onChange={handleInputChange('phone')} 
      />
      <input 
        className="form-input" 
        placeholder="Address (optional, include street number)" 
        value={formData.address} 
        onChange={handleInputChange('address')} 
      />
      <div className="grid-form-cols">
        <input 
          className="form-input" 
          placeholder="Town" 
          value={formData.town} 
          onChange={handleInputChange('town')} 
          required 
        />
        <input 
          className="form-input" 
          placeholder="State" 
          value={formData.state} 
          onChange={handleInputChange('state')} 
          required 
        />
      </div>
      <textarea 
        className="form-textarea" 
        placeholder="Optional message (interests/notes)" 
        value={formData.message} 
        onChange={handleInputChange('message')} 
        rows={3} 
      />
      <div className="flex items-center justify-center gap-3">
        <button 
          type="submit" 
          className="btn-primary px-6 py-3 flex items-center gap-2"
          disabled={loading}
        >
          {loading && <LoadingSpinner size="sm" />}
          {loading ? 'Submitting...' : 'Join the Wait List'}
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
        <p className={status.includes('Error') ? 'status-error' : 'status-success'}>
          {status}
        </p>
      )}
    </form>
  );
}
