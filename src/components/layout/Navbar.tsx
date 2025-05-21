import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Bell, Menu, MessageSquare, User } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { Avatar } from '../ui/Avatar';
import { Button } from '../ui/Button';
import axios from 'axios';

interface NavbarProps {
  toggleSidebar: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ toggleSidebar }) => {
  const { user, Token: token, logout } = useAuthStore();
  const navigate = useNavigate();
  const [dropdownOpen, setDropdownOpen] = React.useState(false);
  const [notifOpen, setNotifOpen] = React.useState(false);
  const dropdownRef = React.useRef<HTMLDivElement>(null);
  const notifRef = React.useRef<HTMLDivElement>(null);

  // Notifications state
  const [notifications, setNotifications] = React.useState<any[]>([]);
  const [notifLoading, setNotifLoading] = React.useState(false);

  // Fetch notifications
  React.useEffect(() => {
    if (!user) return;
    const fetchNotifications = async () => {
      setNotifLoading(true);
      try {
        const res = await axios.get('http://127.0.0.1:7000/notifications/notifications', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setNotifications(res.data);
      } catch {
        setNotifications([]);
      } finally {
        setNotifLoading(false);
      }
    };
    fetchNotifications();
    // Optionally poll every 60s:
    // const interval = setInterval(fetchNotifications, 60000);
    // return () => clearInterval(interval);
  }, [user, token]);

  // Unread count
  const unreadCount = notifications.filter(n => !n.is_read).length;

  // Mark all as read (not implemented in backend, so just update UI)
  const markAllAsRead = async () => {
    setNotifications(notifications.map(n => ({ ...n, is_read: true })));
  };

  // Dropdown close logic
  const handleClickOutside = (event: MouseEvent) => {
    if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
      setDropdownOpen(false);
    }
    if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
      setNotifOpen(false);
    }
  };

  React.useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="fixed top-0 left-0 right-0 bg-white z-10 border-b border-gray-200 px-4">
      <div className="flex items-center justify-between h-16">
        <div className="flex items-center">
          <button 
            className="p-2 rounded-md text-gray-500 lg:hidden"
            onClick={toggleSidebar}
          >
            <Menu size={20} />
          </button>
          <Link to="/" className="text-xl font-bold text-primary-800 flex items-center ml-2">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              className="h-8 w-8 mr-2"
              stroke="currentColor"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M12 1v22M1 12h22M4.22 4.22l15.56 15.56M4.22 19.78L19.78 4.22"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <span>LegalPro</span>
          </Link>
        </div>

        {user && (
          <div className="flex items-center gap-4">
            {/* Notifications */}
            <div className="relative" ref={notifRef}>
              <button
                className="relative p-2 rounded-full hover:bg-gray-100 text-gray-500"
                onClick={() => setNotifOpen(!notifOpen)}
              >
                <Bell size={20} />
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 h-4 w-4 rounded-full bg-error-500 text-white text-xs flex items-center justify-center">
                    {unreadCount}
                  </span>
                )}
              </button>
              {notifOpen && (
                <div className="absolute right-0 mt-2 w-80 bg-white rounded-md shadow-lg py-1 z-20 animate-fade-in">
                  <div className="px-4 py-2 border-b border-gray-100 flex justify-between items-center">
                    <span className="font-semibold text-gray-900">Notifications</span>
                    {unreadCount > 0 && (
                      <button
                        className="text-xs text-primary-600 hover:underline"
                        onClick={markAllAsRead}
                      >
                        Mark all as read
                      </button>
                    )}
                  </div>
                  <div className="max-h-80 overflow-y-auto">
                    {notifLoading ? (
                      <div className="p-4 text-center text-gray-500">Loading...</div>
                    ) : notifications.length === 0 ? (
                      <div className="p-4 text-center text-gray-400">No notifications</div>
                    ) : (
                      notifications.map(n => (
                        <div
                          key={n.id}
                          className={`px-4 py-2 text-sm border-b border-gray-100 ${
                            !n.is_read ? 'bg-primary-50' : ''
                          }`}
                        >
                          <div className="font-medium text-gray-800">{n.title}</div>
                          <div className="text-xs text-gray-500">{n.content}</div>
                          <div className="text-xs text-gray-400 mt-1">{new Date(n.created_at).toLocaleString()}</div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>
            
            {/* Messages (static for now) */}
            <button className="relative p-2 rounded-full hover:bg-gray-100 text-gray-500">
              <MessageSquare size={20} />
              <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-error-500" />
            </button>

            {/* User Dropdown */}
            <div className="relative" ref={dropdownRef}>
              <button 
                className="flex items-center"
                onClick={() => setDropdownOpen(!dropdownOpen)}
              >
                <Avatar 
                  name={user?.name || 'User'} 
                  src={user?.avatar} 
                  size="sm" 
                />
              </button>

              {dropdownOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-10 animate-fade-in">
                  <div className="px-4 py-2 border-b border-gray-100">
                    <p className="text-sm font-medium text-gray-900">{user.name}</p>
                    <p className="text-xs text-gray-500">{user.email}</p>
                  </div>
                  
                  <Link 
                    to="/profile" 
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    onClick={() => setDropdownOpen(false)}
                  >
                    Profile Settings
                  </Link>
                  
                  <button 
                    className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    onClick={handleLogout}
                  >
                    Logout
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {!user && (
          <div className="flex items-center gap-2">
            <Link to="/login">
              <Button variant="outline" size="sm">Login</Button>
            </Link>
            <Link to="/register">
              <Button size="sm">Register</Button>
            </Link>
          </div>
        )}
      </div>
    </nav>
  );
};