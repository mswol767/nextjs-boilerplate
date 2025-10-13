"use client";

import { useState, useRef, useEffect } from "react";
import type { SectionId, NavigationState } from "../types";

export function useNavigation() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState<SectionId>("about");
  const manualNavRef = useRef(false);

  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
    e.preventDefault();
    // If the user clicks Home, show About section instead (per request)
    const mappedId = (id === 'home' ? 'about' : id) as SectionId;
    // set active immediately so conditional rendering can show the section
    setActiveSection(mappedId);
    setMenuOpen(false);
    // mark manual nav so the observer doesn't override our choice while scrolling
    manualNavRef.current = true;
    // update hash without jumping instantly
    // keep the URL hash as #home when they click Home for compatibility
    history.replaceState(null, "", `#${id}`);

    // wait a tick for DOM updates (in case the target was conditionally rendered), then scroll
    requestAnimationFrame(() => {
      // small delay to ensure layout settled
      setTimeout(() => {
        const el = document.getElementById(id);
        if (el) {
          // compute offset for header height so section isn't hidden under sticky header
          const header = document.querySelector('header');
          const headerHeight = header ? (header as HTMLElement).offsetHeight : 0;
          const extraOffset = 12; // small breathing room
          const top = el.getBoundingClientRect().top + window.scrollY - headerHeight - extraOffset;
          window.scrollTo({ top, behavior: 'smooth' });
        }
        // allow the observer to resume after the scroll finishes
        setTimeout(() => {
          manualNavRef.current = false;
        }, 600);
      }, 50);
    });
  };

  // Optional: update activeSection on scroll using IntersectionObserver
  useEffect(() => {
    const ids: SectionId[] = ["home", "about", "events", "membership", "contact"];
    const observers: IntersectionObserver[] = [];
    
    ids.forEach((id) => {
      const el = document.getElementById(id);
      if (!el) return;
      
      const obs = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            // Only update activeSection if:
            // 1. Not in manual navigation mode
            // 2. The section is actually intersecting (visible)
            // 3. We're not currently viewing a specific section (only update when activeSection is "home")
            if (entry.isIntersecting && !manualNavRef.current && activeSection === "home") {
              setActiveSection(id);
            }
          });
        },
        { root: null, rootMargin: "-20% 0px -60% 0px", threshold: 0 }
      );
      
      obs.observe(el);
      observers.push(obs);
    });
    
    return () => observers.forEach((o) => o.disconnect());
  }, [activeSection]);

  return {
    menuOpen,
    activeSection,
    setMenuOpen,
    setActiveSection,
    handleNavClick
  };
}
