"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LogoutButton } from "./LogoutButton";

export function Navigation({ session, children }: { session: any, children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  const closeMenu = () => setIsOpen(false);

  return (
    <>
      {/* Mobile Header */}
      <div className="md:hidden flex items-center justify-between bg-slate-900 text-white h-14 px-4 shrink-0 shadow-md">
        <div className="flex flex-col items-center ml-2">
          <img src="/logo.jpg" alt="පොත by Brandspire" className="w-24 h-auto object-contain bg-[#fbfbf9] px-2 py-1 rounded-sm mix-blend-screen" style={{ mixBlendMode: 'screen' }} />
        </div>
        <div className="flex items-center space-x-2">
          <LogoutButton />
          <button onClick={() => setIsOpen(!isOpen)} className="p-1 border border-slate-700 rounded-md">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {isOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>
      </div>

      {/* Backdrop for mobile */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/80 z-30 md:hidden backdrop-blur-sm"
          onClick={() => setIsOpen(false)}
        />
      )}

      <div className="flex h-full overflow-hidden relative">
        {/* Sidebar Navigation */}
        <aside className={`${isOpen ? "translate-x-0" : "-translate-x-full"} md:translate-x-0 transition-transform duration-300 absolute md:relative z-40 w-64 bg-slate-900 text-slate-300 flex flex-col h-full shrink-0 shadow-xl`}>
          <div className="hidden md:flex flex-col p-4 border-b border-slate-800 bg-[#fbfbf9] items-center justify-center">
            <img src="/logo.jpg" alt="පොත by Brandspire" className="w-44 h-auto object-contain mix-blend-multiply" />
          </div>
          
          <nav className="flex-1 py-6 px-3 space-y-1 overflow-y-auto">
            {((session.user as any)?.role === 'ADMIN' || (session.user as any)?.role === 'LIBRARIAN' || (session.user as any)?.permDashboard) && (
              <Link onClick={closeMenu} href="/" className={`flex items-center px-3 py-2.5 rounded-lg group transition font-medium ${pathname === '/' ? 'bg-indigo-500/10 text-indigo-400' : 'text-slate-300 hover:bg-slate-800 hover:text-white'}`}>
                <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>
                Dashboard
              </Link>
            )}
            
            {((session.user as any)?.role === 'MEMBER' || (session.user as any)?.role === 'ADMIN' || (session.user as any)?.role === 'LIBRARIAN' || (session.user as any)?.permCatalog) && (
              <Link onClick={closeMenu} href="/catalog" className={`flex items-center px-3 py-2.5 rounded-lg group transition font-medium ${pathname?.startsWith('/catalog') ? 'bg-indigo-500/10 text-indigo-400' : 'text-slate-300 hover:bg-slate-800 hover:text-white'}`}>
                <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>
                Catalog
              </Link>
            )}

            {((session.user as any)?.role === 'MEMBER') && (
              <Link onClick={closeMenu} href="/profile" className={`flex items-center px-3 py-2.5 rounded-lg group transition font-medium ${pathname?.startsWith('/profile') ? 'bg-indigo-500/10 text-indigo-400' : 'text-slate-300 hover:bg-slate-800 hover:text-white'}`}>
                <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                My Profile
              </Link>
            )}

            {((session.user as any)?.role === 'ADMIN' || (session.user as any)?.role === 'LIBRARIAN' || (session.user as any)?.permCirculation) && (
              <Link onClick={closeMenu} href="/circulation" className={`flex items-center px-3 py-2.5 rounded-lg group transition font-medium ${pathname?.startsWith('/circulation') ? 'bg-indigo-500/10 text-indigo-400' : 'text-slate-300 hover:bg-slate-800 hover:text-white'}`}>
                <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" /></svg>
                Circulation
              </Link>
            )}

            {((session.user as any)?.role === 'ADMIN' || (session.user as any)?.role === 'LIBRARIAN' || (session.user as any)?.permInventory) && (
              <Link onClick={closeMenu} href="/inventory" className={`flex items-center px-3 py-2.5 rounded-lg group transition font-medium ${pathname?.startsWith('/inventory') ? 'bg-indigo-500/10 text-indigo-400' : 'text-slate-300 hover:bg-slate-800 hover:text-white'}`}>
                <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" /></svg>
                Verification
              </Link>
            )}

            {((session.user as any)?.role === 'ADMIN' || (session.user as any)?.role === 'LIBRARIAN' || (session.user as any)?.permMembers) && (
              <Link onClick={closeMenu} href="/members" className={`flex items-center px-3 py-2.5 rounded-lg group transition font-medium ${pathname?.startsWith('/members') ? 'bg-indigo-500/10 text-indigo-400' : 'text-slate-300 hover:bg-slate-800 hover:text-white'}`}>
                <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
                Members
              </Link>
            )}
          </nav>
          
          <div className="p-4 border-t border-slate-800">
            <div className="flex items-center mb-4">
              <div className="w-8 h-8 rounded-full bg-indigo-500 flex items-center justify-center text-white font-bold text-sm">
                {session.user?.name?.substring(0,2).toUpperCase() || 'U'}
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-white">{session.user?.name}</p>
                <p className="text-xs text-slate-500">{(session.user as any)?.role || 'Member'}</p>
              </div>
            </div>
            <div className="text-center mt-2 border-t border-slate-800 pt-3">
              <a 
                href="https://wa.me/94768363831" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-xs font-medium text-yellow-400 hover:text-yellow-300 drop-shadow-[0_0_5px_rgba(250,204,21,0.5)] transition-all"
              >
                Powered by Brandspire <br/> 076-8363831
              </a>
            </div>
          </div>
        </aside>

        {/* Overlay for mobile */}
        {isOpen && (
          <div 
            className="md:hidden fixed inset-0 bg-black/50 z-30"
            onClick={closeMenu}
          />
        )}

        {/* Main Content Area */}
        <main className="flex-1 flex flex-col h-full overflow-hidden w-full bg-slate-50">
          {/* Desktop Header */}
          <header className="hidden md:flex h-16 bg-white border-b border-slate-200 items-center px-8 shrink-0 justify-end">
            <LogoutButton />
          </header>
          <div className="flex-1 overflow-auto p-4 md:p-8">
            {children}
          </div>
        </main>
      </div>
    </>
  );
}
