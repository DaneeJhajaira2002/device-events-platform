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

type DeviceStats = {
  deviceId: string;
  eventsLast24h: number;
  averageValue: number | null;
  lastEvent: string | null;
};

const API_URL = process.env.NEXT_PUBLIC_API_URL!;
const WS_URL = process.env.NEXT_PUBLIC_WS_URL!;

function formatDate(value: string | null) {
  if (!value) return 'N/A';
  return new Date(value).toLocaleString();
}

export default function Home() {
  const [events, setEvents] = useState<EventItem[]>([]);
  const [alerts, setAlerts] = useState<AlertItem[]>([]);
  const [activeDevices, setActiveDevices] = useState<ActiveDevice[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSocketConnected, setIsSocketConnected] = useState(false);

  const [selectedDeviceId, setSelectedDeviceId] = useState<string>('');
  const [deviceStats, setDeviceStats] = useState<DeviceStats | null>(null);
  const [statsLoading, setStatsLoading] = useState(false);

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

        if (devicesData.length > 0) {
          setSelectedDeviceId(devicesData[0].deviceId);
        }
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

    socket.on('connect', () => {
      setIsSocketConnected(true);
    });

    socket.on('disconnect', () => {
      setIsSocketConnected(false);
    });

    socket.on('event:new', (newEvent: EventItem) => {
      setEvents((prev) => [newEvent, ...prev].slice(0, 10));

      setActiveDevices((prev) => {
        const filtered = prev.filter(
          (device) => device.deviceId !== newEvent.deviceId,
        );

        const updated = [
          {
            deviceId: newEvent.deviceId,
            lastEvent: newEvent.eventTime,
          },
          ...filtered,
        ].slice(0, 10);

        if (!selectedDeviceId) {
          setSelectedDeviceId(newEvent.deviceId);
        }

        return updated;
      });

      if (selectedDeviceId === newEvent.deviceId) {
        setDeviceStats((prev) =>
          prev
            ? {
                ...prev,
                lastEvent: newEvent.eventTime,
              }
            : prev,
        );
      }
    });

    socket.on('alert:new', (newAlert: AlertItem) => {
      setAlerts((prev) => [newAlert, ...prev].slice(0, 10));
    });

    return () => {
      socket.disconnect();
    };
  }, [selectedDeviceId]);

  useEffect(() => {
    const loadDeviceStats = async () => {
      if (!selectedDeviceId) {
        setDeviceStats(null);
        return;
      }

      try {
        setStatsLoading(true);
        const response = await fetch(
          `${API_URL}/devices/${selectedDeviceId}/stats`,
          {
            cache: 'no-store',
          },
        );

        const data = await response.json();
        setDeviceStats(data);
      } catch (error) {
        console.error('Error loading device stats:', error);
        setDeviceStats(null);
      } finally {
        setStatsLoading(false);
      }
    };

    loadDeviceStats();
  }, [selectedDeviceId]);

  const totalActiveDevices = useMemo(() => activeDevices.length, [activeDevices]);

  const latestEventTime = useMemo(() => {
    if (!events.length) return 'No recent activity';
    return formatDate(events[0].eventTime);
  }, [events]);

  if (loading) {
    return (
      <main className="min-h-screen bg-slate-950 text-white">
        <div className="mx-auto flex min-h-screen max-w-7xl items-center justify-center px-6">
          <div className="rounded-3xl border border-white/10 bg-white/5 px-8 py-6 shadow-2xl backdrop-blur">
            <p className="text-lg font-medium text-slate-200">
              Loading dashboard...
            </p>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <header className="mb-8 overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 p-6 shadow-2xl sm:p-8">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="mb-2 text-sm uppercase tracking-[0.2em] text-cyan-300">
                Real-time monitoring
              </p>
              <h1 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
                Device Events Dashboard
              </h1>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-300 sm:text-base">
                Monitor device activity, track recent alerts, and visualize
                incoming events in real time for clinical operations.
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
                <p className="text-xs uppercase tracking-wide text-slate-400">
                  Connection
                </p>
                <div className="mt-2 flex items-center gap-2">
                  <span
                    className={`h-2.5 w-2.5 rounded-full ${
                      isSocketConnected ? 'bg-emerald-400' : 'bg-red-400'
                    }`}
                  />
                  <span className="text-sm font-medium text-slate-100">
                    {isSocketConnected ? 'Live updates active' : 'Disconnected'}
                  </span>
                </div>
              </div>

              <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
                <p className="text-xs uppercase tracking-wide text-slate-400">
                  Last event
                </p>
                <p className="mt-2 text-sm font-medium text-slate-100">
                  {latestEventTime}
                </p>
              </div>
            </div>
          </div>
        </header>

        <section className="mb-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-3xl border border-cyan-400/20 bg-cyan-400/10 p-5 shadow-lg shadow-cyan-950/30">
            <p className="text-sm text-cyan-200">Recent events</p>
            <p className="mt-3 text-3xl font-semibold text-white">
              {events.length}
            </p>
          </div>

          <div className="rounded-3xl border border-emerald-400/20 bg-emerald-400/10 p-5 shadow-lg shadow-emerald-950/30">
            <p className="text-sm text-emerald-200">Active devices</p>
            <p className="mt-3 text-3xl font-semibold text-white">
              {totalActiveDevices}
            </p>
          </div>

          <div className="rounded-3xl border border-rose-400/20 bg-rose-400/10 p-5 shadow-lg shadow-rose-950/30">
            <p className="text-sm text-rose-200">Recent alerts</p>
            <p className="mt-3 text-3xl font-semibold text-white">
              {alerts.length}
            </p>
          </div>

          <div className="rounded-3xl border border-violet-400/20 bg-violet-400/10 p-5 shadow-lg shadow-violet-950/30">
            <p className="text-sm text-violet-200">Monitoring status</p>
            <p className="mt-3 text-lg font-semibold text-white">
              {isSocketConnected ? 'Realtime enabled' : 'Waiting connection'}
            </p>
          </div>
        </section>

        <section className="mb-8 rounded-3xl border border-white/10 bg-slate-900/70 p-5 shadow-2xl backdrop-blur">
          <div className="mb-5 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <h2 className="text-xl font-semibold text-white">
                Device Statistics
              </h2>
              <p className="mt-1 text-sm text-slate-400">
                Inspect aggregated metrics for a selected device over the last 24
                hours.
              </p>
            </div>

            <div className="w-full lg:w-80">
              <label
                htmlFor="device-select"
                className="mb-2 block text-sm font-medium text-slate-300"
              >
                Select device
              </label>
              <select
                id="device-select"
                value={selectedDeviceId}
                onChange={(e) => setSelectedDeviceId(e.target.value)}
                className="w-full rounded-2xl border border-white/10 bg-slate-950 px-4 py-3 text-sm text-white outline-none transition focus:border-cyan-400/50"
              >
                <option value="">Choose a device</option>
                {activeDevices.map((device) => (
                  <option key={device.deviceId} value={device.deviceId}>
                    {device.deviceId}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {statsLoading ? (
            <div className="rounded-2xl border border-white/10 bg-white/5 p-6 text-sm text-slate-300">
              Loading device statistics...
            </div>
          ) : deviceStats ? (
            <div className="grid gap-4 md:grid-cols-3">
              <div className="rounded-2xl border border-cyan-400/20 bg-cyan-400/10 p-5">
                <p className="text-sm text-cyan-200">Events last 24h</p>
                <p className="mt-3 text-3xl font-semibold text-white">
                  {deviceStats.eventsLast24h}
                </p>
              </div>

              <div className="rounded-2xl border border-emerald-400/20 bg-emerald-400/10 p-5">
                <p className="text-sm text-emerald-200">Average value</p>
                <p className="mt-3 text-3xl font-semibold text-white">
                  {deviceStats.averageValue ?? 'N/A'}
                </p>
              </div>

              <div className="rounded-2xl border border-violet-400/20 bg-violet-400/10 p-5">
                <p className="text-sm text-violet-200">Last event</p>
                <p className="mt-3 text-sm font-medium text-white">
                  {formatDate(deviceStats.lastEvent)}
                </p>
              </div>
            </div>
          ) : (
            <div className="rounded-2xl border border-dashed border-white/10 p-6 text-sm text-slate-400">
              Select a device to view its statistics.
            </div>
          )}
        </section>

        <section className="grid gap-6 xl:grid-cols-[minmax(0,2fr)_minmax(320px,1fr)]">
          <div className="rounded-3xl border border-white/10 bg-slate-900/70 p-4 shadow-2xl backdrop-blur sm:p-6">
            <div className="mb-5 flex items-center justify-between gap-3">
              <div>
                <h2 className="text-xl font-semibold text-white">
                  Latest Events
                </h2>
                <p className="mt-1 text-sm text-slate-400">
                  Most recent device activity ordered by event time.
                </p>
              </div>
            </div>

            <div className="overflow-hidden rounded-2xl border border-white/10">
              <div className="overflow-x-auto">
                <table className="min-w-full text-left text-sm">
                  <thead className="bg-white/5 text-slate-300">
                    <tr>
                      <th className="px-4 py-3 font-medium">Device</th>
                      <th className="px-4 py-3 font-medium">Type</th>
                      <th className="px-4 py-3 font-medium">Value</th>
                      <th className="px-4 py-3 font-medium">Event time</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {events.length > 0 ? (
                      events.map((event) => (
                        <tr
                          key={event.id}
                          className="transition-colors hover:bg-white/5"
                        >
                          <td className="px-4 py-4">
                            <button
                              type="button"
                              onClick={() => setSelectedDeviceId(event.deviceId)}
                              className="inline-flex rounded-full border border-cyan-400/20 bg-cyan-400/10 px-3 py-1 text-xs font-semibold text-cyan-200 transition hover:bg-cyan-400/20"
                            >
                              {event.deviceId}
                            </button>
                          </td>
                          <td className="px-4 py-4 text-slate-200">
                            {event.type}
                          </td>
                          <td className="px-4 py-4 text-slate-200">
                            {event.value}
                          </td>
                          <td className="px-4 py-4 text-slate-400">
                            {formatDate(event.eventTime)}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td
                          colSpan={4}
                          className="px-4 py-10 text-center text-slate-400"
                        >
                          No events available
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          <div className="grid gap-6">
            <section className="rounded-3xl border border-white/10 bg-slate-900/70 p-5 shadow-2xl backdrop-blur">
              <div className="mb-4">
                <h2 className="text-xl font-semibold text-white">
                  Active Devices
                </h2>
                <p className="mt-1 text-sm text-slate-400">
                  Devices with recent activity.
                </p>
              </div>

              <div className="space-y-3">
                {activeDevices.length > 0 ? (
                  activeDevices.map((device) => (
                    <button
                      key={device.deviceId}
                      type="button"
                      onClick={() => setSelectedDeviceId(device.deviceId)}
                      className={`block w-full rounded-2xl border p-4 text-left transition ${
                        selectedDeviceId === device.deviceId
                          ? 'border-cyan-400/40 bg-cyan-400/10'
                          : 'border-white/10 bg-white/5 hover:bg-white/10'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="text-sm font-semibold text-white">
                            {device.deviceId}
                          </p>
                          <p className="mt-2 text-xs text-slate-400">
                            Last event
                          </p>
                          <p className="text-sm text-slate-200">
                            {formatDate(device.lastEvent)}
                          </p>
                        </div>
                        <span className="mt-1 h-2.5 w-2.5 rounded-full bg-emerald-400" />
                      </div>
                    </button>
                  ))
                ) : (
                  <div className="rounded-2xl border border-dashed border-white/10 p-4 text-sm text-slate-400">
                    No active devices found
                  </div>
                )}
              </div>
            </section>

            <section className="rounded-3xl border border-white/10 bg-slate-900/70 p-5 shadow-2xl backdrop-blur">
              <div className="mb-4">
                <h2 className="text-xl font-semibold text-white">
                  Recent Alerts
                </h2>
                <p className="mt-1 text-sm text-slate-400">
                  Automatic alerts triggered by system rules.
                </p>
              </div>

              <div className="space-y-3">
                {alerts.length > 0 ? (
                  alerts.map((alert) => (
                    <div
                      key={alert.id}
                      className="rounded-2xl border border-rose-400/20 bg-rose-400/10 p-4"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="text-sm font-semibold text-rose-100">
                            {alert.deviceId}
                          </p>
                          <p className="mt-2 text-sm text-rose-200">
                            {alert.message}
                          </p>
                          <p className="mt-3 text-xs text-rose-300/80">
                            {formatDate(alert.createdAt)}
                          </p>
                        </div>
                        <span className="rounded-full border border-rose-300/30 bg-rose-300/10 px-2 py-1 text-[10px] font-semibold uppercase tracking-wide text-rose-100">
                          Alert
                        </span>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="rounded-2xl border border-dashed border-white/10 p-4 text-sm text-slate-400">
                    No alerts available
                  </div>
                )}
              </div>
            </section>
          </div>
        </section>
      </div>
    </main>
  );
}