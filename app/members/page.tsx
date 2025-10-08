import Login from '../admin/Login';
import { cookies } from 'next/headers';
import SignOutButton from '../../components/SignOutButton';
import MembersFiles from '../../components/MembersFiles';

export default async function MembersPage() {
  // Check the admin_auth cookie server-side
  const cookieStore = await cookies();
  const auth = cookieStore.get('admin_auth');

  // If not authenticated, render the client Login form so they can sign in
  if (!auth) {
    // Login is a client component; render it and let it refresh the page on success
    return (
      <div className="min-h-screen flex items-center justify-center p-8">
        <div className="max-w-md w-full bg-white rounded shadow p-6">
          <h1 className="text-xl font-semibold mb-4">Members Area</h1>
          <p className="mb-4">Please sign in to access members-only content.</p>
          {/* @ts-ignore - Login is a client component */}
          <Login />
        </div>
      </div>
    );
  }

  // Authenticated: show protected content
  return (
    <div className="min-h-screen bg-green-50 p-8">
      <div className="max-w-4xl mx-auto bg-white rounded shadow p-6">
        <div className="flex items-start justify-between">
          <h1 className="text-2xl font-semibold">Members Area</h1>
          <SignOutButton />
        </div>

        <p className="mt-4 text-gray-700">Welcome to the members-only section. Add your exclusive content here (events, documents, member resources).</p>

        {/* Members files upload/list component */}
        <section className="mt-6">
          <h2 className="text-lg font-semibold mb-2">Resources</h2>
          <p className="text-sm text-gray-600 mb-4">Meeting minutes and member documents (PDF).</p>
          {/* Client component for uploading/listing PDFs */}
          {/* @ts-ignore client component import allowed in server component */}
          <script type="module" dangerouslySetInnerHTML={{ __html: '' }} />
          {/* The actual client component is imported below via dynamic client rendering */}
          <MembersFiles />
        </section>
      </div>
    </div>
  );
}
