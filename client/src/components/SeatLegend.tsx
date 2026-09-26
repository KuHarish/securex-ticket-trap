import React from 'react';

export function SeatLegend() {
  return (
    <div className="flex items-center justify-center space-x-6 mt-6 p-4 bg-surface rounded-lg border border-secondary">
      <div className="flex items-center space-x-2">
        <div className="w-6 h-6 rounded-t-md rounded-b-sm bg-surface border border-secondary"></div>
        <span className="text-sm text-text-muted">Available</span>
      </div>
      <div className="flex items-center space-x-2">
        <div className="w-6 h-6 rounded-t-md rounded-b-sm bg-primary shadow-[0_0_10px_rgba(79,70,229,0.4)]"></div>
        <span className="text-sm text-white font-medium">Selected</span>
      </div>
      <div className="flex items-center space-x-2">
        <div className="w-6 h-6 rounded-t-md rounded-b-sm bg-secondary"></div>
        <span className="text-sm text-text-muted">Sold</span>
      </div>
    </div>
  );
}
