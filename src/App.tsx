import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { Footer } from './components/layout/Footer';
import { Navbar } from './components/layout/Navbar';
import { AuthProvider } from './auth/AuthContext';
import { ProtectedRoute } from './auth/ProtectedRoute';
import { AboutPage } from './pages/AboutPage';
import { AnalysisPage } from './pages/AnalysisPage';
import { ComplianceResultPage } from './pages/ComplianceResultPage';
import { CompleteProfilePage } from './pages/CompleteProfilePage';
import { DashboardPage } from './pages/DashboardPage';
import { HistoryPage } from './pages/HistoryPage';
import { HowItWorksPage } from './pages/HowItWorksPage';
import { LandingPage } from './pages/LandingPage';
import { LoginPage } from './pages/LoginPage';
import { ProfilePage } from './pages/ProfilePage';
import { ReportsPage } from './pages/ReportsPage';
import { ScanPage } from './pages/ScanPage';
import { SettingsPage } from './pages/SettingsPage';
import { SignupPage } from './pages/SignupPage';
import { ViolationDetailsPage } from './pages/ViolationDetailsPage';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <div className="app-shell relative min-h-screen overflow-x-hidden bg-[#020b17] text-slate-200">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_18%_16%,rgba(34,211,238,0.08),transparent_34%),radial-gradient(circle_at_78%_24%,rgba(59,130,246,0.08),transparent_30%),radial-gradient(circle_at_50%_88%,rgba(34,211,238,0.05),transparent_36%)]" />
          <div className="pointer-events-none absolute inset-0 opacity-[0.08] [background-image:linear-gradient(rgba(148,163,184,0.10)_1px,transparent_1px),linear-gradient(90deg,rgba(148,163,184,0.10)_1px,transparent_1px)] [background-size:48px_48px]" />
          <div className="pointer-events-none absolute inset-0 opacity-[0.06] [background-image:radial-gradient(rgba(148,163,184,0.18)_0.8px,transparent_0.8px)] [background-size:16px_16px] [background-position:center]" />
          <div className="pointer-events-none absolute inset-x-0 top-0 h-36 bg-gradient-to-b from-cyan-500/[0.03] to-transparent" />
          <div className="bottom-surface-fade pointer-events-none absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-slate-950 via-slate-950/80 to-transparent" />
          <div className="ambient-glow ambient-glow-left" />
          <div className="ambient-glow ambient-glow-right" />
          <div className="pointer-events-none absolute left-[12%] top-[16%] h-[58%] w-[70%] rounded-[48px] border border-cyan-500/10 bg-cyan-500/[0.01] blur-xl opacity-60" />
          <div className="pointer-events-none absolute inset-y-0 left-0 w-px bg-gradient-to-b from-transparent via-cyan-500/6 to-transparent" />
          <div className="pointer-events-none absolute inset-y-0 right-0 w-px bg-gradient-to-b from-transparent via-blue-500/6 to-transparent" />
          <div className="pointer-events-none absolute inset-x-[12%] top-[14%] h-[72%] opacity-10 [background-image:linear-gradient(to_bottom,transparent_0%,rgba(34,211,238,0.04)_48%,transparent_100%)]" />
          <Navbar />
          <main className="relative min-h-[calc(100vh-120px)] pt-[68px]">
            <Routes>
              <Route path="/" element={<LandingPage />} />
              <Route path="/how-it-works" element={<HowItWorksPage />} />
              <Route path="/sign-in/*" element={<LoginPage />} />
              <Route path="/sign-up/*" element={<SignupPage />} />
              <Route path="/login/*" element={<LoginPage />} />
              <Route path="/signup/*" element={<SignupPage />} />
              <Route path="/complete-profile" element={<ProtectedRoute><CompleteProfilePage /></ProtectedRoute>} />

              <Route path="/dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
              <Route path="/scan" element={<ProtectedRoute><ScanPage /></ProtectedRoute>} />
              <Route path="/scan-product" element={<ProtectedRoute><ScanPage /></ProtectedRoute>} />
              <Route path="/my-products" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
              <Route path="/history" element={<ProtectedRoute><HistoryPage /></ProtectedRoute>} />
              <Route path="/reports" element={<ProtectedRoute><ReportsPage /></ProtectedRoute>} />
              <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
              <Route path="/settings" element={<ProtectedRoute><SettingsPage /></ProtectedRoute>} />

              <Route path="/analysis" element={<ProtectedRoute><AnalysisPage /></ProtectedRoute>} />
              <Route path="/result/:id" element={<ProtectedRoute><ComplianceResultPage /></ProtectedRoute>} />
              <Route path="/report/:id" element={<ProtectedRoute><ComplianceResultPage /></ProtectedRoute>} />
              <Route path="/violations/:id" element={<ProtectedRoute><ViolationDetailsPage /></ProtectedRoute>} />

              <Route path="/about" element={<AboutPage />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>
          <Footer />
        </div>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
