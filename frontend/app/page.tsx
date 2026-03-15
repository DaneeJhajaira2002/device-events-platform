'use client';

import { useEffect, useMemo, useState } from 'react';
import { io, Socket } from 'socket.io-client';

type EventItem = {
  id: number;
  deviceId: string;
  type: string;
  value: number;
  eventTime: string;
  createdAt: string;
};

type AlertItem = {
  id: number;
  deviceId: string;
  message: string;
  createdAt: string;
};

type ActiveDevice = {
  deviceId: string;
  lastEvent: string | null;
};

const API_URL = process.env.NEXT_PUBLIC_API_URL!;
const WS_URL = process.env.NEXT_PUBLIC_WS_URL!;

export default function Home() {
  const [events, setEvents] = useState<EventItem[]>([]);
  const [alerts, setAlerts] = useState<AlertItem[]>([]);
  const [activeDevices, setActiveDevices] = useState<ActiveDevice[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadInitialData = async () => {
      try {
        const [eventsRes, alertsRes, devicesRes] = await Promise.all([
          fetch(`${API_URL}/events/recent?limit=10`, { cache: 'no-store' }),
          fetch(`${API_URL}/alerts/recent?limit=10`, { cache: 'no-store' }),
          fetch(`${API_URL}/devices/active`, { cache: 'no-store' }),
        ]);

        const [eventsData, alertsData, devicesData] = await Promise.all([
          eventsRes.json(),
          alertsRes.json(),
          devicesRes.json(),
        ]);

        setEvents(eventsData);
        setAlerts(alertsData);
        setActiveDevices(devicesData);
      } catch (error) {
        console.error('Error loading dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadInitialData();
  }, []);

  useEffect(() => {
    const socket: Socket = io(WS_URL, {
      transports: ['websocket'],
    });

    socket.on('event:new', (newEvent: EventItem) => {
      setEvents((prev) => [newEvent, ...prev].slice(0, 10));

      setActiveDevices((prev) => {
        const filtered = prev.filter(
          (device) => device.deviceId !== newEvent.deviceId,
        );

        return [
          {
            deviceId: newEvent.deviceId,
            lastEvent: newEvent.eventTime,
          },
          ...filtered,
        ].slice(0, 10);
      });
    });

    socket.on('alert:new', (newAlert: AlertItem) => {
      setAlerts((prev) => [newAlert, ...prev].slice(0, 10));
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  const totalActiveDevices = useMemo(() => activeDevices.length, [activeDevices]);

  if (loading) {
    return (
      <main className="min-h-screen bg-slate-50 p-8">
        <div className="mx-auto max-w-6xl">
          <h1 className="text-3xl font-bold text-slate-900">
            Device Events Dashboard
          </h1>
          <p className="mt-4 text-slate-600">Loading dashboard...</p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50 p-8">
      <div className="mx-auto max-w-6xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900">
            Device Events Dashboard
          </h1>
          <p className="mt-2 text-slate-600">
            Real-time monitoring of device events and alerts.
          </p>
        </div>

        <section className="mb-8 grid gap-4 md:grid-cols-3">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm text-slate-500">Recent events</p>
            <p className="mt-2 text-3xl font-semibold text-slate-900">
              {events.length}
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm text-slate-500">Active devices</p>
            <p className="mt-2 text-3xl font-semibold text-slate-900">
              {totalActiveDevices}
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm text-slate-500">Recent alerts</p>
            <p className="mt-2 text-3xl font-semibold text-slate-900">
              {alerts.length}
            </p>
          </div>
        </section>

        <section className="grid gap-6 lg:grid-cols-3">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm lg:col-span-2">
            <h2 className="mb-4 text-xl font-semibold text-slate-900">
              Latest Events
            </h2>

            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-200 text-left text-slate-500">
                    <th className="px-3 py-2">Device</th>
                    <th className="px-3 py-2">Type</th>
                    <th className="px-3 py-2">Value</th>
                    <th className="px-3 py-2">Event Time</th>
                  </tr>
                </thead>
                <tbody>
                  {events.length > 0 ? (
                    events.map((event) => (
                      <tr key={event.id} className="border-b border-slate-100">
                        <td className="px-3 py-3 font-medium text-slate-800">
                          {event.deviceId}
                        </td>
                        <td className="px-3 py-3 text-slate-600">{event.type}</td>
                        <td className="px-3 py-3 text-slate-600">{event.value}</td>
                        <td className="px-3 py-3 text-slate-600">
                          {new Date(event.eventTime).toLocaleString()}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td
                        colSpan={4}
                        className="px-3 py-6 text-center text-slate-500"
                      >
                        No events available
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          <div className="space-y-6">
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <h2 className="mb-4 text-xl font-semibold text-slate-900">
                Active Devices
              </h2>

              <div className="space-y-3">
                {activeDevices.length > 0 ? (
                  activeDevices.map((device) => (
                    <div
                      key={device.deviceId}
                      className="rounded-xl border border-slate-100 bg-slate-50 p-3"
                    >
                      <p className="font-medium text-slate-800">
                        {device.deviceId}
                      </p>
                      <p className="mt-1 text-sm text-slate-500">
                        Last event:{' '}
                        {device.lastEvent
                          ? new Date(device.lastEvent).toLocaleString()
                          : 'N/A'}
                      </p>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-slate-500">
                    No active devices found
                  </p>
                )}
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <h2 className="mb-4 text-xl font-semibold text-slate-900">
                Recent Alerts
              </h2>

              <div className="space-y-3">
                {alerts.length > 0 ? (
                  alerts.map((alert) => (
                    <div
                      key={alert.id}
                      className="rounded-xl border border-red-200 bg-red-50 p-3"
                    >
                      <p className="font-medium text-red-800">
                        {alert.deviceId}
                      </p>
                      <p className="mt-1 text-sm text-red-700">
                        {alert.message}
                      </p>
                      <p className="mt-2 text-xs text-red-600">
                        {new Date(alert.createdAt).toLocaleString()}
                      </p>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-slate-500">No alerts available</p>
                )}
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}