import React from 'react';
import { EventDetails as EventDetailsType, PurchaseSummary } from '../types';
import { Calendar, Clock, MapPin, Tag, Info } from 'lucide-react';

interface Props {
  event: EventDetailsType;
  purchaseSummary?: PurchaseSummary | null;
}

export function EventDetails({ event, purchaseSummary }: Props) {
  const limit = purchaseSummary?.limit || event.purchaseLimit;

  return (
    <div className="bg-surface rounded-lg p-6 border border-secondary">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h2 className="text-2xl font-bold text-white mb-2">{event.name}</h2>
          <div className="inline-flex items-center space-x-1 text-primary bg-primary/10 px-3 py-1 rounded-full text-sm font-medium">
            <Tag size={14} />
            <span>{event.category}</span>
          </div>
        </div>
        <div className="text-right">
          <div className="text-3xl font-bold text-white">₹{event.ticketPrice}</div>
          <div className="text-sm text-text-muted mt-1">per ticket</div>
        </div>
      </div>

      <p className="text-text-muted mb-6 leading-relaxed">
        {event.description}
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="flex items-center space-x-3 text-text-muted">
          <Calendar className="text-primary" size={20} />
          <span>{event.date}</span>
        </div>
        <div className="flex items-center space-x-3 text-text-muted">
          <Clock className="text-primary" size={20} />
          <span>{event.time}</span>
        </div>
        <div className="flex items-center space-x-3 text-text-muted md:col-span-2">
          <MapPin className="text-primary" size={20} />
          <span>{event.venue}, {event.location}</span>
        </div>
      </div>

      <div className="mt-6 pt-4 border-t border-secondary flex items-center space-x-2 text-sm text-text-muted">
        <Info size={16} />
        <span>Purchase limit: Maximum {limit} tickets per user</span>
      </div>
    </div>
  );
}
