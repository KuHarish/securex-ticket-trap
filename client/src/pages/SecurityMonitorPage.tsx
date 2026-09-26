import React, { useEffect, useState } from 'react';
import { getMonitorStats } from '../services/api';
import { ShieldAlert, ShieldCheck, Activity, Users, Ticket, AlertTriangle } from 'lucide-react';

export function SecurityMonitorPage() {
  const [data, setData] = useState<{ stats: any, events: any[] }>({ stats: {}, events: [] });

  const fetchStats = async () => {
    const statsData = await getMonitorStats();
    setData(statsData);
  };

  useEffect(() => {
    fetchStats();
    const interval = setInterval(fetchStats, 2000); // Polling for demo purposes
    return () => clearInterval(interval);
  }, []);

  const stats = data.stats || {};
  const events = data.events || [];

  return (
    <div className="flex-1 bg-background text-text p-4 md:p-8 min-h-screen">
      <div className="max-w-6xl mx-auto space-y-8">
        <header className="border-b border-secondary pb-6 flex justify-between items-end">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-white flex items-center space-x-3">
              <ShieldCheck className="text-primary" size={32} />
              <span>Security Monitor</span>
            </h1>
            <p className="text-text-muted mt-1">Real-time overview of ticket booking security metrics.</p>
          </div>
          <div className="flex items-center space-x-2 text-sm">
            <span className="w-2.5 h-2.5 rounded-full bg-green-500 animate-pulse"></span>
            <span className="text-text-muted">Live Tracking</span>
          </div>
        </header>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard title="Booking Requests" value={stats.bookingRequests || 0} icon={<Activity />} />
          <StatCard title="Successful Bookings" value={stats.successfulBookings || 0} icon={<ShieldCheck className="text-success" />} />
          <StatCard title="Failed Bookings" value={stats.failedBookings || 0} icon={<AlertTriangle className="text-warning" />} />
          <StatCard title="Tickets Issued" value={stats.ticketsIssued || 0} icon={<Ticket className="text-primary" />} />
          
          <StatCard title="Suspicious Requests" value={stats.suspiciousRequests || 0} icon={<ShieldAlert className="text-warning" />} highlight />
          <StatCard title="Rate Limited" value={stats.rateLimitedRequests || 0} icon={<Users className="text-danger" />} highlight />
          <StatCard title="Duplicate Requests" value={stats.duplicateRequests || 0} icon={<AlertTriangle className="text-danger" />} highlight />
          <StatCard title="Active Throttles" value={stats.activeThrottles || 0} icon={<ShieldAlert className="text-danger" />} highlight />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 pt-6">
          {/* Architecture flow */}
          <div className="bg-surface border border-secondary rounded-xl p-6">
            <h2 className="text-xl font-bold text-white mb-6">Security Architecture Flow</h2>
            <div className="space-y-4">
              <FlowStep title="User Request" desc="Incoming booking or validation request" />
              <FlowStep title="Rate Limit / Abuse Protection" desc="Blocks rapid/duplicate requests" />
              <FlowStep title="Purchase Limit Check" desc="Verifies 2-ticket max per user" />
              <FlowStep title="Redis Atomic Reservation" desc="Locks seat exclusively (prevents oversell)" />
              <FlowStep title="Cryptographic Signature" desc="Generates tamper-proof QR token" />
              <FlowStep title="Check-in Validation" desc="Verifies signature & reuse status" />
            </div>
          </div>

          {/* Events Log */}
          <div className="bg-surface border border-secondary rounded-xl p-6 flex flex-col">
            <h2 className="text-xl font-bold text-white mb-6">Recent Security Events</h2>
            <div className="flex-1 overflow-y-auto space-y-3 max-h-[500px] pr-2 custom-scrollbar">
              {events.length === 0 ? (
                <div className="text-center py-8 text-text-muted">No recent security events.</div>
              ) : (
                events.map((evt: any) => (
                  <div key={evt.id} className="bg-background border border-secondary p-3 rounded-lg text-sm">
                    <div className="flex justify-between items-start mb-1">
                      <span className="font-bold text-white">{evt.title}</span>
                      <span className="text-xs text-text-muted">{new Date(evt.timestamp).toLocaleTimeString()}</span>
                    </div>
                    <p className="text-text-muted text-xs">{evt.description}</p>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ title, value, icon, highlight = false }: any) {
  return (
    <div className={`bg-surface p-5 rounded-xl border ${highlight && value > 0 ? 'border-danger/50 shadow-[0_0_10px_rgba(239,68,68,0.2)]' : 'border-secondary'}`}>
      <div className="flex justify-between items-start mb-2">
        <span className="text-text-muted text-xs font-semibold uppercase tracking-wider">{title}</span>
        <div className="text-text-muted opacity-50">{icon}</div>
      </div>
      <div className={`text-3xl font-bold ${highlight && value > 0 ? 'text-danger' : 'text-white'}`}>
        {value}
      </div>
    </div>
  );
}

function FlowStep({ title, desc }: any) {
  return (
    <div className="flex items-start space-x-3">
      <div className="flex flex-col items-center mt-1">
        <div className="w-3 h-3 rounded-full bg-primary ring-4 ring-primary/20"></div>
        <div className="w-0.5 h-10 bg-secondary my-1"></div>
      </div>
      <div>
        <h4 className="font-bold text-white text-sm">{title}</h4>
        <p className="text-text-muted text-xs">{desc}</p>
      </div>
    </div>
  );
}
