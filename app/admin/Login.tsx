"use client";

import { useState } from 'react';

export default function Login({ onSuccess }: { onSuccess?: () => void }) {
  const [pass, setPass] = useState('');
  const [err, setErr] = useState('');
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setErr('');
    setLoading(true);
    try {
      const res = await fetch('/api/admin/login', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ password: pass }) });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.error || 'Login failed');
      if (onSuccess) onSuccess(); else window.location.reload();
    } catch (err: any) {
      setErr(err?.message || 'Login failed');
    } finally { setLoading(false); }
  }

  return (
    <div className="min-h-screen bg-green-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-6 sm:p-8">
          <div className="text-center mb-6 sm:mb-8">
            <div className="inline-flex items-center justify-center w-12 h-12 sm:w-16 sm:h-16 bg-green-100 rounded-full mb-3 sm:mb-4">
              <svg className="w-6 h-6 sm:w-8 sm:h-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">Admin Access</h1>
            <p className="text-sm sm:text-base text-gray-600">Enter your password to continue</p>
          </div>
          
          <form onSubmit={submit} className="space-y-4 sm:space-y-6">
            <div>
              <label className="block text-sm sm:text-base font-medium text-gray-700 mb-2 sm:mb-3">Admin Password</label>
              <input 
                type="password" 
                value={pass} 
                onChange={(e) => setPass(e.target.value)} 
                className="w-full px-3 py-2 sm:px-4 sm:py-3 text-sm sm:text-base border border-gray-300 rounded-md focus:border-green-500 focus:ring-1 focus:ring-green-500 focus:outline-none transition-all duration-200" 
                placeholder="Enter admin password"
                autoComplete="current-password"
              />
            </div>
            
            {err && (
              <div className="p-3 sm:p-4 bg-red-50 border border-red-200 rounded-md">
                <p className="text-sm sm:text-base text-red-700 font-medium">{err}</p>
              </div>
            )}
            
            <button 
              className="w-full bg-green-600 hover:bg-green-700 text-white font-medium py-2 sm:py-3 px-4 rounded-md shadow-sm hover:shadow-md transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base" 
              disabled={loading} 
              type="submit"
            >
              {loading ? (
                <div className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-4 w-4 sm:h-5 sm:w-5" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span>Signing in...</span>
                </div>
              ) : (
                <span>Sign In</span>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
