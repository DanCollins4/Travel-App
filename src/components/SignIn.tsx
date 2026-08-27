import { signIn } from '../firebase'

export default function SignIn() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 px-4">
      <div className="max-w-sm w-full text-center space-y-6">
        <div className="mx-auto w-16 h-16 rounded-2xl bg-sky-500/10 border border-sky-500/30 flex items-center justify-center text-3xl">
          🧭
        </div>
        <div>
          <h1 className="text-2xl font-semibold text-slate-100">Gap Year Planner</h1>
          <p className="mt-2 text-sm text-slate-400">
            Sign in to sync your itinerary, bookings, budget, and map across every device.
          </p>
        </div>
        <button
          onClick={() => signIn()}
          className="w-full flex items-center justify-center gap-3 rounded-xl bg-slate-100 text-slate-900 font-medium py-3 px-4 hover:bg-white transition-colors"
        >
          <svg width="18" height="18" viewBox="0 0 18 18">
            <path
              fill="#4285F4"
              d="M17.64 9.2c0-.64-.06-1.25-.16-1.84H9v3.48h4.84c-.21 1.13-.84 2.09-1.8 2.73v2.27h2.92c1.7-1.57 2.68-3.88 2.68-6.64z"
            />
            <path
              fill="#34A853"
              d="M9 18c2.43 0 4.47-.8 5.96-2.18l-2.92-2.27c-.81.54-1.84.86-3.04.86-2.34 0-4.32-1.58-5.03-3.71H.96v2.34C2.44 15.98 5.48 18 9 18z"
            />
            <path
              fill="#FBBC05"
              d="M3.97 10.7A5.4 5.4 0 013.68 9c0-.59.1-1.17.29-1.7V4.96H.96A9 9 0 000 9c0 1.45.35 2.83.96 4.04l3.01-2.34z"
            />
            <path
              fill="#EA4335"
              d="M9 3.58c1.32 0 2.51.45 3.44 1.35l2.58-2.58C13.46.89 11.43 0 9 0 5.48 0 2.44 2.02.96 4.96l3.01 2.34C4.68 5.16 6.66 3.58 9 3.58z"
            />
          </svg>
          Continue with Google
        </button>
        <p className="text-xs text-slate-500">
          Your data is private to your account and stored securely in Firebase.
        </p>
      </div>
    </div>
  )
}
