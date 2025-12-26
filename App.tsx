import React, { useEffect, useRef } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
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
import ApplicationHistory from './pages/ApplicationHistory';
import AdminLogin from './pages/AdminLogin';
import AdminDashboard from './pages/AdminDashboard';
import AdminProtectedRoute from './components/AdminProtectedRoute';
import { AppProvider, useApp } from './context/AppContext';
import { ThemeProvider } from './context/ThemeContext';

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
  const { user, logout } = useApp();
  const location = useLocation();
  const previousPath = useRef<string | null>(null);

  // Define protected and public routes
  const protectedRoutes = ['/dashboard', '/plans', '/setup', '/history'];
  const publicRoutes = ['/', '/login', '/signup', '/pricing', '/privacy-policy', '/terms', '/refund-policy', '/contact', '/about', '/why-we-built', '/api-tester'];

  // Monitor navigation and automatically logout when leaving Dashboard to public routes
  useEffect(() => {
    const currentPath = location.pathname;

    // Check if user is logged in and navigating from protected route to public route
    if (previousPath.current && user.isLoggedIn) {
      const wasOnProtectedRoute = protectedRoutes.some(route => previousPath.current?.startsWith(route));
      const isGoingToPublicRoute = publicRoutes.some(route => currentPath.startsWith(route));

      if (wasOnProtectedRoute && isGoingToPublicRoute) {
        // Automatically logout when navigating from Dashboard to main website
        logout();
      }
    }

    // Update previous path for next navigation
    previousPath.current = currentPath;
  }, [location.pathname, user.isLoggedIn, logout]);

  // Check if current route is admin route
  const isAdminRoute = location.pathname.startsWith('/admin');

  return (
    <div className="bg-gray-50 dark:bg-dark-900 min-h-screen text-gray-900 dark:text-slate-200 font-sans selection:bg-neon-blue selection:text-black flex flex-col transition-colors duration-200">
      {!isAdminRoute && <Navbar />}
      <main className="flex-grow">
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<AuthRoute><Auth type="login" /></AuthRoute>} />
          <Route path="/signup" element={<AuthRoute><Auth type="signup" /></AuthRoute>} />
          <Route path="/plans" element={<ProtectedRoute><Plans /></ProtectedRoute>} />
          <Route path="/setup" element={<ProtectedRoute><ProfileSetup /></ProtectedRoute>} />
          <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/history" element={<ProtectedRoute><ApplicationHistory /></ProtectedRoute>} />
          <Route path="/api-tester" element={<APITester />} />
          <Route path="/pricing" element={<Pricing />} />
          <Route path="/privacy-policy" element={<PrivacyPolicy />} />
          <Route path="/terms" element={<TermsConditions />} />
          <Route path="/refund-policy" element={<RefundPolicy />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/about" element={<AboutUs />} />
          <Route path="/why-we-built" element={<WhyWeBuilt />} />

          {/* Admin Routes */}
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/admin/dashboard" element={<AdminProtectedRoute><AdminDashboard /></AdminProtectedRoute>} />
        </Routes>
      </main>
      {!user.isLoggedIn && !isAdminRoute && <Footer />}
    </div>
  );
};

const App: React.FC = () => {
  return (
    <ThemeProvider>
      <AppProvider>
        <Router>
          <AppContent />
        </Router>
      </AppProvider>
    </ThemeProvider>
  );
};

export default App;