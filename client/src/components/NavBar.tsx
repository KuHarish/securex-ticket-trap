import React from 'react';

interface Props {
  mode: 'home' | 'event' | 'tickets' | 'validator' | 'monitor';
  setMode: (mode: 'home' | 'event' | 'tickets' | 'validator' | 'monitor') => void;
}

export function NavBar({ mode, setMode }: Props) {
  const tabs = [
    { id: 'home', label: 'Home' },
    { id: 'event', label: 'Event' },
    { id: 'tickets', label: 'My Tickets' },
    { id: 'validator', label: 'Validator' },
    { id: 'monitor', label: 'Security Monitor' }
  ];

  return (
    <nav className="bg-surface border-b border-secondary p-4 sticky top-0 z-50">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-primary rounded flex items-center justify-center">
            <span className="text-white font-bold tracking-tighter">TT</span>
          </div>
          <span className="text-xl font-bold text-white tracking-tight">Ticket Trap</span>
        </div>
        <div className="flex flex-wrap justify-center space-x-2 md:space-x-4">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setMode(tab.id as any)}
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                mode === tab.id 
                  ? 'bg-primary text-white shadow-[0_0_10px_rgba(79,70,229,0.5)]' 
                  : 'text-text-muted hover:text-white hover:bg-secondary'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>
    </nav>
  );
}
