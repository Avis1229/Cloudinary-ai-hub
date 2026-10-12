'use client';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html>
      <body className="min-h-screen bg-[#faf8f5] text-[#1c1c19] flex items-center justify-center p-6 font-sans">
        <div className="max-w-md w-full text-center bg-white p-8 rounded-2xl shadow-xl border border-gray-100">
          <div className="w-12 h-12 mx-auto mb-4 bg-amber-50 text-amber-600 rounded-full flex items-center justify-center text-2xl font-bold">
            !
          </div>
          <h2 className="text-xl font-bold mb-2">Something went wrong</h2>
          <p className="text-sm text-gray-600 mb-6">
            We are having trouble connecting to the service. Please try again.
          </p>
          <div className="flex gap-3 justify-center">
            <button
              onClick={() => reset()}
              className="px-5 py-2.5 bg-black text-white rounded-xl text-sm font-semibold hover:bg-gray-800 transition-colors"
            >
              Try again
            </button>
            <button
              onClick={() => window.location.href = '/'}
              className="px-5 py-2.5 bg-gray-100 text-gray-800 rounded-xl text-sm font-semibold hover:bg-gray-200 transition-colors"
            >
              Home
            </button>
          </div>
        </div>
      </body>
    </html>
  );
}
