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

// Map (Leaflet) and Recommendations (large static dataset) are the heaviest
// routes — load them on demand instead of in the main bundle.
const MapTab = lazy(() => import('./pages/MapTab'))
const RecommendationsTab = lazy(() => import('./pages/RecommendationsTab'))

function PageLoading() {
  return <div className="py-16 text-center text-slate-500 text-sm">Loading…</div>
}

function Gate() {
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
    <BrowserRouter>
      <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
        <Nav />
        <main className="flex-1 max-w-6xl w-full mx-auto px-4 py-6">
          <Suspense fallback={<PageLoading />}>
            <Routes>
              <Route path="/" element={<ItineraryTab />} />
              <Route path="/ideas" element={<IdeasTab />} />
              <Route path="/booked" element={<BookedTab />} />
              <Route path="/map" element={<MapTab />} />
              <Route path="/budget" element={<BudgetTab />} />
              <Route path="/packing" element={<PackingTab />} />
              <Route path="/documents" element={<DocumentsTab />} />
              <Route path="/recommendations" element={<RecommendationsTab />} />
            </Routes>
          </Suspense>
        </main>
      </div>
    </BrowserRouter>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <Gate />
    </AuthProvider>
  )
}
