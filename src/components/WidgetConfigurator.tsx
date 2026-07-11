/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { Sliders, Check, LayoutGrid, List, SlidersHorizontal, Eye } from "lucide-react";
import { WidgetConfig } from "../types";

interface WidgetConfiguratorProps {
  config: WidgetConfig;
  onChange: (newConfig: WidgetConfig) => void;
  announceSpeech: (text: string) => void;
}

export default function WidgetConfigurator({
  config,
  onChange,
  announceSpeech
}: WidgetConfiguratorProps) {
  
  const allMetrics = [
    { id: "temp", label: "Temperature" },
    { id: "apparentTemp", label: "Apparent Temp (Feels Like)" },
    { id: "humidity", label: "Humidity Percentage" },
    { id: "precipitationProb", label: "Precipitation Probability" },
    { id: "windSpeed", label: "Wind Velocity" },
    { id: "uvIndex", label: "UV index Exposure" }
  ];

  const handleLayoutChange = (layout: "grid" | "list" | "compact") => {
    onChange({ ...config, layout });
    announceSpeech(`Hourly layout style changed to ${layout} view.`);
  };

  const handleHoursChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const hours = parseInt(e.target.value, 10);
    onChange({ ...config, hourlyHoursCount: hours });
  };

  const handleHoursMouseUp = () => {
    announceSpeech(`Hourly timeline limit adjusted to ${config.hourlyHoursCount} hours.`);
  };

  const toggleMetric = (metricId: string) => {
    let nextMetrics = [...config.visibleMetrics];
    if (nextMetrics.includes(metricId)) {
      if (nextMetrics.length === 1) {
        announceSpeech("Error: At least one meteorological parameter must remain active.");
        return; // maintain at least one
      }
      nextMetrics = nextMetrics.filter((m) => m !== metricId);
      announceSpeech(`Removed ${metricId} parameter from active hourly widget displays.`);
    } else {
      nextMetrics.push(metricId);
      announceSpeech(`Added ${metricId} parameter to active hourly widget displays.`);
    }
    onChange({ ...config, visibleMetrics: nextMetrics });
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm space-y-8 animate-fade-in">
      <div>
        <h2 className="text-xl font-display font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <Sliders className="w-5 h-5 text-sky-600 dark:text-sky-400" />
          Customize Your Hourly Widget Display
        </h2>
        <p className="text-sm text-slate-500 mt-1">
          Tailor layout constraints, parameter visibility, and chronological scope to fit your visual or screen-reader preferences.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Controls Column */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* 1. Layout Mode Selection */}
          <fieldset className="space-y-3">
            <legend className="text-sm font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
              1. Visual Layout Style
            </legend>
            
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <button
                type="button"
                onClick={() => handleLayoutChange("grid")}
                className={`flex items-center gap-2.5 p-3.5 rounded-xl border text-left cursor-pointer transition-all-short accessible-focus ${
                  config.layout === "grid"
                    ? "bg-sky-50/50 border-sky-400 text-sky-800 dark:bg-sky-950/20 dark:border-sky-700 dark:text-sky-300"
                    : "bg-white border-slate-200 text-slate-600 dark:bg-slate-950 dark:border-slate-800 dark:text-slate-400"
                }`}
                aria-pressed={config.layout === "grid"}
                aria-label="Set grid card layout"
              >
                <LayoutGrid className="w-5 h-5 text-sky-500" />
                <div>
                  <p className="text-xs font-bold">Standard Grid</p>
                  <p className="text-[10px] text-slate-400">Multi-column cards</p>
                </div>
              </button>

              <button
                type="button"
                onClick={() => handleLayoutChange("list")}
                className={`flex items-center gap-2.5 p-3.5 rounded-xl border text-left cursor-pointer transition-all-short accessible-focus ${
                  config.layout === "list"
                    ? "bg-sky-50/50 border-sky-400 text-sky-800 dark:bg-sky-950/20 dark:border-sky-700 dark:text-sky-300"
                    : "bg-white border-slate-200 text-slate-600 dark:bg-slate-950 dark:border-slate-800 dark:text-slate-400"
                }`}
                aria-pressed={config.layout === "list"}
                aria-label="Set list rows layout"
              >
                <List className="w-5 h-5 text-sky-500" />
                <div>
                  <p className="text-xs font-bold">Chronological List</p>
                  <p className="text-[10px] text-slate-400">Vertical list rows</p>
                </div>
              </button>

              <button
                type="button"
                onClick={() => handleLayoutChange("compact")}
                className={`flex items-center gap-2.5 p-3.5 rounded-xl border text-left cursor-pointer transition-all-short accessible-focus ${
                  config.layout === "compact"
                    ? "bg-sky-50/50 border-sky-400 text-sky-800 dark:bg-sky-950/20 dark:border-sky-700 dark:text-sky-300"
                    : "bg-white border-slate-200 text-slate-600 dark:bg-slate-950 dark:border-slate-800 dark:text-slate-400"
                }`}
                aria-pressed={config.layout === "compact"}
                aria-label="Set compact chip layout"
              >
                <SlidersHorizontal className="w-5 h-5 text-sky-500" />
                <div>
                  <p className="text-xs font-bold">Compact Chips</p>
                  <p className="text-[10px] text-slate-400">Inline pill badges</p>
                </div>
              </button>
            </div>
          </fieldset>

          {/* 2. Chronological scope slider */}
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <label htmlFor="hourly-count-slider" className="text-sm font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                2. Timeline Scope ({config.hourlyHoursCount} Hours)
              </label>
              <span className="text-xs font-mono font-bold text-sky-600 dark:text-sky-400 px-2 py-0.5 bg-sky-50 dark:bg-slate-800 rounded">
                Show next {config.hourlyHoursCount} steps
              </span>
            </div>
            
            <input
              id="hourly-count-slider"
              type="range"
              min="4"
              max="24"
              step="1"
              value={config.hourlyHoursCount}
              onChange={handleHoursChange}
              onMouseUp={handleHoursMouseUp}
              onTouchEnd={handleHoursMouseUp}
              className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-sky-500 focus:ring-4 focus:ring-sky-200 outline-none"
              aria-valuemin={4}
              aria-valuemax={24}
              aria-valuenow={config.hourlyHoursCount}
            />
            <div className="flex justify-between text-[10px] text-slate-400 font-mono" aria-hidden="true">
              <span>4 Hours (Compact)</span>
              <span>12 Hours (Half Day)</span>
              <span>24 Hours (Full day)</span>
            </div>
          </div>

          {/* 3. Parameter Toggles */}
          <fieldset className="space-y-3">
            <legend className="text-sm font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
              3. Meteorological Parameter Toggles
            </legend>
            <p className="text-xs text-slate-400">Select which measurements display on your customizable widgets screen.</p>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              {allMetrics.map((metric) => {
                const isChecked = config.visibleMetrics.includes(metric.id);
                return (
                  <button
                    key={metric.id}
                    type="button"
                    onClick={() => toggleMetric(metric.id)}
                    className={`flex items-center justify-between p-3 rounded-xl border text-left cursor-pointer transition-all-short accessible-focus ${
                      isChecked
                        ? "bg-slate-50 border-slate-300 dark:bg-slate-800/30 dark:border-slate-700 text-slate-900 dark:text-white"
                        : "bg-white border-slate-100 text-slate-400 dark:bg-slate-950 dark:border-slate-900"
                    }`}
                    aria-checked={isChecked}
                    role="checkbox"
                    aria-label={`Toggle visibility for ${metric.label}`}
                  >
                    <span className="text-xs font-semibold">{metric.label}</span>
                    <div className={`w-5 h-5 rounded flex items-center justify-center border transition-all ${
                      isChecked 
                        ? "bg-sky-500 border-sky-500 text-white" 
                        : "border-slate-300 dark:border-slate-800 text-transparent"
                    }`}>
                      <Check className="w-3.5 h-3.5 stroke-[3]" />
                    </div>
                  </button>
                );
              })}
            </div>
          </fieldset>
        </div>

        {/* Live Preview Column */}
        <div className="lg:col-span-5 bg-slate-50 dark:bg-slate-950/40 p-5 rounded-2xl border border-slate-100 dark:border-slate-900 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 text-slate-400 mb-4 border-b border-slate-200 dark:border-slate-800 pb-2">
              <Eye className="w-4 h-4" />
              <span className="text-xs font-bold uppercase tracking-wider">Widget Live Preview</span>
            </div>

            {/* Simulating how it renders */}
            <div className="space-y-4">
              <p className="text-[11px] text-slate-400">This simulates how a single hourly element displays with your current configuration:</p>
              
              <div className="flex justify-center py-4">
                {config.layout === "grid" && (
                  <div className="p-4 rounded-xl border border-sky-300 bg-white dark:bg-slate-900 text-center w-36 shadow-sm">
                    <p className="text-xs text-slate-400 font-mono">14:00</p>
                    <p className="text-3xl my-2">🌦️</p>
                    <div className="space-y-1">
                      {config.visibleMetrics.includes("temp") && <p className="text-base font-mono font-bold">22°C</p>}
                      {config.visibleMetrics.includes("apparentTemp") && <p className="text-[10px] text-slate-400">App: 21°C</p>}
                      {config.visibleMetrics.includes("humidity") && <p className="text-[10px] text-sky-600 font-mono">💧55%</p>}
                      {config.visibleMetrics.includes("precipitationProb") && <p className="text-[10px] text-blue-600 font-mono">☔15%</p>}
                      {config.visibleMetrics.includes("windSpeed") && <p className="text-[10px] text-slate-400 font-mono">💨12km/h</p>}
                      {config.visibleMetrics.includes("uvIndex") && <p className="text-[10px] text-amber-600 font-mono">☀️UV 3</p>}
                    </div>
                  </div>
                )}

                {config.layout === "list" && (
                  <div className="p-3 rounded-xl border border-sky-300 bg-white dark:bg-slate-900 flex items-center justify-between w-full shadow-sm max-w-sm">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold font-mono">14:00</span>
                      <span>🌦️</span>
                      <span className="text-xs text-slate-500">Light Showers</span>
                    </div>
                    <div className="flex items-center gap-3">
                      {config.visibleMetrics.includes("temp") && <span className="text-xs font-mono font-bold">22°C</span>}
                      {config.visibleMetrics.includes("precipitationProb") && <span className="text-[11px] text-blue-500 font-mono">☔15%</span>}
                    </div>
                  </div>
                )}

                {config.layout === "compact" && (
                  <span className="bg-white dark:bg-slate-900 border border-sky-300 rounded-lg px-3 py-1.5 text-xs font-mono flex items-center gap-2 shadow-sm">
                    <span className="font-bold text-slate-400">14:00</span>
                    <span>🌦️</span>
                    <span className="font-bold">22°C</span>
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="text-[10px] text-slate-400 leading-relaxed border-t border-slate-200 dark:border-slate-800 pt-4 mt-6">
            Tip: High contrast mode enforces 2px bold solid black/white frames around widgets for absolute low-vision visibility.
          </div>
        </div>
      </div>
    </div>
  );
}
