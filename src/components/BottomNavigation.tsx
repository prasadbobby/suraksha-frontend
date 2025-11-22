import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Home, Shield, Users, User } from 'lucide-react';
import './BottomNavigation.css';

interface NavItem {
  id: string;
  path: string;
  icon: React.ReactNode;
  label: string;
}

const navItems: NavItem[] = [
  {
    id: 'home',
    path: '/',
    icon: <Home className="nav-icon" />,
    label: 'Home'
  },
  {
    id: 'sos',
    path: '/sos',
    icon: <Shield className="nav-icon" />,
    label: 'SOS'
  },
  {
    id: 'contacts',
    path: '/contacts',
    icon: <Users className="nav-icon" />,
    label: 'Contacts'
  },
  {
    id: 'profile',
    path: '/profile',
    icon: <User className="nav-icon" />,
    label: 'Profile'
  }
];

const BottomNavigation: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const handleNavClick = (path: string) => {
    navigate(path);
  };

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  return (
    <div className="bottom-nav">
      {navItems.map((item) => (
        <div
          key={item.id}
          className={`nav-item ${isActive(item.path) ? 'active' : ''}`}
          onClick={() => handleNavClick(item.path)}
        >
          <div className="nav-icon-wrapper">
            {item.icon}
          </div>
          <span className="nav-text">{item.label}</span>
        </div>
      ))}
    </div>
  );
};

export default BottomNavigation;