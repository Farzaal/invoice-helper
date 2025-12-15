import React, { useState, useRef, useEffect } from 'react';
import { User, LogOut } from 'lucide-react';
import { InvoiceForm } from './components/InvoiceForm';
import { InvoiceList } from './components/InvoiceList';
import { Login } from './components/Login';

type ViewState = 'list' | 'form';

// Event bus for 401 handling
export const UNAUTHORIZED_EVENT = 'auth:unauthorized';

const App: React.FC = () => {
  const [token, setToken] = useState<string | null>(localStorage.getItem('auth_token'));
  const [user, setUser] = useState<any>(
    localStorage.getItem('auth_user') ? JSON.parse(localStorage.getItem('auth_user')!) : null
  );
  
  const [currentView, setCurrentView] = useState<ViewState>('list');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Handle Logout Logic
  const handleLogout = () => {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('auth_user');
    setToken(null);
    setUser(null);
    setCurrentView('list');
    setIsDropdownOpen(false);
  };

  // Listen for global unauthorized events (401)
  useEffect(() => {
    const handleUnauthorized = () => {
      handleLogout();
    };

    window.addEventListener(UNAUTHORIZED_EVENT, handleUnauthorized);
    return () => {
      window.removeEventListener(UNAUTHORIZED_EVENT, handleUnauthorized);
    };
  }, []);

  const handleLoginSuccess = (newToken: string, userData: any) => {
    localStorage.setItem('auth_token', newToken);
    localStorage.setItem('auth_user', JSON.stringify(userData));
    setToken(newToken);
    setUser(userData);
  };

  // Public Route: Login
  if (!token) {
    return <Login onLoginSuccess={handleLoginSuccess} />;
  }

  // Private Routes: App
  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center gap-2 cursor-pointer" onClick={() => setCurrentView('list')}>
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold text-xl">
                P
              </div>
              <span className="text-xl font-bold text-gray-900">ProInvoice</span>
            </div>
            
            <div className="flex items-center">
              {/* User Dropdown */}
              <div className="relative" ref={dropdownRef}>
                <button 
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className="flex items-center focus:outline-none group"
                  aria-label="User menu"
                >
                  <div className="w-8 h-8 rounded-full bg-gray-200 border-2 border-white shadow-sm overflow-hidden group-hover:ring-2 group-hover:ring-blue-100 transition-all">
                     <img 
                       src={user?.avatar || "https://picsum.photos/100/100"} 
                       alt="User" 
                       className="w-full h-full object-cover" 
                     />
                  </div>
                </button>

                {isDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-gray-100 py-1.5 animate-in fade-in zoom-in-95 duration-100 origin-top-right z-50">
                    <div className="px-4 py-3 border-b border-gray-100 mb-1">
                      <p className="text-sm font-medium text-gray-900">{user?.name || 'User'}</p>
                      <p className="text-xs text-gray-500 truncate" title={user?.email}>{user?.email || 'user@example.com'}</p>
                    </div>
                    
                    <button 
                      onClick={() => setIsDropdownOpen(false)}
                      className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-blue-600 flex items-center gap-2 transition-colors"
                    >
                      <User className="w-4 h-4" /> 
                      My Profile
                    </button>
                    
                    <button 
                      onClick={handleLogout}
                      className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2 transition-colors"
                    >
                      <LogOut className="w-4 h-4" /> 
                      Logout
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </nav>
      
      <main className="py-8">
        {currentView === 'list' ? (
          <InvoiceList onCreateNew={() => setCurrentView('form')} />
        ) : (
          <InvoiceForm onCancel={() => setCurrentView('list')} />
        )}
      </main>
    </div>
  );
};

export default App;