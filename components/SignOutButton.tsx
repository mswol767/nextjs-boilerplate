"use client";

import { useState } from 'react';

export default function SignOutButton({ onSignedOut }: { onSignedOut?: () => void }) {
  const [loading, setLoading] = useState(false);

  async function signOut() {
    setLoading(true);
    try {
      await fetch('/api/admin/logout', { method: 'POST' });
      if (onSignedOut) onSignedOut(); else window.location.href = '/';
    } catch (err) {
      window.location.href = '/';
    }
  }

  return (
    <button onClick={signOut} disabled={loading} className="text-sm text-red-700 underline">
      {loading ? 'Signing out...' : 'Sign out'}
    </button>
  );
}
