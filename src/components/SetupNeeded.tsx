export default function SetupNeeded() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 px-4">
      <div className="max-w-lg w-full space-y-4 text-slate-300">
        <div className="text-3xl">⚙️</div>
        <h1 className="text-xl font-semibold text-slate-100">Firebase isn't configured yet</h1>
        <p className="text-sm leading-relaxed">
          This app needs a free Firebase project so your travel plans can sync across your
          devices. Follow the <strong>"Connect your own Firebase project"</strong> section in{' '}
          <code className="bg-slate-800 px-1.5 py-0.5 rounded text-sky-300">README.md</code>, then
          add the config values to a <code className="bg-slate-800 px-1.5 py-0.5 rounded text-sky-300">.env.local</code> file
          and restart the app.
        </p>
        <p className="text-sm text-slate-500">It takes about five minutes and is free.</p>
      </div>
    </div>
  )
}
