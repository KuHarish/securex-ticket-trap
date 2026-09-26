import React, { useState } from 'react';
import { NavBar } from './components/NavBar';
import { HomePage } from './pages/HomePage';
import EventPage from './pages/EventPage';
import { MyTicketsPage } from './pages/MyTicketsPage';
import { ValidatorPage } from './pages/ValidatorPage';
import { SecurityMonitorPage } from './pages/SecurityMonitorPage';

function App() {
  const [mode, setMode] = useState<'home' | 'event' | 'tickets' | 'validator' | 'monitor'>('home');

  return (
    <div className="min-h-screen flex flex-col relative bg-background">
      <NavBar mode={mode} setMode={setMode} />
      
      {mode === 'home' && <HomePage onNavigate={(m) => setMode(m)} />}
      {mode === 'event' && <EventPage />}
      {mode === 'tickets' && <MyTicketsPage />}
      {mode === 'validator' && <ValidatorPage />}
      {mode === 'monitor' && <SecurityMonitorPage />}
    </div>
  );
}

export default App;
