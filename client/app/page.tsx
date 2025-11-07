import Link from 'next/link';

export default function HomePage() {
  return (
    <main className="min-h-screen p-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold mb-4">
            MindForge Learning Program
          </h1>
          <p className="text-2xl text-gray-600 mb-8">
            Stop Teaching for Tests. Start Teaching for Brains.
          </p>
          <div className="space-x-4">
            <Link
              href="/bootcamps"
              className="px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 font-medium"
            >
              Browse Bootcamps
            </Link>
            <Link
              href="/login"
              className="px-6 py-3 border border-primary-600 text-primary-600 rounded-lg hover:bg-primary-50 font-medium"
            >
              Sign In
            </Link>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-6 mt-12">
          <div className="p-6 bg-white rounded-lg shadow">
            <h2 className="text-2xl font-semibold mb-2">Intensive Learning</h2>
            <p className="text-gray-700">
              One-week intensive bootcamps that replace traditional semester models
            </p>
          </div>
          <div className="p-6 bg-white rounded-lg shadow">
            <h2 className="text-2xl font-semibold mb-2">Cognitive Development</h2>
            <p className="text-gray-700">
              Focus on critical thinking, problem-solving, and independent learning
            </p>
          </div>
          <div className="p-6 bg-white rounded-lg shadow">
            <h2 className="text-2xl font-semibold mb-2">Peer Teaching</h2>
            <p className="text-gray-700">
              Students become experts and teach their peers, deepening understanding
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}

