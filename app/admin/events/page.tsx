import { cookies } from 'next/headers';
import Login from '../Login';
import SignOutButton from '../../../components/SignOutButton';
import EventsManager from '../../../components/EventsManager';

export default async function AdminEventsPage() {
  // Check the admin_auth cookie server-side
  const cookieStore = await cookies();
  const auth = cookieStore.get('admin_auth');

  // If not authenticated, render the client Login form
  if (!auth) {
    return (
      <div className="min-h-screen flex items-center justify-center p-8">
        <div className="max-w-md w-full bg-white rounded shadow p-6">
          <h1 className="text-xl font-semibold mb-4">Events Management</h1>
          <p className="mb-4">Please sign in to manage events.</p>
          {/* @ts-ignore - Login is a client component */}
          <Login />
        </div>
      </div>
    );
  }

  // Authenticated: show events management interface
  return (
    <div className="min-h-screen bg-green-50 p-8">
      <div className="max-w-6xl mx-auto bg-white rounded shadow p-6">
        <div className="flex items-start justify-between mb-6">
          <div>
            <h1 className="text-2xl font-semibold">Events Management</h1>
            <p className="text-gray-600 mt-1">Add, edit, and remove club events</p>
          </div>
          <div className="flex gap-3">
            <a 
              href="/admin/waitlist" 
              className="btn-secondary"
            >
              Manage Waitlist
            </a>
            <SignOutButton />
          </div>
        </div>

        {/* Events management component */}
        {/* @ts-ignore client component import allowed in server component */}
        <EventsManager />
      </div>
    </div>
  );
}
