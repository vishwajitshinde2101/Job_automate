
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
                        className="group relative bg-gradient-to-r from-neon-blue via-neon-purple to-neon-blue bg-[length:200%_100%] text-white hover:bg-right-bottom transition-all duration-500 px-8 py-3 rounded-full font-bold text-lg shadow-[0_0_30px_rgba(0,243,255,0.6)] hover:shadow-[0_0_40px_rgba(188,19,254,0.8)] flex items-center gap-2 animate-gradient-x overflow-hidden"
                      >
                        <span className="absolute inset-0 bg-white opacity-0 group-hover:opacity-20 transition-opacity duration-300"></span>
                        <Download className="w-5 h-5 group-hover:animate-bounce relative z-10" />
                        <span className="relative z-10">Download the Application</span>
                        <ChevronDown className={`w-4 h-4 transition-transform duration-300 relative z-10 ${showDownloadDropdown ? 'rotate-180' : ''}`} />

                        {/* Pulsing badge */}
                        <span className="absolute -top-1 -right-1 flex h-3 w-3">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-neon-green opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-3 w-3 bg-neon-green"></span>
                        </span>
                      </button>

                      {showDownloadDropdown && (
                        <div className="absolute right-0 mt-3 w-72 bg-gradient-to-br from-white to-gray-50 dark:from-dark-800 dark:to-dark-900 rounded-2xl shadow-2xl border-2 border-neon-blue/30 overflow-hidden z-50 animate-slide-down">
                          {/* Glow effect on top */}
                          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-neon-blue via-neon-purple to-neon-blue"></div>

                          <a
                            href="#"
                            className="group/item flex items-center gap-4 px-6 py-5 hover:bg-gradient-to-r hover:from-neon-blue/10 hover:to-neon-purple/10 transition-all duration-300 border-b border-gray-200 dark:border-gray-700 relative overflow-hidden"
                            onClick={() => setShowDownloadDropdown(false)}
                          >
                            <div className="absolute inset-0 bg-gradient-to-r from-neon-blue/0 via-neon-blue/20 to-neon-blue/0 translate-x-[-100%] group-hover/item:translate-x-[100%] transition-transform duration-700"></div>

                            <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br from-neon-blue/20 to-neon-purple/20 group-hover/item:scale-110 transition-transform duration-300">
                              <Download className="w-6 h-6 text-neon-blue group-hover/item:animate-bounce" />
                            </div>
                            <div className="flex-1 relative z-10">
                              <div className="font-bold text-gray-900 dark:text-white flex items-center gap-2">
                                Download for Mac
                                <span className="text-xs px-2 py-0.5 rounded-full bg-green-500/20 text-green-600 dark:text-green-400 font-normal">Free</span>
                              </div>
                              <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">macOS 10.15 or later</div>
                            </div>
                            <ChevronDown className="w-5 h-5 text-gray-400 -rotate-90 group-hover/item:translate-x-1 transition-transform" />
                          </a>

                          <a
                            href="#"
                            className="group/item flex items-center gap-4 px-6 py-5 hover:bg-gradient-to-r hover:from-neon-purple/10 hover:to-neon-blue/10 transition-all duration-300 relative overflow-hidden"
                            onClick={() => setShowDownloadDropdown(false)}
                          >
                            <div className="absolute inset-0 bg-gradient-to-r from-neon-purple/0 via-neon-purple/20 to-neon-purple/0 translate-x-[-100%] group-hover/item:translate-x-[100%] transition-transform duration-700"></div>

                            <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br from-neon-purple/20 to-neon-blue/20 group-hover/item:scale-110 transition-transform duration-300">
                              <Download className="w-6 h-6 text-neon-purple group-hover/item:animate-bounce" />
                            </div>
                            <div className="flex-1 relative z-10">
                              <div className="font-bold text-gray-900 dark:text-white flex items-center gap-2">
                                Download for Windows
                                <span className="text-xs px-2 py-0.5 rounded-full bg-green-500/20 text-green-600 dark:text-green-400 font-normal">Free</span>
                              </div>
                              <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Windows 10 or later</div>
                            </div>
                            <ChevronDown className="w-5 h-5 text-gray-400 -rotate-90 group-hover/item:translate-x-1 transition-transform" />
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
                    <a
                      href="#"
                      className="group flex items-center gap-3 px-4 py-4 rounded-xl text-base font-bold text-white bg-gradient-to-r from-neon-blue to-neon-purple hover:shadow-[0_0_20px_rgba(0,243,255,0.6)] transition-all duration-300 relative overflow-hidden"
                      onClick={() => setIsOpen(false)}
                    >
                      <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-10 transition-opacity"></div>
                      <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-white/20">
                        <Download className="w-5 h-5 text-white group-hover:animate-bounce" />
                      </div>
                      <div className="flex-1 relative z-10">
                        <div>Download for Mac</div>
                        <div className="text-xs text-white/70 font-normal">macOS 10.15+</div>
                      </div>
                    </a>
                    <a
                      href="#"
                      className="group flex items-center gap-3 px-4 py-4 rounded-xl text-base font-bold text-white bg-gradient-to-r from-neon-purple to-neon-blue hover:shadow-[0_0_20px_rgba(188,19,254,0.6)] transition-all duration-300 relative overflow-hidden"
                      onClick={() => setIsOpen(false)}
                    >
                      <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-10 transition-opacity"></div>
                      <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-white/20">
                        <Download className="w-5 h-5 text-white group-hover:animate-bounce" />
                      </div>
                      <div className="flex-1 relative z-10">
                        <div>Download for Windows</div>
                        <div className="text-xs text-white/70 font-normal">Windows 10+</div>
                      </div>
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
