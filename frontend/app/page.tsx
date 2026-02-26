import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-blue-950 to-blue-900 flex items-center justify-center px-4">
      <main className="max-w-2xl w-full text-center space-y-8">

        {/* Icon */}
        <div className="flex justify-center">
          <div className="w-16 h-16 rounded-2xl bg-blue-600/30 border border-blue-500/30 flex items-center justify-center">
            <svg className="w-8 h-8 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
            </svg>
          </div>
        </div>

        {/* Heading */}
        <div className="space-y-4">
          <h1 className="text-4xl sm:text-5xl font-bold text-white tracking-tight">
            Manage your tasks,{" "}
            <span className="text-blue-400">effortlessly.</span>
          </h1>
          <p className="text-blue-200/70 text-lg max-w-md mx-auto leading-relaxed">
            A simple, secure task manager. Create, organize, and track your tasks with ease.
          </p>
        </div>

        {/* Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/register"
            className="bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white font-semibold px-8 py-3 rounded-lg text-sm transition-colors duration-200"
          >
            Get Started
          </Link>
          <Link
            href="/login"
            className="bg-white/10 hover:bg-white/20 border border-white/20 text-white font-semibold px-8 py-3 rounded-lg text-sm transition-colors duration-200"
          >
            Sign In
          </Link>
        </div>

        {/* Feature Pills */}
        <div className="flex flex-wrap justify-center gap-2 pt-4">
          {['Create & organize tasks', 'Filter by status', 'Search instantly', 'Secure & encrypted'].map(f => (
            <span
              key={f}
              className="bg-white/5 border border-white/10 text-blue-200/60 text-xs px-3 py-1.5 rounded-full"
            >
              {f}
            </span>
          ))}
        </div>

      </main>
    </div>
  );
}