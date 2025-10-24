import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from "react-router-dom";
import { useUser } from './contexts/UserContext';
import { 
  MessageCircle, 
  User, 
  LogOut,
  Menu,
  X
} from 'lucide-react';
import CenteredTabs from './CenteredTabs';
import "./App.css";

export default function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, isAuthenticated, loading, logout } = useUser();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    setIsMenuOpen(false);
  }, [location]);

  const handleLogin = () => {
    navigate("/login");
    setIsMenuOpen(false);
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const handleNavigation = (path) => {
    navigate(path);
    setIsMenuOpen(false);
  };

  const isActivePage = (path) => {
    return location.pathname === path;
  };

  if (loading) {
    return (
      <>
        <nav className="bg-gradient-to-r from-[#834d1a] to-[#6d3e15] shadow-xl sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div className="text-2xl font-bold text-white">MY Thrift</div>
              <div className="animate-spin w-6 h-6 border-2 border-white border-t-transparent rounded-full"></div>
            </div>
          </div>
        </nav>
        <CenteredTabs />
      </>
    );
  }

  return (
    <>
      {/* Main Navbar */}
      <nav className="bg-gradient-to-r from-[#834d1a] to-[#6d3e15] shadow-xl sticky top-0 z-50 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            
            {/* Left Side - Logo Only */}
            <div 
              onClick={() => handleNavigation('/')}
              className="text-2xl font-bold text-white cursor-pointer hover:text-amber-200 transition-colors duration-300"
            >
              MY Thrift
            </div>

            {/* Right Side */}
            <div className="flex items-center space-x-4">
              {isAuthenticated ? (
                <div className="flex items-center space-x-3">
                  {/* Chat Icon - Desktop */}
                  <button 
                    onClick={() => handleNavigation('/chat')}
                    className={`hidden sm:flex items-center justify-center w-10 h-10 rounded-full transition-all duration-300 ${
                      isActivePage('/chat') 
                        ? 'bg-white text-[#834d1a]' 
                        : 'bg-white/20 text-white hover:bg-white/30'
                    }`}
                  >
                    <MessageCircle className="w-5 h-5" />
                  </button>

                  {/* User Avatar with Menu */}
                  <div className="relative group">
                    <button
                      onClick={() => handleNavigation('/account')}
                      className="flex items-center space-x-2 bg-white/20 hover:bg-white/30 rounded-full p-2 transition-all duration-300"
                    >
                      <img
                        className="w-8 h-8 rounded-full object-cover border-2 border-white/50"
                        src={user?.profileImage || user?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || 'User')}&background=ffffff&color=834d1a`}
                        alt="Profile"
                        onError={(e) => {
                          e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || 'User')}&background=ffffff&color=834d1a`;
                        }}
                      />
                      <span className="text-white text-sm font-medium hidden sm:block">
                        {user?.name?.split(' ')[0] || 'User'}
                      </span>
                    </button>

                    {/* Logout Button - appears on hover */}
                    <button
                      onClick={handleLogout}
                      className="absolute top-full right-0 mt-2 bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg text-sm opacity-0 group-hover:opacity-100 transition-all duration-300 whitespace-nowrap z-50"
                    >
                      <LogOut className="w-4 h-4 inline mr-2" />
                      Sign Out
                    </button>
                  </div>
                </div>
              ) : (
                <button 
                  onClick={handleLogin}
                  className="bg-white text-[#834d1a] hover:bg-amber-50 px-6 py-2 rounded-full font-semibold transition-all duration-300 shadow-md hover:shadow-lg"
                >
                  Login
                </button>
              )}

              {/* Mobile Menu Button */}
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="lg:hidden w-10 h-10 flex items-center justify-center rounded-full bg-white/20 hover:bg-white/30 transition-colors"
              >
                {isMenuOpen ? (
                  <X className="w-6 h-6 text-white" />
                ) : (
                  <Menu className="w-6 h-6 text-white" />
                )}
              </button>
            </div>
          </div>

          {/* Mobile Menu */}
          {isMenuOpen && (
            <div className="lg:hidden bg-[#834d1a] border-t border-white/20">
              <div className="px-4 py-4 space-y-3">
                
                {isAuthenticated ? (
                  <>
                    <button
                      onClick={() => handleNavigation('/chat')}
                      className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${
                        isActivePage('/chat') 
                          ? 'bg-white text-[#834d1a]' 
                          : 'text-white hover:bg-white/10'
                      }`}
                    >
                      <MessageCircle className="w-5 h-5" />
                      Messages
                    </button>
                    
                    <button
                      onClick={() => handleNavigation('/account')}
                      className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${
                        isActivePage('/account') 
                          ? 'bg-white text-[#834d1a]' 
                          : 'text-white hover:bg-white/10'
                      }`}
                    >
                      <User className="w-5 h-5" />
                      My Account
                    </button>
                    
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-300 hover:bg-red-500/20 transition-colors"
                    >
                      <LogOut className="w-5 h-5" />
                      Sign Out
                    </button>
                  </>
                ) : (
                  <button 
                    onClick={handleLogin}
                    className="w-full bg-white text-[#834d1a] hover:bg-amber-50 px-6 py-3 rounded-xl font-semibold transition-all duration-300"
                  >
                    Login
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </nav>

      {/* Centered Tabs Navigation */}
      <div className='hidden lg:block'>
        <CenteredTabs/>
        </div>
    </>
  );
}