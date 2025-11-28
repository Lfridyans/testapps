import React from 'react';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <div className="h-screen bg-slate-50 text-slate-900 font-sans flex flex-col overflow-hidden">
      {/* Navbar */}
      <nav className="bg-white border-b border-slate-200 h-16 flex-none z-50">
        <div className="w-full px-4 sm:px-6 lg:px-8 h-full">
          <div className="flex justify-between h-full items-center">
            <div className="flex items-center gap-3">
              <div className="bg-red-600 text-white p-1.5 rounded font-bold text-xl tracking-tighter">
                DI
              </div>
              <div className="flex flex-col">
                <span className="font-bold text-lg leading-tight text-slate-800">Danantara Indonesia</span>
                <span className="text-[10px] text-slate-500 font-medium tracking-widest uppercase">InJourney Airports</span>
              </div>
            </div>
            <div className="hidden md:flex space-x-8">
              {/* Removed title as requested */}
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content - No Padding, Full Height */}
      <main className="flex-1 overflow-hidden relative">
        {children}
      </main>
    </div>
  );
};

export default Layout;