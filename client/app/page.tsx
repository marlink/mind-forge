import Link from 'next/link';
import { Button } from './components/Button';

export default function HomePage() {
  return (
    <main id="main-content" className="min-h-screen p-4 sm:p-8 bg-gray-50">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-8 sm:mb-12 animate-in fade-in">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4">
            MindForge Learning Program
          </h1>
          <p className="text-lg sm:text-xl md:text-2xl text-gray-600 mb-6 sm:mb-8">
            Stop Teaching for Tests. Start Teaching for Brains.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/bootcamps">
              <Button size="lg" className="w-full sm:w-auto">
                Browse Bootcamps
              </Button>
            </Link>
            <Link href="/login">
              <Button variant="outline" size="lg" className="w-full sm:w-auto">
                Sign In
              </Button>
            </Link>
          </div>
        </div>

        <div className="grid sm:grid-cols-1 md:grid-cols-3 gap-6 mt-8 sm:mt-12">
          <div className="p-6 bg-white rounded-lg shadow-md hover:shadow-lg transition-all duration-300 animate-in fade-in" style={{ animationDelay: '100ms' }}>
            <h2 className="text-xl sm:text-2xl font-semibold mb-2">Intensive Learning</h2>
            <p className="text-gray-700 text-sm sm:text-base">
              One-week intensive bootcamps that replace traditional semester models
            </p>
          </div>
          <div className="p-6 bg-white rounded-lg shadow-md hover:shadow-lg transition-all duration-300 animate-in fade-in" style={{ animationDelay: '200ms' }}>
            <h2 className="text-xl sm:text-2xl font-semibold mb-2">Cognitive Development</h2>
            <p className="text-gray-700 text-sm sm:text-base">
              Focus on critical thinking, problem-solving, and independent learning
            </p>
          </div>
          <div className="p-6 bg-white rounded-lg shadow-md hover:shadow-lg transition-all duration-300 animate-in fade-in" style={{ animationDelay: '300ms' }}>
            <h2 className="text-xl sm:text-2xl font-semibold mb-2">Peer Teaching</h2>
            <p className="text-gray-700 text-sm sm:text-base">
              Students become experts and teach their peers, deepening understanding
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}

