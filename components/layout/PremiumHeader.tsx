'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function PremiumHeader() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header className={`fixed w-full top-0 z-50 transition-all duration-500 ${isScrolled ? 'bg-white/90 backdrop-blur-md py-4 shadow-sm' : 'bg-transparent py-6'}`}>
      <div className="max-w-[1920px] mx-auto px-6 md:px-12 flex justify-between items-center">
        <Link href="/" className={`font-heading text-2xl tracking-[0.2em] uppercase ${isScrolled ? 'text-charcoal' : 'text-white mix-blend-difference'}`}>
          JAECOO
        </Link>
        <button 
          onClick={() => setMenuOpen(!menuOpen)}
          className={`text-sm tracking-widest uppercase ${isScrolled ? 'text-charcoal' : 'text-white mix-blend-difference'}`}
        >
          {menuOpen ? 'Close' : 'Menu'}
        </button>
      </div>

      {/* Fullscreen Menu Overlay */}
      {menuOpen && (
        <div className="fixed inset-0 bg-charcoal text-white z-40 flex flex-col justify-center px-12 animate-fade-up">
          <nav className="flex flex-col gap-8 text-4xl md:text-6xl font-heading tracking-wider">
            <Link href="/models/j5" onClick={() => setMenuOpen(false)} className="hover:text-gray-400 transition-colors">J5</Link>
            <Link href="/models/j7" onClick={() => setMenuOpen(false)} className="hover:text-gray-400 transition-colors">J7</Link>
            <Link href="/models/j8" onClick={() => setMenuOpen(false)} className="hover:text-gray-400 transition-colors">J8</Link>
            <Link href="/news" onClick={() => setMenuOpen(false)} className="hover:text-gray-400 transition-colors">Journal</Link>
            <Link href="/sales" onClick={() => setMenuOpen(false)} className="hover:text-gray-400 transition-colors">Consultant</Link>
          </nav>
        </div>
      )}
    </header>
  );
}
