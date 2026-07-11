/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { AlertTriangle, Plus, BellRing, BellOff, X, ShieldAlert, CheckCircle } from "lucide-react";
import { WeatherAlert } from "../types";

interface SevereAlertsProps {
  alerts: WeatherAlert[];
  notificationsEnabled: boolean;
  onToggleNotifications: () => void;
  onAddCustomAlert: (alert: Omit<WeatherAlert, "id">) => void;
  onClearAlerts: () => void;
  announceSpeech: (text: string) => void;
}

export default function SevereAlerts({
  alerts,
  notificationsEnabled,
  onToggleNotifications,
  onAddCustomAlert,
  onClearAlerts,
  announceSpeech
}: SevereAlertsProps) {
  const [customEvent, setCustomEvent] = useState("");
  const [customSeverity, setCustomSeverity] = useState<"Minor" | "Moderate" | "Extreme">("Moderate");
  const [customDesc, setCustomDesc] = useState("");
  const [customHours, setCustomHours] = useState("6");
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const handleNotifyToggle = () => {
    onToggleNotifications();
    const nextState = !notificationsEnabled;
    announceSpeech(
      nextState 
        ? "Push notifications successfully enabled. You will receive urgent sound-synchronized weather warnings." 
        : "Severe push notifications disabled."
    );
  };

  const handleCreateAlertSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customEvent.trim()) return;

    const endOffset = parseInt(customHours, 10) * 3600 * 1000;
    const endsStr = new Date(Date.now() + endOffset).toISOString();

    onAddCustomAlert({
      event: customEvent,
      severity: customSeverity,
      sender: "User Interactive Command Desk",
      description: customDesc || "Simulated severe local conditions. Please practice standard localized safety guidelines.",
      ends: endsStr
    });

    const success = `Simulated Alert '${customEvent}' created successfully.`;
    setSuccessMsg(success);
    announceSpeech(`Emergency Alert Issued: ${customSeverity} warning. ${customEvent}.`);
    
    // reset form
    setCustomEvent("");
    setCustomDesc("");
    
    setTimeout(() => setSuccessMsg(null), 4000);
  };

  const getSeverityBadgeClass = (severity: string) => {
    switch (severity) {
      case "Extreme":
        return "bg-red-500 text-white border-red-600";
      case "Moderate":
        return "bg-amber-500 text-slate-900 border-amber-600";
      default:
        return "bg-sky-500 text-white border-sky-600";
    }
  };

  const getAlertCardStyle = (severity: string) => {
    switch (severity) {
      case "Extreme":
        return "border-l-8 border-l-red-600 border-slate-200 dark:border-slate-800 bg-red-50/40 dark:bg-red-950/20";
      case "Moderate":
        return "border-l-8 border-l-amber-500 border-slate-200 dark:border-slate-800 bg-amber-50/40 dark:bg-amber-950/20";
      default:
        return "border-l-8 border-l-sky-500 border-slate-200 dark:border-slate-800 bg-sky-50/40 dark:bg-sky-950/20";
    }
  };

  return (
    <div className="space-y-8 animate-fade-in">
      
      {/* Alert Manager Intro Header */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm flex flex-col md:flex-row md:items-center md:justify-between gap-6">
        <div className="space-y-1">
          <h2 className="text-xl font-display font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-red-500" />
            Extreme Meteorological Warnings Desk
          </h2>
          <p className="text-sm text-slate-500">
            Monitor real-time regional warnings or configure custom meteorological parameters to test client-side responsive push layouts.
          </p>
        </div>

        {/* Dynamic Push Toggle Feedback */}
        <button
          onClick={handleNotifyToggle}
          className={`px-4 py-2.5 rounded-xl border font-bold text-sm flex items-center gap-2 transition-all-short cursor-pointer accessible-focus ${
            notificationsEnabled 
              ? "bg-emerald-50 text-emerald-800 border-emerald-300 dark:bg-emerald-950/20 dark:text-emerald-400 dark:border-emerald-900" 
              : "bg-red-50 text-red-800 border-red-200 dark:bg-red-950/20 dark:text-red-400 dark:border-red-900"
          }`}
          aria-pressed={notificationsEnabled}
          aria-label={notificationsEnabled ? "Disable push notifications simulation" : "Enable push notifications simulation"}
        >
          {notificationsEnabled ? (
            <>
              <BellRing className="w-4 h-4 text-emerald-600 animate-bounce" /> Notifications Engaged
            </>
          ) : (
            <>
              <BellOff className="w-4 h-4 text-red-500" /> Push Blocked (Simulated)
            </>
          )}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Active Weather Alerts Feed (Left 7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-amber-500" aria-hidden="true" />
              Active System Warnings ({alerts.length})
            </h3>
            {alerts.length > 0 && (
              <button 
                onClick={() => {
                  onClearAlerts();
                  announceSpeech("All active severe warning logs successfully cleared.");
                }} 
                className="text-xs text-red-500 hover:underline cursor-pointer"
                aria-label="Remove all active weather alarms"
              >
                Clear all alerts
              </button>
            )}
          </div>

          {alerts.length === 0 ? (
            <div className="p-8 rounded-2xl bg-slate-50 dark:bg-slate-900/30 border border-slate-100 dark:border-slate-800 text-center text-slate-400">
              <CheckCircle className="w-10 h-10 text-emerald-500/60 mx-auto mb-3" />
              <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">All Systems Clear</p>
              <p className="text-xs text-slate-400 mt-1">No dangerous atmospheric anomalies detected for this location.</p>
            </div>
          ) : (
            <div className="space-y-4" role="region" aria-label="Warnings List">
              {alerts.map((alert) => (
                <article 
                  key={alert.id} 
                  className={`p-5 rounded-2xl border flex flex-col justify-between ${getAlertCardStyle(alert.severity)}`}
                  tabIndex={0}
                  aria-label={`Warning: ${alert.event}, Severity Level: ${alert.severity}. issued by ${alert.sender}. ${alert.description}`}
                >
                  <div className="flex items-start justify-between gap-3 border-b border-slate-200/40 dark:border-slate-800/40 pb-2 mb-3">
                    <div>
                      <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full border ${getSeverityBadgeClass(alert.severity)}`}>
                        {alert.severity} Condition
                      </span>
                      <h4 className="text-base font-display font-bold text-slate-900 dark:text-white mt-1.5">
                        {alert.event}
                      </h4>
                    </div>
                    <span className="text-[10px] font-mono text-slate-400 shrink-0">
                      Ends: {new Date(alert.ends).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>

                  <p className="text-xs leading-relaxed text-slate-600 dark:text-slate-300 mb-4">
                    {alert.description}
                  </p>

                  <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono">
                    <span>Source: {alert.sender}</span>
                    <span>ID: {alert.id}</span>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>

        {/* Custom Weather Alarm Simulator Form (Right 5 cols) */}
        <div className="lg:col-span-5">
          <form 
            onSubmit={handleCreateAlertSubmit}
            className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4"
          >
            <h3 className="text-sm font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider border-b border-slate-100 dark:border-slate-800 pb-3">
              Trigger Weather Warning Simulation
            </h3>

            {successMsg && (
              <div 
                className="bg-emerald-50 dark:bg-emerald-950/20 text-emerald-800 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-900 p-2.5 rounded-xl text-xs flex items-center gap-1.5"
                role="alert"
              >
                <CheckCircle className="w-4 h-4 text-emerald-500" />
                <span>{successMsg}</span>
              </div>
            )}

            <div className="space-y-1.5">
              <label htmlFor="custom-event-name" className="text-xs font-bold text-slate-500 dark:text-slate-400">
                Event Name <span className="text-rose-500">*</span>
              </label>
              <input
                id="custom-event-name"
                type="text"
                required
                value={customEvent}
                onChange={(e) => setCustomEvent(e.target.value)}
                placeholder="e.g., Tornado Touchdown, Heavy Frost"
                className="w-full text-xs p-2.5 border border-slate-200 dark:border-slate-800 rounded-lg focus:ring-2 focus:ring-sky-500 bg-slate-50/50 dark:bg-slate-950 dark:text-white"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label htmlFor="custom-severity" className="text-xs font-bold text-slate-500 dark:text-slate-400">
                  Severity Level
                </label>
                <select
                  id="custom-severity"
                  value={customSeverity}
                  onChange={(e) => setCustomSeverity(e.target.value as any)}
                  className="w-full text-xs p-2.5 border border-slate-200 dark:border-slate-800 rounded-lg focus:ring-2 focus:ring-sky-500 bg-slate-50/50 dark:bg-slate-950 dark:text-white cursor-pointer"
                >
                  <option value="Minor">Minor</option>
                  <option value="Moderate">Moderate</option>
                  <option value="Extreme">Extreme</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label htmlFor="custom-duration" className="text-xs font-bold text-slate-500 dark:text-slate-400">
                  Duration (Hours)
                </label>
                <input
                  id="custom-duration"
                  type="number"
                  min="1"
                  max="72"
                  value={customHours}
                  onChange={(e) => setCustomHours(e.target.value)}
                  className="w-full text-xs p-2.5 border border-slate-200 dark:border-slate-800 rounded-lg focus:ring-2 focus:ring-sky-500 bg-slate-50/50 dark:bg-slate-950 dark:text-white"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label htmlFor="custom-event-desc" className="text-xs font-bold text-slate-500 dark:text-slate-400">
                Warning Instructions / Details
              </label>
              <textarea
                id="custom-event-desc"
                rows={3}
                value={customDesc}
                onChange={(e) => setCustomDesc(e.target.value)}
                placeholder="e.g., Extreme storm cells moving through county. Secure greenhouse fixtures and avoid low-lying bridges."
                className="w-full text-xs p-2.5 border border-slate-200 dark:border-slate-800 rounded-lg focus:ring-2 focus:ring-sky-500 bg-slate-50/50 dark:bg-slate-950 dark:text-white resize-none"
              />
            </div>

            <button
              type="submit"
              className="w-full bg-sky-600 hover:bg-sky-500 text-white py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 shadow-sm hover:shadow transition-all-short cursor-pointer"
            >
              <Plus className="w-4 h-4" /> Issue Atmospheric Alert
            </button>
          </form>

          <div className="mt-4 p-4 rounded-2xl bg-amber-50 dark:bg-slate-900/30 border border-amber-200/50 dark:border-slate-800 text-[11px] text-slate-600 dark:text-slate-300 leading-relaxed">
            <p className="font-bold text-slate-700 dark:text-slate-200 flex items-center gap-1 mb-1">
              <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
              Dynamic Accessibility Rule:
            </p>
            When simulation triggers an alert, we write directly to an active aria-live box (at the top of the interface) to ensure instant narration for screen-reader users.
          </div>
        </div>

      </div>
    </div>
  );
}
