import React from 'react';
import { Seat as SeatType } from '../types';
import { Seat } from './Seat';
import { SeatLegend } from './SeatLegend';

interface Props {
  seats: SeatType[];
  selectedSeats: string[];
  onSeatToggle: (seatId: string) => void;
}

export function SeatMap({ seats, selectedSeats, onSeatToggle }: Props) {
  // Group seats by row
  const rows = seats.reduce((acc, seat) => {
    const row = seat.id.charAt(0);
    if (!acc[row]) {
      acc[row] = [];
    }
    acc[row].push(seat);
    return acc;
  }, {} as Record<string, SeatType[]>);

  return (
    <div className="flex flex-col items-center w-full">
      <div className="w-full max-w-md mb-12">
        <div className="h-2 w-full bg-secondary rounded-t-full relative mb-8">
          <div className="absolute top-4 w-full text-center text-text-muted text-sm tracking-[0.3em] font-semibold">STAGE</div>
        </div>
      </div>

      <div className="space-y-4 mb-8 overflow-x-auto pb-4 w-full flex flex-col items-center">
        {Object.entries(rows).map(([rowLetter, rowSeats]) => (
          <div key={rowLetter} className="flex items-center space-x-4">
            <div className="w-6 text-center font-bold text-text-muted">{rowLetter}</div>
            <div className="flex space-x-3">
              {rowSeats.map((seat) => (
                <Seat
                  key={seat.id}
                  seat={seat}
                  isSelected={selectedSeats.includes(seat.id)}
                  onClick={() => onSeatToggle(seat.id)}
                />
              ))}
            </div>
            <div className="w-6 text-center font-bold text-text-muted">{rowLetter}</div>
          </div>
        ))}
      </div>

      <SeatLegend />
    </div>
  );
}
