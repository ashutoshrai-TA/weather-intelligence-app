/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { motion } from "motion/react";
import { 
  Sun, 
  Cloud, 
  CloudRain, 
  CloudSnow, 
  CloudLightning, 
  Wind, 
  Thermometer, 
  Droplets, 
  Eye, 
  Heart, 
  Calendar, 
  AlertTriangle, 
  Sparkles, 
  Clock, 
  Info,
  Compass,
  ArrowDownUp,
  Download
} from "lucide-react";
import { WeatherData, WeatherAlert, WidgetConfig, LocationInfo } from "../types";
import { getWeatherEmoji } from "../utils/weatherCodes";

interface WeatherDashboardProps {
  weather: WeatherData;
  aiInsight: any;
  loadingInsight: boolean;
  onRefreshInsight: () => void;
  favorites: LocationInfo[];
  onToggleFavorite: (loc: LocationInfo) => void;
  widgets: WidgetConfig;
  highContrast: boolean;
  announceSpeech: (text: string) => void;
  offline: boolean;
}

export default function WeatherDashboard({
  weather,
  aiInsight,
  loadingInsight,
  onRefreshInsight,
  favorites,
  onToggleFavorite,
  widgets,
  highContrast,
  announceSpeech,
  offline
}: WeatherDashboardProps) {
  const isFavorite = favorites.some(
    (f) => f.latitude === weather.location.latitude && f.longitude === weather.location.longitude
  );

  // Map WMO codes to appropriate Lucide icons for high-readability visual reinforcement
  const getWeatherIcon = (code: number, className = "w-6 h-6") => {
    if (code === 0) return <Sun className={`${className} text-amber-500`} aria-hidden="true" />;
    if (code >= 1 && code <= 3) return <Cloud className={`${className} text-sky-400`} aria-hidden="true" />;
    if (code >= 51 && code <= 67) return <CloudRain className={`${className} text-blue-400`} aria-hidden="true" />;
    if (code >= 80 && code <= 82) return <CloudRain className={`${className} text-blue-500`} aria-hidden="true" />;
    if (code >= 71 && code <= 77) return <CloudSnow className={`${className} text-sky-200`} aria-hidden="true" />;
    if (code >= 85 && code <= 86) return <CloudSnow className={`${className} text-sky-300`} aria-hidden="true" />;
    if (code >= 95 && code <= 99) return <CloudLightning className={`${className} text-purple-400`} aria-hidden="true" />;
    return <Cloud className={`${className} text-gray-400`} aria-hidden="true" />;
  };

  const getSeverityBadgeClass = (level: string) => {
    switch (level?.toLowerCase()) {
      case "high":
        return "bg-red-100 dark:bg-red-950/40 text-red-700 dark:text-red-400 border border-red-300 dark:border-red-900";
      case "medium":
        return "bg-orange-100 dark:bg-orange-950/40 text-orange-700 dark:text-orange-400 border border-orange-300 dark:border-orange-900";
      case "low":
        return "bg-amber-100 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 border border-amber-300 dark:border-amber-900";
      default:
        return "bg-green-100 dark:bg-green-950/40 text-green-700 dark:text-green-400 border border-green-300 dark:border-green-900";
    }
  };

  const getRatingColorClass = (rating: number) => {
    if (rating >= 8) return "bg-green-500";
    if (rating >= 5) return "bg-amber-500";
    return "bg-red-500";
  };

  // Helper to filter and limit hourly list based on widget hours count
  const hourlyToShow = weather.hourly.slice(0, widgets.hourlyHoursCount || 8);

  const handleFavoriteClick = () => {
    onToggleFavorite(weather.location);
    const message = isFavorite 
      ? `Removed ${weather.location.name} from favorite locations.`
      : `Added ${weather.location.name} to favorite locations.`;
    announceSpeech(message);
  };

  const handleDownloadReport = () => {
    try {
      const reportData = {
        title: "Weather Intelligence Report",
        timestamp: new Date().toISOString(),
        location: {
          name: weather.location.name,
          country: weather.location.country,
          admin1: weather.location.admin1,
          country_code: weather.location.country_code,
          latitude: weather.location.latitude,
          longitude: weather.location.longitude
        },
        current_conditions: {
          temperature_celsius: weather.current.temp,
          apparent_temperature_celsius: weather.current.apparentTemp,
          weather_code: weather.current.weatherCode,
          weather_description: weather.current.weatherDesc,
          relative_humidity_percentage: weather.current.humidity,
          wind_speed_kmh: weather.current.windSpeed,
          precipitation_probability_percentage: weather.current.precipitationProb,
          uv_index: weather.current.uvIndex,
          pressure_msl_hpa: weather.current.pressure
        },
        ai_insights: aiInsight || {
          summary: "AI insights not loaded or unavailable."
        },
        daily_forecast: weather.daily.map(d => ({
          date: d.date,
          temp_max_celsius: d.tempMax,
          temp_min_celsius: d.tempMin,
          precipitation_probability_percentage: d.precipitationProb,
          weather_code: d.weatherCode,
          weather_description: d.weatherDesc,
          uv_index_max: d.uvIndexMax
        })),
        hourly_forecast_summary: weather.hourly.slice(0, 12).map(h => ({
          time: h.time,
          temperature_celsius: h.temp,
          apparent_temperature_celsius: h.apparentTemp,
          precipitation_probability_percentage: h.precipitationProb,
          weather_code: h.weatherCode,
          weather_description: h.weatherDesc
        }))
      };

      const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(
        JSON.stringify(reportData, null, 2)
      )}`;
      const downloadAnchor = document.createElement("a");
      downloadAnchor.setAttribute("href", jsonString);
      const safeCityName = weather.location.name.toLowerCase().replace(/[^a-z0-9]/g, "_");
      downloadAnchor.setAttribute("download", `weather_report_${safeCityName}_${new Date().toISOString().slice(0, 10)}.json`);
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();

      announceSpeech(`Successfully compiled and downloaded JSON weather report for ${weather.location.name}.`);
    } catch (err: any) {
      console.error("Error creating download", err);
      announceSpeech("Failed to compile the weather report download.");
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.08,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 15 },
    show: { 
      opacity: 1, 
      y: 0, 
      transition: { 
        type: "spring", 
        stiffness: 100, 
        damping: 15 
      } 
    },
  };

  return (
    <motion.div 
      key={`${weather.location.latitude}_${weather.location.longitude}_${weather.fetchedAt}`}
      className="space-y-8"
      variants={containerVariants}
      initial="hidden"
      animate="show"
    >
      {/* Location Header Block */}
      <motion.div 
        variants={itemVariants}
        className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-5"
      >
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-display font-bold tracking-tight text-slate-900 dark:text-white">
              {weather.location.name}
            </h1>
            <button
              onClick={handleFavoriteClick}
              className={`p-2 rounded-full border transition-all-short accessible-focus cursor-pointer ${
                isFavorite 
                  ? "bg-rose-50 border-rose-200 text-rose-500 dark:bg-rose-950/20 dark:border-rose-900 dark:text-rose-400" 
                  : "bg-white border-slate-200 text-slate-400 hover:text-rose-500 dark:bg-slate-900 dark:border-slate-800"
              }`}
              title={isFavorite ? "Remove from favorite cities" : "Add to favorite cities"}
              aria-label={isFavorite ? `Remove ${weather.location.name} from favorite cities` : `Save ${weather.location.name} to favorites`}
            >
              <Heart className={`w-5 h-5 ${isFavorite ? "fill-current" : ""}`} />
            </button>
          </div>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            {weather.location.admin1 ? `${weather.location.admin1}, ` : ""}{weather.location.country || ""} 
            <span className="mx-2 font-mono" aria-hidden="true">•</span>
            Lat: <span className="font-mono">{weather.location.latitude.toFixed(2)}</span>, Lon: <span className="font-mono">{weather.location.longitude.toFixed(2)}</span>
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {offline && (
            <span 
              className="bg-amber-100 dark:bg-amber-950/50 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-900 text-xs px-3 py-1.5 rounded-full font-medium flex items-center gap-1.5"
              role="status"
              aria-live="polite"
            >
              <Info className="w-4 h-4" /> Offline Cache Active
            </span>
          )}
          <span className="text-xs text-slate-400 font-mono" aria-label={`Weather metrics compiled at ${weather.fetchedAt}`}>
            Fetched: {new Date(weather.fetchedAt).toLocaleTimeString()}
          </span>

          <button
            onClick={handleDownloadReport}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg transition-all-short cursor-pointer accessible-focus shadow-sm ${
              highContrast
                ? "bg-black hover:bg-slate-900 text-yellow-400 border-2 border-yellow-400 font-extrabold"
                : "bg-sky-600 hover:bg-sky-500 text-white"
            }`}
            aria-label={`Download meteorological report for ${weather.location.name} in JSON format`}
          >
            <Download className="w-4 h-4" aria-hidden="true" /> Download Report
          </button>
        </div>
      </motion.div>

      {/* Grid Layout: Primary Weather & AI Intelligence Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left 5 Columns: Primary Current Weather Card */}
        <motion.section 
          variants={itemVariants}
          className="lg:col-span-5 flex flex-col justify-between p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm"
          aria-label="Real-time Meteorological Metrics"
        >
          <div>
            <h2 className="sr-only">Current Weather Conditions</h2>
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm uppercase tracking-wider font-semibold text-sky-600 dark:text-sky-400">Current weather</p>
                <div className="flex items-baseline gap-1 mt-2">
                  <span className="text-6xl font-display font-bold tracking-tighter text-slate-900 dark:text-white">
                    {Math.round(weather.current.temp)}
                  </span>
                  <span className="text-3xl text-slate-400 font-light" aria-hidden="true">°C</span>
                </div>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                  Feels like <span className="font-bold font-mono text-slate-800 dark:text-slate-200">{Math.round(weather.current.apparentTemp)}°C</span>
                </p>
              </div>
              <div className="text-6xl" role="img" aria-label={weather.current.weatherDesc}>
                {getWeatherEmoji(weather.current.weatherCode)}
              </div>
            </div>

            <div className="mt-4 inline-flex items-center gap-2 bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 px-3 py-1.5 rounded-lg">
              {getWeatherIcon(weather.current.weatherCode, "w-5 h-5")}
              <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                {weather.current.weatherDesc}
              </span>
            </div>
          </div>

          {/* Key Meteorological Parameters list */}
          <div className="grid grid-cols-2 gap-4 mt-8 border-t border-slate-100 dark:border-slate-800 pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-sky-50 dark:bg-slate-800 text-sky-600 dark:text-sky-400" aria-hidden="true">
                <Droplets className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs text-slate-400">Humidity</p>
                <p className="text-base font-bold font-mono text-slate-800 dark:text-slate-100">{weather.current.humidity}%</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-amber-50 dark:bg-slate-800 text-amber-600 dark:text-amber-400" aria-hidden="true">
                <Wind className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs text-slate-400">Wind speed</p>
                <p className="text-base font-bold font-mono text-slate-800 dark:text-slate-100">{weather.current.windSpeed} km/h</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-orange-50 dark:bg-slate-800 text-orange-600 dark:text-orange-400" aria-hidden="true">
                <Sun className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs text-slate-400">UV Index</p>
                <p className="text-base font-bold font-mono text-slate-800 dark:text-slate-100">{weather.current.uvIndex}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-purple-50 dark:bg-slate-800 text-purple-600 dark:text-purple-400" aria-hidden="true">
                <Compass className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs text-slate-400">Pressure</p>
                <p className="text-base font-bold font-mono text-slate-800 dark:text-slate-100">{Math.round(weather.current.pressure)} hPa</p>
              </div>
            </div>
          </div>
        </motion.section>

        {/* Right 7 Columns: Gemini Weather Intelligence Advisor */}
        <motion.section 
          variants={itemVariants}
          className="lg:col-span-7 p-6 rounded-2xl bg-slate-50 dark:bg-slate-900/30 border border-slate-200 dark:border-slate-800/80 shadow-inner flex flex-col justify-between"
          aria-labelledby="ai-advisor-title"
        >
          <div>
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3 mb-4">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-sky-600 dark:text-sky-400" />
                <h2 id="ai-advisor-title" className="text-lg font-display font-bold text-slate-900 dark:text-white">
                  Weather Intelligence AI Advisor
                </h2>
              </div>
              <button
                onClick={onRefreshInsight}
                disabled={loadingInsight}
                className="text-xs text-sky-600 dark:text-sky-400 hover:underline font-medium flex items-center gap-1 cursor-pointer disabled:opacity-50"
                aria-label="Refresh artificial intelligence summary and health guidelines"
              >
                <Sparkles className={`w-3.5 h-3.5 ${loadingInsight ? "animate-spin" : ""}`} />
                {loadingInsight ? "Analyzing..." : "Regenerate insights"}
              </button>
            </div>

            {loadingInsight ? (
              <div className="py-12 flex flex-col items-center justify-center text-center">
                <div className="relative flex items-center justify-center mb-4">
                  <div className="animate-ping absolute inline-flex h-8 w-8 rounded-full bg-sky-400 opacity-20"></div>
                  <Sparkles className="w-8 h-8 text-sky-500 animate-pulse" />
                </div>
                <p className="text-sm font-medium text-slate-600 dark:text-slate-300">AI Weather Engine analyzing current telemetry...</p>
                <p className="text-xs text-slate-400 mt-1 max-w-xs">Synthesizing clothing suggestions, outdoor metrics, and medical allergy guidelines.</p>
              </div>
            ) : aiInsight ? (
              <div className="space-y-4 text-slate-700 dark:text-slate-300">
                {/* 1. Summary Block */}
                <div>
                  <h3 className="sr-only">AI Synthesis Summary</h3>
                  <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-300 border-l-4 border-sky-500 pl-3">
                    {aiInsight.summary}
                  </p>
                </div>

                {/* 2. Critical Alert/Hazard Indicator if active */}
                {aiInsight.hazardChecklist && aiInsight.hazardChecklist.level !== "none" && (
                  <div className={`p-3 rounded-xl flex items-start gap-2.5 ${getSeverityBadgeClass(aiInsight.hazardChecklist.level)}`}>
                    <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5" />
                    <div>
                      <p className="text-xs font-bold uppercase tracking-wider">A11y Safety Check Alert ({aiInsight.hazardChecklist.level})</p>
                      <p className="text-xs font-medium mt-0.5">{aiInsight.hazardChecklist.message}</p>
                      {aiInsight.hazardChecklist.precautions?.length > 0 && (
                        <ul className="text-xs list-disc list-inside mt-1.5 space-y-0.5">
                          {aiInsight.hazardChecklist.precautions.map((p: string, idx: number) => (
                            <li key={idx}>{p}</li>
                          ))}
                        </ul>
                      )}
                    </div>
                  </div>
                )}

                {/* 3. Outdoor activity rating widget & Attire suggestions */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                  <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-3 rounded-xl shadow-sm">
                    <p className="text-xs text-slate-400 font-medium">Outdoor Comfort Score</p>
                    <div className="flex items-center gap-2.5 mt-1.5">
                      <span className="text-2xl font-mono font-bold text-slate-900 dark:text-white">{aiInsight.outdoorRating}</span>
                      <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                        <div 
                          className={`h-full rounded-full transition-all duration-500 ${getRatingColorClass(aiInsight.outdoorRating)}`} 
                          style={{ width: `${aiInsight.outdoorRating * 10}%` }}
                        />
                      </div>
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">{aiInsight.outdoorDetails}</p>
                  </div>

                  <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-3 rounded-xl shadow-sm">
                    <p className="text-xs text-slate-400 font-medium">Personal Wear Advisor</p>
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      {aiInsight.clothing?.map((item: string, i: number) => (
                        <span 
                          key={i} 
                          className="bg-sky-50 dark:bg-slate-800 text-sky-800 dark:text-sky-300 text-[10px] px-2 py-0.5 rounded-md font-medium border border-sky-100 dark:border-slate-700 hover:scale-105 transition-all-short cursor-default"
                        >
                          {item}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* 4. Health Guidelines */}
                <div className="border-t border-slate-200 dark:border-slate-800 pt-3">
                  <h4 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Health & Preventive Tips</h4>
                  <ul className="mt-2 space-y-1">
                    {aiInsight.healthTips?.map((tip: string, i: number) => (
                      <li key={i} className="text-xs text-slate-600 dark:text-slate-300 flex items-start gap-1.5">
                        <span className="text-sky-500 mt-0.5" aria-hidden="true">•</span>
                        <span>{tip}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ) : (
              <div className="py-8 text-center text-slate-400 text-sm">
                <Sparkles className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                <button 
                  onClick={onRefreshInsight} 
                  className="text-sky-600 dark:text-sky-400 font-medium hover:underline text-xs"
                >
                  Retrieve custom Gemini intelligence advice
                </button>
              </div>
            )}
          </div>
          
          <div className="bg-slate-100 dark:bg-slate-800/30 p-2.5 rounded-xl text-[11px] text-slate-500 dark:text-slate-400 border border-slate-200/50 dark:border-slate-800 mt-4 flex items-start gap-1.5">
            <Info className="w-3.5 h-3.5 shrink-0 text-slate-400 mt-0.5" />
            <span>AI insights automatically synchronize across all registered user tokens using server-side secure credentials.</span>
          </div>
        </motion.section>
      </div>

      {/* Customizable Hourly Forecast Section */}
      <motion.section 
        variants={itemVariants}
        className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm"
        aria-labelledby="hourly-forecast-widget"
      >
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-4 mb-5">
          <div>
            <h2 id="hourly-forecast-widget" className="text-lg font-display font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Clock className="w-5 h-5 text-sky-600 dark:text-sky-400" />
              Customizable Hourly Widget ({widgets.hourlyHoursCount}h Outlook)
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">Customize metrics, display styles and hours limits via the Widgets settings tab.</p>
          </div>
          <div className="flex items-center gap-2 self-start sm:self-center">
            <span className="text-xs text-slate-400 uppercase tracking-widest font-mono border border-slate-200 dark:border-slate-800 px-2 py-1 rounded">
              Layout: {widgets.layout}
            </span>
          </div>
        </div>

        {/* Dynamic widget views based on user widget config */}
        {widgets.layout === "grid" && (
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-4">
            {hourlyToShow.map((hour, idx) => (
              <div 
                key={idx} 
                className="p-4 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/25 flex flex-col items-center justify-between text-center transition-all-short hover:border-sky-300 dark:hover:border-sky-900"
                tabIndex={0}
                aria-label={`Hourly forecast for ${new Date(hour.time).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}: ${hour.temp}°C, feels like ${hour.apparentTemp}°C, ${hour.weatherDesc}`}
              >
                <p className="text-xs text-slate-500 font-mono">
                  {new Date(hour.time).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                </p>
                <div className="text-3xl my-2" aria-hidden="true">
                  {getWeatherEmoji(hour.weatherCode)}
                </div>
                
                {/* Custom metrics checks */}
                <div className="space-y-1.5 w-full">
                  {widgets.visibleMetrics.includes("temp") && (
                    <p className="text-base font-bold font-mono text-slate-900 dark:text-white">
                      {Math.round(hour.temp)}°C
                    </p>
                  )}
                  {widgets.visibleMetrics.includes("apparentTemp") && (
                    <p className="text-[11px] text-slate-400">
                      App: <span className="font-mono">{Math.round(hour.apparentTemp)}°C</span>
                    </p>
                  )}
                  {widgets.visibleMetrics.includes("humidity") && (
                    <p className="text-[10px] text-sky-600 dark:text-sky-400 font-mono">
                      💧{hour.humidity}%
                    </p>
                  )}
                  {widgets.visibleMetrics.includes("precipitationProb") && (
                    <p className="text-[10px] text-blue-600 dark:text-blue-400 font-mono">
                      ☔{hour.precipitationProb}%
                    </p>
                  )}
                  {widgets.visibleMetrics.includes("windSpeed") && (
                    <p className="text-[10px] text-slate-400 font-mono">
                      💨{hour.windSpeed}km/h
                    </p>
                  )}
                  {widgets.visibleMetrics.includes("uvIndex") && (
                    <p className="text-[10px] text-amber-600 font-mono">
                      ☀️UV {hour.uvIndex}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {widgets.layout === "list" && (
          <div className="space-y-2 max-h-96 overflow-y-auto pr-1">
            {hourlyToShow.map((hour, idx) => (
              <div 
                key={idx} 
                className="p-3.5 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/40 dark:bg-slate-800/10 flex items-center justify-between gap-4 transition-all-short hover:bg-slate-50 dark:hover:bg-slate-800/30"
                tabIndex={0}
                aria-label={`Forecast at ${new Date(hour.time).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}: ${hour.temp} degrees Celcius.`}
              >
                <div className="flex items-center gap-3">
                  <span className="text-sm font-bold font-mono text-slate-600 dark:text-slate-400 w-16">
                    {new Date(hour.time).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                  </span>
                  <div className="text-2xl" aria-hidden="true">{getWeatherEmoji(hour.weatherCode)}</div>
                  <span className="text-sm text-slate-700 dark:text-slate-300 font-medium hidden sm:inline">
                    {hour.weatherDesc}
                  </span>
                </div>

                <div className="flex items-center gap-4 sm:gap-6">
                  {widgets.visibleMetrics.includes("temp") && (
                    <span className="text-sm font-bold font-mono text-slate-900 dark:text-white">
                      {Math.round(hour.temp)}°C
                    </span>
                  )}
                  {widgets.visibleMetrics.includes("apparentTemp") && (
                    <span className="text-xs text-slate-400 hidden md:inline">
                      Feels: <span className="font-mono text-slate-700 dark:text-slate-300">{Math.round(hour.apparentTemp)}°C</span>
                    </span>
                  )}
                  {widgets.visibleMetrics.includes("precipitationProb") && (
                    <span className="text-xs text-blue-600 dark:text-blue-400 font-mono flex items-center gap-0.5">
                      ☔ {hour.precipitationProb}%
                    </span>
                  )}
                  {widgets.visibleMetrics.includes("humidity") && (
                    <span className="text-xs text-sky-600 dark:text-sky-400 font-mono hidden sm:inline">
                      💧 {hour.humidity}%
                    </span>
                  )}
                  {widgets.visibleMetrics.includes("windSpeed") && (
                    <span className="text-xs text-slate-400 font-mono hidden md:inline">
                      💨 {hour.windSpeed} km/h
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {widgets.layout === "compact" && (
          <div className="flex flex-wrap gap-2">
            {hourlyToShow.map((hour, idx) => (
              <span 
                key={idx} 
                className="bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700/80 rounded-lg px-3 py-2 text-xs font-mono text-slate-700 dark:text-slate-300 flex items-center gap-2 hover:border-sky-300 dark:hover:border-sky-800"
                tabIndex={0}
                aria-label={`Forecast at ${new Date(hour.time).toLocaleTimeString([], {hour: '2-digit'})} is ${Math.round(hour.temp)} degrees`}
              >
                <span className="font-bold text-slate-400">
                  {new Date(hour.time).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                </span>
                <span aria-hidden="true">{getWeatherEmoji(hour.weatherCode)}</span>
                <span className="font-bold text-slate-900 dark:text-white">{Math.round(hour.temp)}°C</span>
              </span>
            ))}
          </div>
        )}
      </motion.section>

      {/* 5-Day Weekly Outlook Display */}
      <motion.section 
        variants={itemVariants}
        className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm"
        aria-labelledby="daily-forecast-title"
      >
        <h2 id="daily-forecast-title" className="text-lg font-display font-bold text-slate-900 dark:text-white flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3 mb-5">
          <Calendar className="w-5 h-5 text-sky-600 dark:text-sky-400" />
          5-Day Meteorological Outlook
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          {weather.daily.map((day, idx) => {
            const isToday = idx === 0;
            const dateObj = new Date(day.date + "T12:00:00"); // avoid offset errors
            const dayLabel = isToday ? "Today" : dateObj.toLocaleDateString([], { weekday: "short" });
            const numericLabel = dateObj.toLocaleDateString([], { month: "short", day: "numeric" });

            return (
              <div 
                key={idx} 
                className={`p-4 rounded-xl border flex flex-col justify-between items-center text-center transition-all-short ${
                  isToday 
                    ? "bg-sky-50/40 border-sky-200 dark:bg-slate-800/40 dark:border-sky-900/60 shadow-sm" 
                    : "bg-slate-50/20 border-slate-100 dark:border-slate-800/50 hover:border-slate-200 dark:hover:border-slate-700"
                }`}
                tabIndex={0}
                aria-label={`${dayLabel} ${numericLabel}: Max ${day.tempMax}°C, Min ${day.tempMin}°C. Conditions are ${day.weatherDesc}. Rain probability is ${day.precipitationProb}%`}
              >
                <div>
                  <p className={`text-sm font-bold ${isToday ? "text-sky-600 dark:text-sky-400" : "text-slate-800 dark:text-slate-200"}`}>
                    {dayLabel}
                  </p>
                  <p className="text-[11px] text-slate-400 font-mono mt-0.5">{numericLabel}</p>
                </div>

                <div className="text-4xl my-3.5" aria-hidden="true">
                  {getWeatherEmoji(day.weatherCode)}
                </div>

                <div className="w-full">
                  <p className="text-xs text-slate-500 dark:text-slate-400 truncate mb-2 font-medium">
                    {day.weatherDesc}
                  </p>
                  
                  {/* Temperature slider/min-max display */}
                  <div className="flex items-center justify-center gap-2.5 bg-slate-100/60 dark:bg-slate-800/50 py-1.5 px-2 rounded-lg font-mono text-xs">
                    <span className="text-slate-400" title="Minimum temperature">{Math.round(day.tempMin)}°</span>
                    <div className="h-1.5 w-8 bg-slate-200 dark:bg-slate-700 rounded-full relative" aria-hidden="true">
                      <div className="absolute top-0 bottom-0 left-1/4 right-1/4 bg-sky-400 rounded-full" />
                    </div>
                    <span className="font-bold text-slate-900 dark:text-white" title="Maximum temperature">{Math.round(day.tempMax)}°</span>
                  </div>

                  <div className="text-[10px] text-blue-600 dark:text-blue-400 font-mono mt-2 flex items-center justify-center gap-1">
                    <span>☔ {day.precipitationProb}%</span>
                    <span className="text-slate-300 dark:text-slate-700 font-normal">|</span>
                    <span>UV {Math.round(day.uvIndexMax)}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </motion.section>
    </motion.div>
  );
}
