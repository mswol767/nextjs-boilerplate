"use client";

import { useState } from "react";
import type { WaitlistFormData } from "../types";
import LoadingSpinner from "./LoadingSpinner";

// InputField component defined outside to prevent re-creation on every render
const InputField = ({ 
  field, 
  label, 
  type = "text", 
  placeholder, 
  required = false, 
  icon,
  helperText,
  formData,
  fieldErrors,
  focusedField,
  setFocusedField,
  handleInputChange
}: { 
  field: keyof WaitlistFormData; 
  label: string; 
  type?: string; 
  placeholder: string; 
  required?: boolean; 
  icon: string;
  helperText?: string;
  formData: WaitlistFormData;
  fieldErrors: Record<string, string>;
  focusedField: string | null;
  setFocusedField: (field: string | null) => void;
  handleInputChange: (field: keyof WaitlistFormData) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
}) => {
  const hasError = fieldErrors[field];
  const isFocused = focusedField === field;
  
  return (
    <div className="relative">
      <div className="flex items-center gap-4">
        <label className="text-sm font-medium text-gray-700 whitespace-nowrap min-w-[120px]">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
        <div className="relative flex-1">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg className={`h-5 w-5 ${hasError ? 'text-red-400' : 'text-gray-400'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={icon} />
            </svg>
          </div>
          <input
            type={type}
            className={`
              w-full pl-10 pr-4 py-3 border-2 rounded-lg transition-all duration-200
              ${hasError 
                ? 'border-red-300 ring-2 ring-red-200 bg-red-50' 
                : isFocused 
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
      {helperText && !hasError && (
        <p className="mt-1 text-xs text-gray-500">{helperText}</p>
      )}
      {hasError && (
        <p className="mt-1 text-xs text-red-600 flex items-center gap-1">
          <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          {hasError}
        </p>
      )}
    </div>
  );
};

export default function WaitlistForm() {
  const [formData, setFormData] = useState<WaitlistFormData>({
    name: '',
    email: '',
    phone: '',
    address: '',
    town: '',
    state: ''
  });
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(false);
  const [focusedField, setFocusedField] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const handleInputChange = (field: keyof WaitlistFormData) => 
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      const value = e.target.value;
      setFormData(prev => ({ ...prev, [field]: value }));
      
      // Clear field error when user starts typing
      if (fieldErrors[field]) {
        setFieldErrors(prev => ({ ...prev, [field]: '' }));
      }
      
    };


  const clearForm = () => {
    setFormData({
      name: '',
      email: '',
      phone: '',
      address: '',
      town: '',
      state: ''
    });
    setStatus('');
    setFieldErrors({});
  };

  const validateForm = (): string | null => {
    // Basic required field validation
    if (!formData.address.trim()) {
      return 'Please provide your address.';
    }

    // Require town and state
    if (!formData.town.trim() || !formData.state.trim()) {
      return 'Please provide your town and state.';
    }

    // Validate town name (should be at least 2 characters and contain letters)
    const town = formData.town.trim();
    if (town.length < 2 || !/[a-zA-Z]/.test(town)) {
      return 'Please enter a valid town or city name.';
    }

    // Validate state (should be at least 2 characters)
    const state = formData.state.trim();
    if (state.length < 2) {
      return 'Please enter a valid state.';
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


  const TextAreaField = ({ 
    field, 
    label, 
    placeholder, 
    rows = 3 
  }: { 
    field: keyof WaitlistFormData; 
    label: string; 
    placeholder: string; 
    rows?: number; 
  }) => (
    <div className="relative">
      <div className="flex items-start gap-4">
        <label className="text-sm font-medium text-gray-700 whitespace-nowrap min-w-[120px] pt-3">
          {label}
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
          />
        </div>
      </div>
    </div>
  );

  return (
    <div className="max-w-2xl mx-auto">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
          <svg className="w-8 h-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
          </svg>
        </div>
        <h3 className="text-2xl font-bold text-gray-900 mb-2">Join Our Waitlist</h3>
        <p className="text-gray-600">Be the first to know when membership spots become available</p>
      </div>

      {/* Form */}
      <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Personal Information Section */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-1 h-6 bg-green-500 rounded-full"></div>
              <h4 className="text-lg font-semibold text-gray-900">Personal Information</h4>
            </div>
            
            <div className="space-y-4">
              <InputField
                field="name"
                label="Full Name"
                placeholder="Enter your full name"
                required
                icon="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                formData={formData}
                fieldErrors={fieldErrors}
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
                fieldErrors={fieldErrors}
                focusedField={focusedField}
                setFocusedField={setFocusedField}
                handleInputChange={handleInputChange}
              />
            </div>
            
            <InputField
              field="phone"
              label="Phone Number"
              type="tel"
              placeholder="(555) 123-4567"
              icon="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
              formData={formData}
              fieldErrors={fieldErrors}
              focusedField={focusedField}
              setFocusedField={setFocusedField}
              handleInputChange={handleInputChange}
            />
          </div>

          {/* Location Section */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-1 h-6 bg-green-500 rounded-full"></div>
              <h4 className="text-lg font-semibold text-gray-900">Location</h4>
            </div>
            
            <InputField
              field="address"
              label="Address"
              placeholder="123 Main Street, Apt 4B"
              required
              icon="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z M15 11a3 3 0 11-6 0 3 3 0 016 0z"
              formData={formData}
              fieldErrors={fieldErrors}
              focusedField={focusedField}
              setFocusedField={setFocusedField}
              handleInputChange={handleInputChange}
            />
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <InputField
                field="town"
                label="Town/City"
                placeholder="Your town or city"
                required
                icon="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                formData={formData}
                fieldErrors={fieldErrors}
                focusedField={focusedField}
                setFocusedField={setFocusedField}
                handleInputChange={handleInputChange}
              />
              <InputField
                field="state"
                label="State"
                placeholder="Your state"
                required
                icon="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                formData={formData}
                fieldErrors={fieldErrors}
                focusedField={focusedField}
                setFocusedField={setFocusedField}
                handleInputChange={handleInputChange}
              />
            </div>
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
                    <span>Submitting...</span>
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                    </svg>
                    <span>Join the Waitlist</span>
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
          Your information is secure and will only be used to contact you about membership opportunities.
        </p>
      </div>
    </div>
  );
}
