import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { WalletConnect } from '../wallet/WalletConnect';
import { useAuthStore } from '../../stores/useAuthStore';
import { Menu, X, Shield, User, Home, Users, Trophy, MessageCircle } from 'lucide-react';
import { Button } from '../common/Button';
import { Logo } from '../common/Logo';
import { truncateAddress } from '../../lib/utils/formatters';

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { profile } = useAuthStore();
  const location = useLocation();

  const isActive = (path) => location.pathname === path;

  const navItems = [
    { path: '/', label: 'Home', icon: Home },
    { path: '/bases', label: 'Bases', icon: Users },
    { path: '/talent', label: 'Talent', icon: Users },
    { path: '/rewards', label: 'Rewards', icon: Trophy },
    ...(profile ? [{ path: '/messages', label: 'Messages', icon: MessageCircle }] : []),
  ];

  return (
    <header className="border-b border-gray-800 bg-dark-200 sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center space-x-2 text-xl font-bold text-white hover:text-primary-400 transition-colors">
            <Logo size={32} className="flex-shrink-0" />
            <span>Based Bases</span>
          </Link>

          <nav className="hidden md:flex items-center space-x-6">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`${
                  isActive(item.path) ? 'text-primary-400' : 'text-gray-400'
                } hover:text-primary-400 transition-colors flex items-center`}
              >
                <item.icon className="w-4 h-4 mr-2" />
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center space-x-4">
            <WalletConnect />
            {profile && (
              <div className="hidden md:flex items-center space-x-2">
                <Link to={`/profile/${profile.address}`}>
                  <Button variant="secondary" className="flex items-center">
                    <div className="w-6 h-6 rounded-full overflow-hidden mr-2">
                      <img
                        src={profile.avatar_url || `https://api.dicebear.com/7.x/shapes/svg?seed=${profile.address}`}
                        alt={profile.username}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <span className="text-gray-300">
                      {profile.username || truncateAddress(profile.address)}
                    </span>
                    {profile.verified && <Shield className="w-4 h-4 ml-2 text-primary-400" />}
                  </Button>
                </Link>
              </div>
            )}

            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden p-2 text-gray-400 hover:text-white"
            >
              {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {isMenuOpen && (
          <div className="md:hidden py-4">
            <nav className="flex flex-col space-y-4">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setIsMenuOpen(false)}
                  className={`${
                    isActive(item.path) ? 'text-primary-400' : 'text-gray-400'
                  } hover:text-primary-400 transition-colors flex items-center p-2`}
                >
                  <item.icon className="w-5 h-5 mr-3" />
                  {item.label}
                </Link>
              ))}
              {profile && (
                <Link
                  to={`/profile/${profile.address}`}
                  onClick={() => setIsMenuOpen(false)}
                  className="flex items-center space-x-3 p-2 text-gray-400 hover:text-primary-400"
                >
                  <User className="w-5 h-5" />
                  <span>Profile</span>
                </Link>
              )}
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}