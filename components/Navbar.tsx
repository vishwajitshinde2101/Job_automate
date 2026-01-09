
import React, { useState, useEffect } from 'react';
import { Menu, X, Cpu, User as UserIcon, LogOut, LayoutDashboard, Download, ChevronDown } from 'lucide-react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useApp } from '../context/AppContext';

const Navbar: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [showDownloadDropdown, setShowDownloadDropdown] = useState(false);
  const { user, logout } = useApp();
  const navigate = useNavigate();
  const location = useLocation();
  const isLandingPage = location.pathname === '/';

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const isDashboard = location.pathname.includes('dashboard') || location.pathname.includes('setup');

  // If on dashboard, render nothing (Sidebar takes over) or a minimal version
  // For this design, we'll keep navbar on landing/auth pages, but hide it on Dashboard to rely on Sidebar
  if (isDashboard) return null;

  return (
    <nav className={`fixed w-full z-50 transition-all duration-300 ${
      scrolled ? 'bg-white/90 dark:bg-dark-900/90 backdrop-blur-md border-b border-gray-200 dark:border-white/10 shadow-sm' : 'bg-transparent'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          <Link to="/" className="flex-shrink-0 flex items-center gap-2 cursor-pointer">
            <Cpu className="h-8 w-8 text-neon-blue animate-pulse" />
            <span className="font-heading font-bold text-2xl tracking-tight text-gray-900 dark:text-white">
              Auto<span className="text-neon-blue">Jobzy</span>
            </span>
          </Link>

          <div className="hidden md:block">
            <div className="ml-10 flex items-center space-x-8">
              {!user.isLoggedIn ? (
                <>
                  {!isLandingPage && (
                    <>
                      <a href="/#features" className="text-gray-700 dark:text-gray-300 hover:text-neon-blue transition-colors px-3 py-2 rounded-md text-sm font-medium">Features</a>
                      <a href="/#pricing" className="text-gray-700 dark:text-gray-300 hover:text-neon-blue transition-colors px-3 py-2 rounded-md text-sm font-medium">Pricing</a>
                      <Link to="/login">
                        <button className="border border-neon-blue text-neon-blue hover:bg-neon-blue hover:text-black dark:hover:text-black transition-all duration-300 px-6 py-2 rounded-full font-medium shadow-[0_0_15px_rgba(0,243,255,0.3)] hover:shadow-[0_0_25px_rgba(0,243,255,0.6)]">
                          Login
                        </button>
                      </Link>
                      <Link to="/signup">
                        <button className="bg-gray-900 dark:bg-white text-white dark:text-black hover:bg-gray-800 dark:hover:bg-gray-200 transition-colors px-6 py-2 rounded-full font-medium">
                          Get Started
                        </button>
                      </Link>
                    </>
                  )}
                  {isLandingPage && (
                    <div className="relative">
                      <button
                        onClick={() => setShowDownloadDropdown(!showDownloadDropdown)}
                        className="bg-neon-blue text-black hover:bg-white transition-all duration-300 px-8 py-3 rounded-full font-bold text-lg shadow-[0_0_20px_rgba(0,243,255,0.4)] hover:shadow-[0_0_30px_rgba(0,243,255,0.6)] flex items-center gap-2"
                      >
                        <Download className="w-5 h-5" />
                        Download the Application
                        <ChevronDown className="w-4 h-4" />
                      </button>

                      {showDownloadDropdown && (
                        <div className="absolute right-0 mt-2 w-64 bg-white dark:bg-dark-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden z-50">
                          <a
                            href="#"
                            className="flex items-center gap-3 px-6 py-4 hover:bg-gray-100 dark:hover:bg-dark-700 transition-colors border-b border-gray-200 dark:border-gray-700"
                            onClick={() => setShowDownloadDropdown(false)}
                          >
                            <Download className="w-5 h-5 text-neon-blue" />
                            <div>
                              <div className="font-semibold text-gray-900 dark:text-white">Download for Mac</div>
                              <div className="text-xs text-gray-500">macOS 10.15+</div>
                            </div>
                          </a>
                          <a
                            href="#"
                            className="flex items-center gap-3 px-6 py-4 hover:bg-gray-100 dark:hover:bg-dark-700 transition-colors"
                            onClick={() => setShowDownloadDropdown(false)}
                          >
                            <Download className="w-5 h-5 text-neon-blue" />
                            <div>
                              <div className="font-semibold text-gray-900 dark:text-white">Download for Windows</div>
                              <div className="text-xs text-gray-500">Windows 10+</div>
                            </div>
                          </a>
                        </div>
                      )}
                    </div>
                  )}
                </>
              ) : (
                <>
                  <Link to="/dashboard" className="text-gray-700 dark:text-gray-300 hover:text-neon-blue flex items-center gap-2">
                    <LayoutDashboard className="w-4 h-4" /> Go to Dashboard
                  </Link>
                </>
              )}
            </div>
          </div>

          <div className="-mr-2 flex md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none"
            >
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {isOpen && (
        <div className="md:hidden bg-white dark:bg-dark-900 border-b border-gray-200 dark:border-white/10">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            {!user.isLoggedIn ? (
              <>
                {!isLandingPage ? (
                  <>
                    <Link to="/login" className="block px-3 py-2 rounded-md text-base font-medium text-gray-900 dark:text-white bg-gray-100 dark:bg-dark-800 hover:bg-gray-200 dark:hover:bg-dark-700" onClick={() => setIsOpen(false)}>Login</Link>
                    <Link to="/signup" className="block px-3 py-2 rounded-md text-base font-medium text-black bg-neon-blue hover:bg-neon-blue/90" onClick={() => setIsOpen(false)}>Sign Up</Link>
                  </>
                ) : (
                  <>
                    <a href="#" className="flex items-center gap-3 px-3 py-3 rounded-md text-base font-medium text-gray-900 dark:text-white bg-gray-100 dark:bg-dark-800 hover:bg-gray-200 dark:hover:bg-dark-700" onClick={() => setIsOpen(false)}>
                      <Download className="w-5 h-5 text-neon-blue" />
                      Download for Mac
                    </a>
                    <a href="#" className="flex items-center gap-3 px-3 py-3 rounded-md text-base font-medium text-gray-900 dark:text-white bg-gray-100 dark:bg-dark-800 hover:bg-gray-200 dark:hover:bg-dark-700" onClick={() => setIsOpen(false)}>
                      <Download className="w-5 h-5 text-neon-blue" />
                      Download for Windows
                    </a>
                  </>
                )}
              </>
            ) : (
              <Link to="/dashboard" className="block px-3 py-2 rounded-md text-base font-medium text-gray-900 dark:text-white bg-gray-100 dark:bg-dark-800 hover:bg-gray-200 dark:hover:bg-dark-700" onClick={() => setIsOpen(false)}>Dashboard</Link>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
