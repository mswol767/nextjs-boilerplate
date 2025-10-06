import Image from "next/image";

export default function Home() {
  return (
    <div className="font-sans min-h-screen bg-green-50 text-gray-900">
      {/* Header */}
      <header className="bg-green-800 w-full py-6">
        <h1 className="text-center text-4xl font-bold text-white">
          Cromwell Fish & Game Club
        </h1>
      </header>

      {/* Main content */}
      <main className="p-8 sm:p-20 flex flex-col gap-16 items-center">
        {/* Club intro */}
        <section className="max-w-3xl text-center">
          <p className="text-lg">
            Welcome to the Cromwell Fish & Game Club! Join us for outdoor activities, hunting, fishing, and community events in a safe and friendly environment.
          </p>
        </section>

        {/* Events */}
        <section className="max-w-3xl w-full">
          <h2 className="text-2xl font-semibold mb-4">Upcoming Events</h2>
          <ul className="list-disc list-inside space-y-2">
            <li>October 12: Fall Hunting Seminar</li>
            <li>October 19: Youth Fishing Day</li>
            <li>November 5: Annual Membership Meeting</li>
          </ul>
        </section>

        {/* Membership info */}
        <section className="max-w-3xl w-full">
          <h2 className="text-2xl font-semibold mb-4">Become a Member</h2>
          <p className="mb-4">
            Membership includes access to our club facilities, participation in events, and the chance to join a community of outdoor enthusiasts.
          </p>
          <a
            href="#"
            className="inline-block bg-green-800 text-white px-6 py-3 rounded hover:bg-green-700 transition"
          >
            Join Now
          </a>
        </section>

        {/* Optional club image */}
        <section>
          <Image
            src="/clubhouse.jpg" // replace with your own image
            alt="Cromwell Fish & Game Club"
            width={600}
            height={400}
            className="rounded shadow-lg"
          />
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-green-800 w-full py-6 text-center text-white">
        &copy; {new Date().getFullYear()} Cromwell Fish & Game Club. All rights reserved.
      </footer>
    </div>
  );
}
