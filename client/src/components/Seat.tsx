import React from 'react';
import { Seat as SeatType } from '../types';

interface Props {
  seat: SeatType;
  isSelected: boolean;
  onClick: () => void;
}

export function Seat({ seat, isSelected, onClick }: Props) {
  const isAvailable = seat.status === 'AVAILABLE';
  const isSold = seat.status === 'SOLD';
  const isReserved = seat.status === 'RESERVED';

  let seatClass = 'w-10 h-10 rounded-t-lg rounded-b-sm font-semibold text-xs flex items-center justify-center transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-background ';

  if (isSold) {
    seatClass += 'bg-secondary text-text-muted/30 cursor-not-allowed';
  } else if (isReserved) {
    seatClass += 'bg-orange-900/50 text-orange-200/50 border border-orange-800 cursor-not-allowed';
  } else if (isSelected) {
    seatClass += 'bg-primary text-white shadow-[0_0_15px_rgba(79,70,229,0.5)] transform -translate-y-1';
  } else if (isAvailable) {
    seatClass += 'bg-surface border border-secondary text-text hover:border-primary hover:text-primary cursor-pointer';
  }

  return (
    <button
      disabled={isSold || isReserved}
      onClick={onClick}
      className={seatClass}
      aria-label={`Seat ${seat.label} - ${isSold ? 'Sold' : isReserved ? 'Reserved' : isSelected ? 'Selected' : 'Available'}`}
      title={`Seat ${seat.label}`}
    >
      {seat.label}
    </button>
  );
}
