import { lazy, Suspense } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import Nav from './components/Nav'
import SignIn from './components/SignIn'
import SetupNeeded from './components/SetupNeeded'
import ItineraryTab from './pages/ItineraryTab'
import IdeasTab from './pages/IdeasTab'
import BookedTab from './pages/BookedTab'
import BudgetTab from './pages/BudgetTab'
import PackingTab from './pages/PackingTab'
import DocumentsTab from './pages/DocumentsTab'

// Map (Leaflet), Recommendations (large static dataset) and Journal (photo
// uploads) are the heaviest routes — load them on demand instead of in the
// main bundle. The public share view is also lazy since most sessions never
// touch it.
const MapTab = lazy(() => import('./pages/MapTab'))
const RecommendationsTab = lazy(() => import('./pages/RecommendationsTab'))
const JournalTab = lazy(() => import('./pages/JournalTab'))
const ContactsTab = lazy(() => import('./pages/ContactsTab'))
const ShareView = lazy(() => import('./pages/ShareView'))

function PageLoading() {
  return <div className="py-16 text-center text-slate-500 text-sm">Loading…</div>
}

function AuthedApp() {
  const { user, loading, configured } = useAuth()

  if (!configured) return <SetupNeeded />

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950 text-slate-400">
        Loading…
      </div>
    )
  }

  if (!user) return <SignIn />

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      <Nav />
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 py-6">
        <Suspense fallback={<PageLoading />}>
          <Routes>
            <Route path="/" element={<ItineraryTab />} />
            <Route path="/ideas" element={<IdeasTab />} />
            <Route path="/booked" element={<BookedTab />} />
            <Route path="/map" element={<MapTab />} />
            <Route path="/journal" element={<JournalTab />} />
            <Route path="/contacts" element={<ContactsTab />} />
            <Route path="/budget" element={<BudgetTab />} />
            <Route path="/packing" element={<PackingTab />} />
            <Route path="/documents" element={<DocumentsTab />} />
            <Route path="/recommendations" element={<RecommendationsTab />} />
          </Routes>
        </Suspense>
      </main>
    </div>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Suspense fallback={<PageLoading />}>
          <Routes>
            {/* Public — no sign-in required, viewable by anyone with the link. */}
            <Route path="/share/:shareId" element={<ShareView />} />
            <Route path="/*" element={<AuthedApp />} />
          </Routes>
        </Suspense>
      </BrowserRouter>
    </AuthProvider>
  )
}
