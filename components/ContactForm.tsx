"use client";

import { useState } from "react";
import type { ContactFormData } from "../types";
import LoadingSpinner from "./LoadingSpinner";

// InputField component for contact form
const InputField = ({ 
  field, 
  label, 
  type = "text", 
  placeholder, 
  required = false, 
  icon,
  formData,
  focusedField,
  setFocusedField,
  handleInputChange
}: { 
  field: keyof ContactFormData; 
  label: string; 
  type?: string; 
  placeholder: string; 
  required?: boolean; 
  icon: string;
  formData: ContactFormData;
  focusedField: string | null;
  setFocusedField: (field: string | null) => void;
  handleInputChange: (field: keyof ContactFormData) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
}) => {
  const isFocused = focusedField === field;
  
  return (
    <div className="relative">
      <div className="flex items-center gap-4">
        <label className="text-sm font-medium text-gray-700 whitespace-nowrap min-w-[120px]">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
        <div className="relative flex-1">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg className={`h-5 w-5 text-gray-400`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={icon} />
            </svg>
          </div>
          <input
            type={type}
            className={`
              w-full pl-10 pr-4 py-3 border-2 rounded-lg transition-all duration-200
              ${isFocused 
                ? 'border-green-500 ring-2 ring-green-200 bg-green-50' 
                : 'border-gray-300 hover:border-gray-400 focus:border-green-500 focus:ring-2 focus:ring-green-200'
              }
              focus:outline-none focus:bg-white
            `}
            placeholder={placeholder}
            value={formData[field]}
            onChange={handleInputChange(field)}
            onFocus={() => setFocusedField(field)}
            onBlur={() => setFocusedField(null)}
            required={required}
          />
        </div>
      </div>
    </div>
  );
};

// TextAreaField component for contact form
const TextAreaField = ({ 
  field, 
  label, 
  placeholder, 
  rows = 4,
  formData,
  focusedField,
  setFocusedField,
  handleInputChange
}: { 
  field: keyof ContactFormData; 
  label: string; 
  placeholder: string; 
  rows?: number;
  formData: ContactFormData;
  focusedField: string | null;
  setFocusedField: (field: string | null) => void;
  handleInputChange: (field: keyof ContactFormData) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
}) => (
  <div className="relative">
    <div className="flex items-start gap-4">
      <label className="text-sm font-medium text-gray-700 whitespace-nowrap min-w-[120px] pt-3">
        {label} <span className="text-red-500">*</span>
      </label>
      <div className="relative flex-1">
        <div className="absolute top-3 left-3 pointer-events-none">
          <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
        </div>
        <textarea
          className={`
            w-full pl-10 pr-4 py-3 border-2 rounded-lg transition-all duration-200 resize-none
            ${focusedField === field 
              ? 'border-green-500 ring-2 ring-green-200 bg-green-50' 
              : 'border-gray-300 hover:border-gray-400 focus:border-green-500 focus:ring-2 focus:ring-green-200'
            }
            focus:outline-none focus:bg-white
          `}
          placeholder={placeholder}
          value={formData[field]}
          onChange={handleInputChange(field)}
          onFocus={() => setFocusedField(field)}
          onBlur={() => setFocusedField(null)}
          rows={rows}
          required
        />
      </div>
    </div>
  </div>
);

export default function ContactForm() {
  const [formData, setFormData] = useState<ContactFormData>({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(false);
  const [focusedField, setFocusedField] = useState<string | null>(null);

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
    <div className="max-w-6xl mx-auto px-4">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
          <svg className="w-8 h-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
        </div>
        <h3 className="text-2xl font-bold text-gray-900 mb-2">Contact Us</h3>
        <p className="text-gray-600">Send us a message and we'll get back to you as soon as we can</p>
      </div>

      {/* Form */}
      <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Contact Information Section */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-1 h-6 bg-green-500 rounded-full"></div>
              <h4 className="text-lg font-semibold text-gray-900">Contact Information</h4>
            </div>
            
            <div className="space-y-4">
              <InputField
                field="name"
                label="Full Name"
                placeholder="Enter your full name"
                required
                icon="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                formData={formData}
                focusedField={focusedField}
                setFocusedField={setFocusedField}
                handleInputChange={handleInputChange}
              />
              <InputField
                field="email"
                label="Email Address"
                type="email"
                placeholder="your.email@example.com"
                required
                icon="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                formData={formData}
                focusedField={focusedField}
                setFocusedField={setFocusedField}
                handleInputChange={handleInputChange}
              />
              <InputField
                field="subject"
                label="Subject"
                placeholder="What is this about?"
                icon="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"
                formData={formData}
                focusedField={focusedField}
                setFocusedField={setFocusedField}
                handleInputChange={handleInputChange}
              />
            </div>
          </div>

          {/* Message Section */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-1 h-6 bg-green-500 rounded-full"></div>
              <h4 className="text-lg font-semibold text-gray-900">Your Message</h4>
            </div>
            
            <TextAreaField
              field="message"
              label="Message"
              placeholder="Tell us what you'd like to know or discuss..."
              rows={6}
              formData={formData}
              focusedField={focusedField}
              setFocusedField={setFocusedField}
              handleInputChange={handleInputChange}
            />
          </div>

          {/* Submit Section */}
          <div className="pt-6 border-t border-gray-200">
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <button 
                type="submit" 
                className="
                  w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-green-600 to-green-700 
                  text-white font-semibold rounded-lg shadow-lg hover:shadow-xl
                  transform hover:scale-105 transition-all duration-200
                  flex items-center justify-center gap-3
                  disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none
                "
                disabled={loading}
              >
                {loading ? (
                  <>
                    <LoadingSpinner size="sm" />
                    <span>Sending...</span>
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                    </svg>
                    <span>Send Message</span>
                  </>
                )}
              </button>
              
              <button 
                type="button" 
                onClick={clearForm} 
                className="
                  w-full sm:w-auto px-6 py-3 text-gray-600 hover:text-gray-800 
                  font-medium transition-colors duration-200
                  flex items-center justify-center gap-2
                "
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                <span>Clear Form</span>
              </button>
            </div>
          </div>

          {/* Status Message */}
          {status && (
            <div className={`
              p-4 rounded-lg border-l-4 flex items-start gap-3
              ${status.includes('Error') 
                ? 'bg-red-50 border-red-400 text-red-700' 
                : 'bg-green-50 border-green-400 text-green-700'
              }
            `}>
              <div className="flex-shrink-0">
                {status.includes('Error') ? (
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                )}
              </div>
              <p className="font-medium">{status}</p>
            </div>
          )}
        </form>
      </div>

      {/* Footer Note */}
      <div className="text-center mt-6">
        <p className="text-sm text-gray-500">
          <svg className="w-4 h-4 inline mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
          We'll respond to your message as soon as possible.
        </p>
      </div>
    </div>
  );
}
