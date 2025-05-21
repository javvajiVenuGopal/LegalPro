import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  BarChart2, 
  Calendar, 
  FileText, 
  Home, 
  MessageSquare, 
  Settings, 
  Users, 
  CreditCard, 
  Bell,
  Briefcase
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { useAuthStore } from '../../store/authStore';

interface SidebarProps {
  isOpen: boolean;
  closeSidebar: () => void;
}

interface SidebarItemProps {
  icon: React.ReactNode;
  label: string;
  href: string;
  active: boolean;
}

const SidebarItem: React.FC<SidebarItemProps> = ({ icon, label, href, active }) => {
  return (
    <Link
      to={href}
      className={cn(
        'flex items-center space-x-2 rounded-md px-3 py-2 transition-colors',
        active
          ? 'bg-primary-100 text-primary-800'
          : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
      )}
    >
      <span className="flex-shrink-0">{icon}</span>
      <span className="flex-1">{label}</span>
      {active && (
        <span className="h-1.5 w-1.5 rounded-full bg-primary-600"></span>
      )}
    </Link>
  );
};

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, closeSidebar }) => {
  const location = useLocation();
  const { user } = useAuthStore();
  const isLawyer = user?.role === 'lawyer';
  
  const clientItems = [
    { icon: <Home size={20} />, label: 'Dashboard', href: '/client/dashboard' },
    { icon: <Briefcase size={20} />, label: 'My Cases', href: '/client/cases' },
    { icon: <MessageSquare size={20} />, label: 'Messages', href: '/client/messages' },
    { icon: <Calendar size={20} />, label: 'Appointments', href: '/client/appointments' },
    { icon: <FileText size={20} />, label: 'Documents', href: '/client/documents' },
    { icon: <CreditCard size={20} />, label: 'Invoices', href: '/client/invoices' },
    { icon: <Bell size={20} />, label: 'Notifications', href: '/client/notifications' },
    { icon: <Settings size={20} />, label: 'Settings', href: '/client/settings' },
  ];

  const lawyerItems = [
    { icon: <Home size={20} />, label: 'Dashboard', href: '/lawyer/dashboard' },
    { icon: <Users size={20} />, label: 'Clients', href: '/lawyer/clients' },
    { icon: <Briefcase size={20} />, label: 'Case Manager', href: '/lawyer/cases' },
    { icon: <MessageSquare size={20} />, label: 'Messages', href: '/lawyer/messages' },
    { icon: <Calendar size={20} />, label: 'Appointments', href: '/lawyer/appointments' },
    { icon: <FileText size={20} />, label: 'Documents', href: '/lawyer/documents' },
    { icon: <CreditCard size={20} />, label: 'Invoices', href: '/lawyer/invoices' },
    { icon: <BarChart2 size={20} />, label: 'Analytics', href: '/lawyer/analytics' },
    { icon: <Bell size={20} />, label: 'Notifications', href: '/lawyer/notifications' },
    { icon: <Settings size={20} />, label: 'Settings', href: '/lawyer/settings' },
  ];

  const navigationItems = isLawyer ? lawyerItems : clientItems;

  return (
    <>
      {/* Mobile sidebar backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-20 bg-black bg-opacity-50 lg:hidden"
          onClick={closeSidebar}
        ></div>
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed top-16 bottom-0 left-0 z-30 w-64 transform bg-white p-4 shadow-md transition-transform duration-200 ease-in-out',
          isOpen ? 'translate-x-0' : '-translate-x-full',
          'lg:translate-x-0'
        )}
      >
        <div className="flex flex-col h-full">
          <nav className="flex-1 overflow-y-auto">
            <div className="space-y-1">
              {navigationItems.map((item) => (
                <SidebarItem
                  key={item.href}
                  icon={item.icon}
                  label={item.label}
                  href={item.href}
                  active={location.pathname === item.href}
                />
              ))}
            </div>
          </nav>

          <div className="mt-auto">
            <div className="rounded-lg bg-primary-50 p-3">
              <div className="flex items-center">
                <div className="mr-3 flex-shrink-0 p-1 rounded-full bg-primary-100">
                  <svg
                    className="h-5 w-5 text-primary-600"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-medium text-primary-800">
                    Need Help?
                  </p>
                  <p className="text-xs text-primary-600">
                    Contact support for assistance
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};