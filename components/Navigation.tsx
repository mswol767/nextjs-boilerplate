"use client";

import type { SectionId } from "../types";

interface NavigationProps {
  menuOpen: boolean;
  activeSection: SectionId;
  onMenuToggle: () => void;
  onNavClick: (e: React.MouseEvent<HTMLAnchorElement>, id: string) => void;
}

export default function Navigation({ menuOpen, activeSection, onMenuToggle, onNavClick }: NavigationProps) {
  const navItems = [
    { id: "home", label: "About", icon: "M12 2L3 7v13h6v-7h6v7h6V7z" },
    { id: "events", label: "Events", icon: "M7 10h10v6H7z M17 3h1a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h1" },
    { id: "membership", label: "Membership", icon: "M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM4 20v-1a4 4 0 0 1 4-4h8a4 4 0 0 1 4 4v1" },
    { id: "contact", label: "Contact", icon: "M2 5.5A2.5 2.5 0 0 1 4.5 3h15A2.5 2.5 0 0 1 22 5.5v13A2.5 2.5 0 0 1 19.5 21h-15A2.5 2.5 0 0 1 2 18.5v-13zM4.5 5A.5.5 0 0 0 4 5.5V6l8 4.5L20 6v-.5a.5.5 0 0 0-.5-.5h-15z" }
  ];

  const NavLink = ({ id, label, icon, className = "" }: { id: string; label: string; icon: string; className?: string }) => (
    <a 
      href={`#${id}`} 
      onClick={(e) => onNavClick(e, id)} 
      className={`flex items-center gap-2 hover:underline ${activeSection === id ? "underline decoration-2" : ""} ${className}`}
    >
      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none">
        <path d={icon} fill="currentColor"/>
      </svg>
      <span>{label}</span>
    </a>
  );

  return (
    <header className={`bg-green-800 w-full text-white transition-all duration-500 overflow-hidden ${menuOpen ? 'h-auto' : (activeSection === 'home' ? 'h-auto' : 'h-16 sm:h-20')}`}>
      <div className="max-w-7xl mx-auto flex items-center justify-between p-4 sm:p-6">
        <h1 className="text-xl sm:text-2xl font-bold">Cromwell Fish & Game Club</h1>
        
        {/* Mobile menu button */}
        <button
          className="sm:hidden text-white text-2xl"
          onClick={onMenuToggle}
          aria-label="Toggle menu"
        >
          {menuOpen ? "✕" : "☰"}
        </button>
        
        {/* Desktop Menu */}
        <nav className="hidden sm:flex gap-6 text-lg font-medium">
          {navItems.map((item) => (
            <NavLink key={item.id} id={item.id} label={item.label} icon={item.icon} />
          ))}
          <a 
            href="/members" 
            title="Members only — staff and members" 
            className={`flex items-center gap-2 hover:underline ${activeSection === "members" ? "underline decoration-2" : ""}`}
          >
            <svg className="w-4 h-4 text-white/60" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="M12 2C9.79 2 8 3.79 8 6v2H7a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-8a2 2 0 0 0-2-2h-1V6c0-2.21-1.79-4-4-4zM10 8V6c0-1.1.9-2 2-2s2 .9 2 2v2h-4z" fill="currentColor"/>
            </svg>
            <span>Members</span>
          </a>
        </nav>
      </div>
      
      {/* Show all button when in single-section view */}
      {activeSection !== 'home' && (
        <div className="max-w-7xl mx-auto px-4 pb-2">
          <button 
            onClick={() => onNavClick({ preventDefault: () => {} } as any, "home")} 
            className="text-sm text-white/90 hover:text-white underline"
          >
            Show all
          </button>
        </div>
      )}
      
      {/* Mobile Menu */}
      {menuOpen && (
        <nav className="sm:hidden flex flex-col gap-4 bg-green-700 p-4 text-lg">
          {navItems.map((item) => (
            <NavLink key={item.id} id={item.id} label={item.label} icon={item.icon} className="w-5 h-5" />
          ))}
          <a 
            href="/members" 
            className={`flex items-center gap-2 hover:underline ${activeSection === "members" ? "underline" : ""}`}
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="M12 2C9.79 2 8 3.79 8 6v2H7a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-8a2 2 0 0 0-2-2h-1V6c0-2.21-1.79-4-4-4zM10 8V6c0-1.1.9-2 2-2s2 .9 2 2v2h-4z" fill="currentColor"/>
            </svg>
            <span>Members</span>
          </a>
        </nav>
      )}
    </header>
  );
}
