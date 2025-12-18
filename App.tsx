import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Landing from './pages/Landing';
import Auth from './pages/Auth';
import Plans from './pages/Plans';
import ProfileSetup from './pages/ProfileSetup';
import Dashboard from './pages/Dashboard';
import APITester from './pages/APITester';
import Pricing from './pages/Pricing';
import PrivacyPolicy from './pages/PrivacyPolicy';
import TermsConditions from './pages/TermsConditions';
import RefundPolicy from './pages/RefundPolicy';
import Contact from './pages/Contact';
import AboutUs from './pages/AboutUs';
import WhyWeBuilt from './pages/WhyWeBuilt';
import { AppProvider, useApp } from './context/AppContext';

// Protected Route Component - redirects to login if not authenticated
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user } = useApp();
  if (!user.isLoggedIn) {
    return <Navigate to="/login" replace />;
  }
  return <>{children}</>;
};

// Auth Route Component - redirects to dashboard if already logged in
const AuthRoute = ({ children }: { children: React.ReactNode }) => {
  const { user } = useApp();
  if (user.isLoggedIn) {
    return <Navigate to="/dashboard" replace />;
  }
  return <>{children}</>;
};

const AppContent: React.FC = () => {
  const { user } = useApp();

  return (
    <div className="bg-dark-900 min-h-screen text-slate-200 font-sans selection:bg-neon-blue selection:text-black flex flex-col">
      <Navbar />
      <main className="flex-grow">
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<AuthRoute><Auth type="login" /></AuthRoute>} />
          <Route path="/signup" element={<AuthRoute><Auth type="signup" /></AuthRoute>} />
          <Route path="/plans" element={<ProtectedRoute><Plans /></ProtectedRoute>} />
          <Route path="/setup" element={<ProtectedRoute><ProfileSetup /></ProtectedRoute>} />
          <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/api-tester" element={<APITester />} />
          <Route path="/pricing" element={<Pricing />} />
          <Route path="/privacy-policy" element={<PrivacyPolicy />} />
          <Route path="/terms" element={<TermsConditions />} />
          <Route path="/refund-policy" element={<RefundPolicy />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/about" element={<AboutUs />} />
          <Route path="/why-we-built" element={<WhyWeBuilt />} />
        </Routes>
      </main>
      {!user.isLoggedIn && <Footer />}
    </div>
  );
};

const App: React.FC = () => {
  return (
    <AppProvider>
      <Router>
        <AppContent />
      </Router>
    </AppProvider>
  );
};

export default App;