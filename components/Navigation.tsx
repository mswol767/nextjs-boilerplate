"use client";

import { useState, useEffect } from "react";
import type { SectionId } from "../types";
import Login from "../app/admin/Login";

interface NavigationProps {
  menuOpen: boolean;
  activeSection: SectionId;
  onMenuToggle: () => void;
  onNavClick: (e: React.MouseEvent<HTMLAnchorElement>, id: string) => void;
}

export default function Navigation({ menuOpen, activeSection, onMenuToggle, onNavClick }: NavigationProps) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [showMembersLogin, setShowMembersLogin] = useState(false);

  // Track scroll position for header styling
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (showMembersLogin) {
        const target = event.target as Element;
        if (!target.closest('[data-members-dropdown]')) {
          setShowMembersLogin(false);
        }
      }
    };

    if (showMembersLogin) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [showMembersLogin]);

  // Handle members click to show login in header
  const handleMembersClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    setShowMembersLogin(!showMembersLogin);
    // Close mobile menu if open
    if (menuOpen) {
      onMenuToggle();
    }
  };

  const navItems = [
    { 
      id: "home", 
      label: "About", 
      icon: "M12 2L3 7v13h6v-7h6v7h6V7z",
      description: "Learn about our club"
    },
    { 
      id: "events", 
      label: "Events", 
      icon: "M7 10h10v6H7z M17 3h1a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h1",
      description: "Upcoming activities"
    },
    { 
      id: "membership", 
      label: "Membership", 
      icon: "M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM4 20v-1a4 4 0 0 1 4-4h8a4 4 0 0 1 4 4v1",
      description: "Join our community"
    },
    { 
      id: "contact", 
      label: "Contact", 
      icon: "M2 5.5A2.5 2.5 0 0 1 4.5 3h15A2.5 2.5 0 0 1 22 5.5v13A2.5 2.5 0 0 1 19.5 21h-15A2.5 2.5 0 0 1 2 18.5v-13zM4.5 5A.5.5 0 0 0 4 5.5V6l8 4.5L20 6v-.5a.5.5 0 0 0-.5-.5h-15z",
      description: "Get in touch"
    }
  ];

  const NavLink = ({ id, label, icon, description, className = "", isMobile = false }: { 
    id: string; 
    label: string; 
    icon: string; 
    description?: string;
    className?: string;
    isMobile?: boolean;
  }) => {
    const isActive = activeSection === id;
    
    return (
      <a 
        href={`#${id}`} 
        onClick={(e) => onNavClick(e, id)} 
        className={`
          group flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-200
          ${isActive 
            ? "bg-green-700 text-white shadow-md" 
            : "text-white/90 hover:text-white hover:bg-green-700/50"
          }
          ${isMobile ? "w-full" : ""}
          ${className}
        `}
        title={description}
      >
        <svg 
          className={`w-5 h-5 transition-transform duration-200 ${isActive ? "scale-110" : "group-hover:scale-105"}`} 
          viewBox="0 0 24 24" 
          fill="none"
        >
          <path d={icon} fill="currentColor"/>
        </svg>
        <div className="flex flex-col">
          <span className="font-medium">{label}</span>
          {isMobile && description && (
            <span className="text-xs text-white/70">{description}</span>
          )}
        </div>
        {isActive && (
          <div className="ml-auto w-2 h-2 bg-white rounded-full animate-pulse"></div>
        )}
      </a>
    );
  };

  return (
    <header className={`
      fixed top-0 left-0 right-0 z-50 w-full text-white transition-all duration-300 relative
      ${isScrolled 
        ? 'bg-green-900/95 backdrop-blur-sm shadow-lg' 
        : 'bg-green-800'
      }
      ${menuOpen ? 'h-auto' : (activeSection === 'home' ? 'h-auto' : 'h-20 sm:h-24')}
    `}>
      <div className="max-w-7xl mx-auto flex items-center justify-between p-4 sm:p-6">
        {/* Logo/Brand */}
        <div className="flex items-center gap-3">
          <img 
            src="/logo.png" 
            alt="Cromwell Fish & Game Club Logo" 
            className="w-16 h-16 sm:w-20 sm:h-20 object-contain"
          />
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight">
            Cromwell Fish & Game Club
          </h1>
        </div>
        
        {/* Mobile menu button */}
        <button
          className="sm:hidden relative w-8 h-8 flex items-center justify-center rounded-lg hover:bg-green-700/50 transition-colors"
          onClick={onMenuToggle}
          aria-label="Toggle menu"
          aria-expanded={menuOpen}
        >
          <div className="w-5 h-5 flex flex-col justify-center">
            <span className={`block h-0.5 w-5 bg-white transition-all duration-300 ${menuOpen ? 'rotate-45 translate-y-1' : '-translate-y-1'}`}></span>
            <span className={`block h-0.5 w-5 bg-white transition-all duration-300 ${menuOpen ? 'opacity-0' : 'opacity-100'}`}></span>
            <span className={`block h-0.5 w-5 bg-white transition-all duration-300 ${menuOpen ? '-rotate-45 -translate-y-1' : 'translate-y-1'}`}></span>
          </div>
        </button>
        
        {/* Desktop Menu */}
        <nav className="hidden sm:flex items-center gap-2">
          {navItems.map((item) => (
            <NavLink 
              key={item.id} 
              id={item.id} 
              label={item.label} 
              icon={item.icon}
              description={item.description}
            />
          ))}
          <a 
            href="#members" 
            onClick={handleMembersClick}
            title="Members only — staff and members" 
            data-members-dropdown
            className={`
              group flex items-center gap-2 px-3 py-2 rounded-lg transition-all duration-200
              ${showMembersLogin 
                ? "bg-green-700 text-white shadow-md" 
                : "text-white/70 hover:text-white hover:bg-green-700/50"
              }
            `}
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none">
              <path d="M12 2C9.79 2 8 3.79 8 6v2H7a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-8a2 2 0 0 0-2-2h-1V6c0-2.21-1.79-4-4-4zM10 8V6c0-1.1.9-2 2-2s2 .9 2 2v2h-4z" fill="currentColor"/>
            </svg>
            <span className="font-medium">Members</span>
            {showMembersLogin && (
              <div className="ml-auto w-2 h-2 bg-white rounded-full animate-pulse"></div>
            )}
          </a>
        </nav>
      </div>
      
      
      {/* Mobile Menu */}
      {menuOpen && (
        <div className="sm:hidden border-t border-green-700/50">
          <nav className="flex flex-col gap-1 bg-green-700/50 p-4">
            {navItems.map((item) => (
              <NavLink 
                key={item.id} 
                id={item.id} 
                label={item.label} 
                icon={item.icon}
                description={item.description}
                isMobile={true}
              />
            ))}
            <a 
              href="#members" 
              onClick={handleMembersClick}
              data-members-dropdown
              className={`
                group flex items-center gap-3 px-3 py-3 rounded-lg transition-all duration-200 w-full
                ${showMembersLogin 
                  ? "bg-green-700 text-white shadow-md" 
                  : "text-white/90 hover:text-white hover:bg-green-700/50"
                }
              `}
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none">
                <path d="M12 2C9.79 2 8 3.79 8 6v2H7a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-8a2 2 0 0 0-2-2h-1V6c0-2.21-1.79-4-4-4zM10 8V6c0-1.1.9-2 2-2s2 .9 2 2v2h-4z" fill="currentColor"/>
              </svg>
              <div className="flex flex-col">
                <span className="font-medium">Members</span>
                <span className="text-xs text-white/70">Staff and members only</span>
              </div>
              {showMembersLogin && (
                <div className="ml-auto w-2 h-2 bg-white rounded-full animate-pulse"></div>
              )}
            </a>
          </nav>
        </div>
      )}

      {/* Members Login Dropdown */}
      {showMembersLogin && (
        <div className="fixed top-20 sm:top-24 right-4 sm:right-6 z-50" data-members-dropdown>
          <div className="bg-white rounded-lg shadow-xl border border-gray-200 p-3 w-80 max-w-[calc(100vw-2rem)]">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center">
                  <svg className="w-4 h-4 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 2C9.79 2 8 3.79 8 6v2H7a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-8a2 2 0 0 0-2-2h-1V6c0-2.21-1.79-4-4-4zM10 8V6c0-1.1.9-2 2-2s2 .9 2 2v2h-4z" />
                  </svg>
                </div>
                <h3 className="text-sm font-semibold text-gray-900">Members Login</h3>
              </div>
              <button
                onClick={() => setShowMembersLogin(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
                aria-label="Close"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
              <Login onSuccess={() => {
                setShowMembersLogin(false);
                window.location.href = '/members';
              }} compact={true} />
          </div>
        </div>
      )}
    </header>
  );
}
