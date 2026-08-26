import React from 'react';
import Navbar from './Navbar';

export default function WorkspaceContainer({ children, className = '' }) {
  return (
    <div className={`h-screen w-screen overflow-hidden bg-[#FAF7F2] ledger-grid text-[#121820] flex flex-col font-sans antialiased ${className}`}>
      <Navbar fullWidth={true} />
      {/* 
        pt-[64px] is the height of the main Navbar.
      */}
      <main className="flex-1 w-full flex overflow-hidden pt-[64px] lg:pt-[64px]">
        {children}
      </main>
    </div>
  );
}
