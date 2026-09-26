import React, { useState } from 'react'
import EventPage from './pages/EventPage'
import { ValidatorPage } from './pages/ValidatorPage'

function App() {
  const [mode, setMode] = useState<'booking' | 'validator'>('booking');

  return (
    <div className="min-h-screen flex flex-col relative">
      <div className="absolute top-4 right-4 z-50">
        <button 
          onClick={() => setMode(mode === 'booking' ? 'validator' : 'booking')}
          className="bg-surface border border-secondary text-white px-4 py-2 rounded-md hover:bg-secondary text-sm font-medium transition-colors shadow-lg"
        >
          Switch to {mode === 'booking' ? 'Validator' : 'Booking'} Mode
        </button>
      </div>

      {mode === 'booking' ? <EventPage /> : <ValidatorPage />}
    </div>
  )
}

export default App
