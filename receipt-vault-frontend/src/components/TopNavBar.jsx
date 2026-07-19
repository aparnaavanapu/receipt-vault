import React from 'react';

const TopNavBar = ({ email, onLogout }) => {
  return (
    <header className="fixed top-0 w-full z-50 bg-on-secondary-fixed border-b border-outline-variant flex justify-between items-center h-16 px-container-padding">
      <div className="flex items-center gap-gutter">
        <span className="font-display-lg text-display-lg font-bold text-white">Receipt Vault</span>
      </div>
      <div className="flex items-center gap-container-padding">
        <span className="font-body-md text-body-md text-on-secondary-fixed-variant">{email || 'user@example.com'}</span>
        <button 
          onClick={onLogout}
          className="bg-primary hover:bg-primary/90 text-white px-4 py-2 font-label-md text-label-md rounded transition-colors active:opacity-80"
        >
          Logout
        </button>
      </div>
    </header>
  );
};

export default TopNavBar;
