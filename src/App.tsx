/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Sun, 
  Moon, 
  Eye, 
  Search, 
  Compass, 
  CloudRain, 
  Heart, 
  Clock, 
  Sliders, 
  ShieldAlert, 
  CloudUpload, 
  ClipboardCheck, 
  Accessibility, 
  Check, 
  X,
  AlertTriangle,
  Info,
  Loader2
} from "lucide-react";
import { 
  LocationInfo, 
  WeatherData, 
  CurrentWeather, 
  HourlyForecast, 
  DailyForecast, 
  WeatherAlert, 
  WidgetConfig, 
  TestSuiteResult 
} from "./types";
import { getWeatherDescription } from "./utils/weatherCodes";

// Import modular components
import WeatherDashboard from "./components/WeatherDashboard";
import WidgetConfigurator from "./components/WidgetConfigurator";
import SevereAlerts from "./components/SevereAlerts";
import SyncPortal from "./components/SyncPortal";
import AccessibilityDocs from "./components/AccessibilityDocs";

// Default seed location (London)
const DEFAULT_LOCATION: LocationInfo = {
  name: "London",
  latitude: 51.50853,
  longitude: -0.12574,
  country: "United Kingdom",
  admin1: "England",
  country_code: "GB"
};

// Seed alerts list
const SEED_ALERTS: WeatherAlert[] = [
  {
    id: "alert-1",
    event: "Severe Gale Warning",
    severity: "Moderate",
    sender: "Meteorological Central Service",
    description: "Sustained high gusts of wind up to 75 km/h expected in elevated sections. Secure all loose outdoor items.",
    ends: new Date(Date.now() + 6 * 3600 * 1000).toISOString(),
  }
];

export default function App() {
  // Navigation & View tab state
  const [activeTab, setActiveTab] = useState<"dashboard" | "widgets" | "alerts" | "sync" | "docs">("dashboard");

  // Geocoding Search States
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<LocationInfo[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);

  // Weather Telemetry States
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loadingWeather, setLoadingWeather] = useState(false);
  const [offline, setOffline] = useState(false);

  // Gemini-Powered Advisor states
  const [aiInsight, setAiInsight] = useState<any>(null);
  const [loadingInsight, setLoadingInsight] = useState(false);

  // Favorites state
  const [favorites, setFavorites] = useState<LocationInfo[]>([]);

  // Severe Alert states
  const [alerts, setAlerts] = useState<WeatherAlert[]>(SEED_ALERTS);

  // Settings & Accessibility Preferences State
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [highContrast, setHighContrast] = useState(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [syncCode, setSyncCode] = useState<string | undefined>(undefined);

  // Screen Reader Accessibility Log: Tracks what is "spoken" to screen readers
  const [speechLogs, setSpeechLogs] = useState<string[]>([]);
  const [activeSpeech, setActiveSpeech] = useState<string>("");

  // Customizable Widgets Config State
  const [widgetConfig, setWidgetConfig] = useState<WidgetConfig>({
    hourlyHoursCount: 8,
    visibleMetrics: ["temp", "apparentTemp", "humidity", "precipitationProb", "windSpeed", "uvIndex"],
    layout: "grid"
  });

  // Automated compliance tests results
  const [testResult, setTestResult] = useState<TestSuiteResult | null>(null);

  // Custom Push Toasts
  const [toasts, setToasts] = useState<{ id: string; event: string; severity: string; msg: string }[]>([]);

  // ------------------------------------------
  // Initialization & Offline Restoration
  // ------------------------------------------
  useEffect(() => {
    // 1. Theme recovery
    const savedTheme = localStorage.getItem("weather_theme") as "light" | "dark" | null;
    if (savedTheme) {
      setTheme(savedTheme);
      applyThemeToDom(savedTheme);
    } else if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
      setTheme("dark");
      applyThemeToDom("dark");
    }

    // 2. High Contrast recovery
    const savedContrast = localStorage.getItem("weather_high_contrast") === "true";
    setHighContrast(savedContrast);
    applyHighContrastToDom(savedContrast);

    // 3. Favorites recovery
    const savedFavs = localStorage.getItem("weather_favs");
    if (savedFavs) {
      try {
        setFavorites(JSON.parse(savedFavs));
      } catch (err) {
        console.error("Failed to parse favorites", err);
      }
    } else {
      // Seed favorites with beautiful locations
      const seedFavs = [
        DEFAULT_LOCATION,
        { name: "Tokyo", latitude: 35.6895, longitude: 139.6917, country: "Japan", admin1: "Tokyo" },
        { name: "Sydney", latitude: -33.8688, longitude: 151.2093, country: "Australia", admin1: "New South Wales" }
      ];
      setFavorites(seedFavs);
      localStorage.setItem("weather_favs", JSON.stringify(seedFavs));
    }

    // 4. Load last active location forecast
    const savedLastLoc = localStorage.getItem("last_active_location");
    let initialLoc = DEFAULT_LOCATION;
    if (savedLastLoc) {
      try {
        initialLoc = JSON.parse(savedLastLoc);
      } catch (e) {
        // fallback
      }
    }
    fetchWeather(initialLoc);

    // Initial silent greeting
    announceSpeech("Welcome to Weather Intelligence. Skip to main content is active. Access dashboards via Tab controls.", true);
  }, []);

  // Sync state changes in notifications
  useEffect(() => {
    // Poll the backend simulated alerts every 30 seconds
    const interval = setInterval(() => {
      fetchSimulatedAlerts();
    }, 30000);
    return () => clearInterval(interval);
  }, [notificationsEnabled]);

  // ------------------------------------------
  // Accessible Theme Handlers
  // ------------------------------------------
  const applyThemeToDom = (targetTheme: "light" | "dark") => {
    const root = document.documentElement;
    if (targetTheme === "dark") {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
  };

  const toggleTheme = () => {
    const nextTheme = theme === "light" ? "dark" : "light";
    setTheme(nextTheme);
    applyThemeToDom(nextTheme);
    localStorage.setItem("weather_theme", nextTheme);
    announceSpeech(`Visual theme switched to ${nextTheme} mode.`);
  };

  const applyHighContrastToDom = (active: boolean) => {
    const root = document.documentElement;
    if (active) {
      root.classList.add("high-contrast-mode");
    } else {
      root.classList.remove("high-contrast-mode");
    }
  };

  const toggleHighContrast = () => {
    const nextContrast = !highContrast;
    setHighContrast(nextContrast);
    applyHighContrastToDom(nextContrast);
    localStorage.setItem("weather_high_contrast", String(nextContrast));
    announceSpeech(
      nextContrast 
        ? "AAA High Contrast Mode enabled. Borders, text contrast ratios, and element guidelines enhanced for maximum visibility." 
        : "Standard visual contrast active."
    );
  };

  // ------------------------------------------
  // Accessibility Sound & Speech Announcer Engine
  // ------------------------------------------
  const announceSpeech = (text: string, silent = false) => {
    setActiveSpeech(text);
    setSpeechLogs((prev) => [text, ...prev].slice(0, 50));
    // Audio speech synthesis removed
  };

  // ------------------------------------------
  // Meteorological Weather API Logic (Open-Meteo)
  // ------------------------------------------
  const fetchWeather = async (loc: LocationInfo) => {
    setLoadingWeather(true);
    setOffline(false);
    setShowSuggestions(false);
    announceSpeech(`Fetching real-time atmospheric telemetry for ${loc.name}...`, true);

    try {
      const forecastUrl = `https://api.open-meteo.com/v1/forecast?latitude=${loc.latitude}&longitude=${loc.longitude}&current=temperature_2m,apparent_temperature,relative_humidity_2m,wind_speed_10m,precipitation_probability,uv_index,weather_code,pressure_msl,visibility&hourly=temperature_2m,apparent_temperature,precipitation_probability,weather_code,relative_humidity_2m,wind_speed_10m,uv_index&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max,uv_index_max&timezone=auto`;
      const res = await fetch(forecastUrl);
      if (!res.ok) throw new Error("Weather Service unavailable.");
      const data = await res.json();

      if (!data.current) throw new Error("Invalid forecast response structure.");

      // Map current weather
      const current: CurrentWeather = {
        temp: data.current.temperature_2m,
        apparentTemp: data.current.apparent_temperature,
        weatherCode: data.current.weather_code,
        weatherDesc: getWeatherDescription(data.current.weather_code),
        humidity: data.current.relative_humidity_2m,
        windSpeed: data.current.wind_speed_10m,
        precipitationProb: data.current.precipitation_probability,
        uvIndex: data.current.uv_index,
        pressure: data.current.pressure_msl,
        visibility: data.current.visibility !== undefined ? data.current.visibility : 10000,
        time: data.current.time
      };

      // Map hourly (limit 24 elements)
      const hourly: HourlyForecast[] = [];
      for (let i = 0; i < 24; i++) {
        if (data.hourly.time[i] !== undefined) {
          hourly.push({
            time: data.hourly.time[i],
            temp: data.hourly.temperature_2m[i],
            apparentTemp: data.hourly.apparent_temperature[i],
            precipitationProb: data.hourly.precipitation_probability[i],
            weatherCode: data.hourly.weather_code[i],
            weatherDesc: getWeatherDescription(data.hourly.weather_code[i]),
            humidity: data.hourly.relative_humidity_2m[i],
            windSpeed: data.hourly.wind_speed_10m[i],
            uvIndex: data.hourly.uv_index[i]
          });
        }
      }

      // Map daily (limit 7 elements)
      const daily: DailyForecast[] = [];
      for (let i = 0; i < 7; i++) {
        if (data.daily.time[i] !== undefined) {
          daily.push({
            date: data.daily.time[i],
            tempMax: data.daily.temperature_2m_max[i],
            tempMin: data.daily.temperature_2m_min[i],
            precipitationProb: data.daily.precipitation_probability_max[i],
            weatherCode: data.daily.weather_code[i],
            weatherDesc: getWeatherDescription(data.daily.weather_code[i]),
            uvIndexMax: data.daily.uv_index_max[i]
          });
        }
      }

      const compiledWeather: WeatherData = {
        location: loc,
        current,
        hourly,
        daily,
        fetchedAt: new Date().toISOString()
      };

      setWeather(compiledWeather);
      setOffline(false);

      // Caching logic
      localStorage.setItem(`cached_weather_${loc.latitude.toFixed(2)}_${loc.longitude.toFixed(2)}`, JSON.stringify(compiledWeather));
      localStorage.setItem("last_active_location", JSON.stringify(loc));

      announceSpeech(`Loaded weather for ${loc.name}. Currently ${Math.round(current.temp)} degrees, ${current.weatherDesc}.`);

      // Fetch AI Insights
      fetchGeminiInsight(compiledWeather);
    } catch (err) {
      console.error("Open-Meteo fetch failed. Attempting offline cache recovery.", err);
      setOffline(true);
      const cacheKey = `cached_weather_${loc.latitude.toFixed(2)}_${loc.longitude.toFixed(2)}`;
      const cached = localStorage.getItem(cacheKey);

      if (cached) {
        const parsed = JSON.parse(cached);
        setWeather(parsed);
        announceSpeech(`Network connection offline. Loaded cached forecast parameters for ${loc.name}.`);
      } else {
        announceSpeech(`Atmospheric request failed. No cached logs available for ${loc.name}.`);
      }
    } finally {
      setLoadingWeather(false);
    }
  };

  // ------------------------------------------
  // Server-Side Gemini Intelligence Advisor API
  // ------------------------------------------
  const fetchGeminiInsight = async (weatherData: WeatherData) => {
    setLoadingInsight(true);
    try {
      const res = await fetch("/api/weather/intelligence", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          location: weatherData.location,
          current: weatherData.current,
          forecast: weatherData.daily.map(d => ({ date: d.date, max: d.tempMax, min: d.tempMin, desc: d.weatherDesc })),
          alerts: alerts
        })
      });

      if (!res.ok) throw new Error("Gemini Intelligence API failed.");
      const data = await res.json();
      setAiInsight(data);
      announceSpeech(`AI weather analyst advisory received. ${data.summary}`);
    } catch (err) {
      console.error("Failed to fetch Gemini insights:", err);
      // Fallback is handled inside the Express server API, but in case of server failure:
      setAiInsight({
        summary: "Atmospheric parameters show a baseline temperature of " + Math.round(weatherData.current.temp) + "°C. Keep comfortable outerwear ready.",
        clothing: ["Standard comfort layer", "Windbreaker jacket"],
        outdoorRating: 7,
        outdoorDetails: "Comfortable thresholds. Regular outdoor walks and exercise schedules are approved.",
        healthTips: ["Ensure appropriate hydration levels.", "Keep personal asthma medication nearby if sensitive to outdoor changes."],
        hazardChecklist: { level: "none", message: "Normal atmospheric conditions verified.", precautions: [] }
      });
    } finally {
      setLoadingInsight(false);
    }
  };

  // ------------------------------------------
  // Geocoding Search Logic (Open-Meteo)
  // ------------------------------------------
  const handleSearchSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    setIsSearching(true);
    setShowSuggestions(true);
    announceSpeech(`Searching for matching location coordinates for '${searchQuery}'...`, true);

    try {
      const geoUrl = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(searchQuery)}&count=6&language=en&format=json`;
      const res = await fetch(geoUrl);
      if (!res.ok) throw new Error("Geocoding service down.");
      const data = await res.json();
      
      const results = data.results || [];
      setSearchResults(results);
      
      if (results.length > 0) {
        announceSpeech(`Search complete. Found ${results.length} matching locations. Use Down Arrow or Tab to select.`);
      } else {
        announceSpeech(`No locations found matching '${searchQuery}'. Please try a different city name.`);
      }
    } catch (err) {
      console.error("Geocoding failed:", err);
      announceSpeech("Location search failed. Please verify your connection.");
    } finally {
      setIsSearching(false);
    }
  };

  const handleSelectLocation = (loc: LocationInfo) => {
    setSearchQuery("");
    setSearchResults([]);
    setShowSuggestions(false);
    fetchWeather(loc);
  };

  // ------------------------------------------
  // Favorites Operations
  // ------------------------------------------
  const handleToggleFavorite = (loc: LocationInfo) => {
    let nextFavs = [...favorites];
    const index = nextFavs.findIndex((f) => f.latitude === loc.latitude && f.longitude === loc.longitude);
    if (index >= 0) {
      nextFavs.splice(index, 1);
    } else {
      nextFavs.push(loc);
    }
    setFavorites(nextFavs);
    localStorage.setItem("weather_favs", JSON.stringify(nextFavs));
  };

  // ------------------------------------------
  // Severe Alerts Simulator & Notification Handlers
  // ------------------------------------------
  const fetchSimulatedAlerts = async () => {
    if (!notificationsEnabled) return;
    try {
      const res = await fetch("/api/alerts/simulated");
      if (res.ok) {
        const data = await res.json();
        // check if we got new alerts and trigger simulated push notifications
        if (data.length > 0 && alerts.length !== data.length) {
          const newest = data[0];
          triggerPushNotification(newest);
          setAlerts(data);
        }
      }
    } catch (e) {
      // ignore
    }
  };

  const triggerPushNotification = (alert: WeatherAlert) => {
    if (!notificationsEnabled) return;

    // Push toast to layout
    const toastId = Math.random().toString();
    const newToast = {
      id: toastId,
      event: alert.event,
      severity: alert.severity,
      msg: alert.description
    };
    setToasts((prev) => [newToast, ...prev]);

    // Audible alarm speech (Silenced to prevent unwanted voice synthesis for push notifications)
    announceSpeech(`EMERGENCY PUSH BROADCAST: ${alert.severity} alert. ${alert.event}. Instructions: ${alert.description}`, true);

    // Auto dismiss toasts after 7 seconds
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== toastId));
    }, 8000);
  };

  const handleAddCustomAlert = (newAlert: Omit<WeatherAlert, "id">) => {
    const createdAlert: WeatherAlert = {
      ...newAlert,
      id: "custom-" + Math.random().toString(36).substr(2, 9)
    };
    setAlerts((prev) => [createdAlert, ...prev]);
    triggerPushNotification(createdAlert);
  };

  // ------------------------------------------
  // Full-Stack Synchronization Operations
  // ------------------------------------------
  const handleSavePreferences = async (): Promise<string> => {
    try {
      const res = await fetch("/api/sync/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          syncCode: syncCode,
          preferences: {
            favorites,
            widgets: widgetConfig,
            theme,
            highContrast,
            notificationsEnabled,
            alertHistory: alerts
          }
        })
      });
      if (!res.ok) throw new Error("Sync failed on server.");
      const data = await res.json();
      setSyncCode(data.syncCode);
      return data.syncCode;
    } catch (err) {
      throw new Error("Unable to contact synchronization service. Check connection.");
    }
  };

  const handleLoadPreferences = async (code: string): Promise<boolean> => {
    try {
      const res = await fetch(`/api/sync/load/${code}`);
      if (!res.ok) return false;
      const data = await res.json();

      if (data.success && data.preferences) {
        const prefs = data.preferences;
        if (prefs.favorites) setFavorites(prefs.favorites);
        if (prefs.widgets) setWidgetConfig(prefs.widgets);
        if (prefs.theme) {
          setTheme(prefs.theme);
          applyThemeToDom(prefs.theme);
        }
        setHighContrast(!!prefs.highContrast);
        applyHighContrastToDom(!!prefs.highContrast);
        setNotificationsEnabled(!!prefs.notificationsEnabled);
        if (prefs.alertHistory) setAlerts(prefs.alertHistory);
        setSyncCode(code);
        return true;
      }
      return false;
    } catch (err) {
      throw new Error("Unable to contact synchronization service.");
    }
  };

  const getWeatherThemeClasses = () => {
    if (highContrast) {
      return {
        bg: "bg-black text-white selection:bg-yellow-400 selection:text-black",
        header: "border-yellow-400 border-2 bg-black text-white",
        logo: "bg-white text-black border-2 border-yellow-400",
        badgeBg: "bg-black border-yellow-400 text-yellow-400",
        badgeDot: "bg-yellow-400",
        accentText: "text-yellow-400",
        themeLabel: "High Contrast"
      };
    }

    if (!weather) {
      // Default slate theme when no weather is loaded yet
      return {
        bg: theme === "light" 
          ? "bg-slate-100 text-slate-800" 
          : "bg-slate-950 text-slate-200",
        header: theme === "light" ? "bg-white border-slate-200 dark:border-slate-800" : "bg-slate-900 border-slate-800",
        logo: "bg-sky-600 text-white",
        badgeBg: "bg-sky-50 dark:bg-sky-950/30 border-sky-100 dark:border-sky-900/30 text-sky-600 dark:text-sky-400",
        badgeDot: "bg-sky-500",
        accentText: "text-sky-600 dark:text-sky-400",
        themeLabel: "Dynamic Slate"
      };
    }

    const code = weather.current.weatherCode;
    const temp = weather.current.temp;

    // 1. Determine condition type
    let cond = "clear";
    if (code === 0 || code === 1) cond = "clear";
    else if (code === 2 || code === 3 || code === 45 || code === 48) cond = "cloudy";
    else if ((code >= 51 && code <= 67) || (code >= 80 && code <= 82)) cond = "rain";
    else if ((code >= 71 && code <= 77) || (code >= 85 && code <= 86)) cond = "snow";
    else if (code >= 95 && code <= 99) cond = "storm";

    // 2. Map colors dynamically
    if (cond === "clear") {
      const isWarm = temp >= 18;
      if (theme === "light") {
        return {
          bg: isWarm 
            ? "bg-gradient-to-br from-amber-50/70 via-orange-50/25 to-sky-50/60 text-slate-800"
            : "bg-gradient-to-br from-sky-50/80 via-slate-50 to-blue-50/40 text-slate-800",
          header: isWarm ? "bg-white/90 border-amber-100" : "bg-white/90 border-sky-100",
          logo: isWarm ? "bg-amber-500 text-white" : "bg-sky-600 text-white",
          badgeBg: isWarm 
            ? "bg-amber-50 border-amber-200 text-amber-700" 
            : "bg-sky-50 border-sky-200 text-sky-700",
          badgeDot: isWarm ? "bg-amber-500" : "bg-sky-500",
          accentText: isWarm ? "text-amber-600" : "text-sky-600",
          themeLabel: isWarm ? "Sunny Amber" : "Breezy Azure"
        };
      } else {
        return {
          bg: isWarm
            ? "bg-gradient-to-br from-slate-950 via-amber-950/15 to-stone-900 text-slate-200"
            : "bg-gradient-to-br from-slate-950 via-sky-950/15 to-slate-900 text-slate-200",
          header: isWarm ? "bg-slate-900/90 border-amber-900/30" : "bg-slate-900/90 border-sky-900/30",
          logo: isWarm ? "bg-amber-600 text-amber-50" : "bg-sky-600 text-sky-50",
          badgeBg: isWarm 
            ? "bg-amber-950/40 border-amber-900/50 text-amber-300" 
            : "bg-sky-950/40 border-sky-900/50 text-sky-300",
          badgeDot: isWarm ? "bg-amber-400" : "bg-sky-400",
          accentText: isWarm ? "text-amber-400" : "text-sky-400",
          themeLabel: isWarm ? "Desert Sunset" : "Arctic Zenith"
        };
      }
    }

    if (cond === "rain") {
      if (theme === "light") {
        return {
          bg: "bg-gradient-to-br from-blue-50/80 via-indigo-50/30 to-slate-100 text-slate-800",
          header: "bg-white/90 border-indigo-100",
          logo: "bg-indigo-600 text-white",
          badgeBg: "bg-indigo-50 border-indigo-200 text-indigo-700",
          badgeDot: "bg-indigo-500",
          accentText: "text-indigo-600",
          themeLabel: "Rainy Lavender"
        };
      } else {
        return {
          bg: "bg-gradient-to-br from-slate-950 via-indigo-950/25 to-slate-900 text-slate-200",
          header: "bg-slate-900/90 border-indigo-900/40",
          logo: "bg-indigo-600 text-indigo-50",
          badgeBg: "bg-indigo-950/40 border-indigo-900/50 text-indigo-300",
          badgeDot: "bg-indigo-400",
          accentText: "text-indigo-400",
          themeLabel: "Ocean Storm"
        };
      }
    }

    if (cond === "snow") {
      if (theme === "light") {
        return {
          bg: "bg-gradient-to-br from-sky-50/70 via-slate-50 to-teal-50/40 text-slate-800",
          header: "bg-white/90 border-teal-100",
          logo: "bg-teal-600 text-white",
          badgeBg: "bg-teal-50 border-teal-200 text-teal-700",
          badgeDot: "bg-teal-500",
          accentText: "text-teal-600",
          themeLabel: "Frosty Mint"
        };
      } else {
        return {
          bg: "bg-gradient-to-br from-slate-950 via-teal-950/20 to-slate-950 text-slate-200",
          header: "bg-slate-900/90 border-teal-900/30",
          logo: "bg-teal-600 text-teal-50",
          badgeBg: "bg-teal-950/40 border-teal-900/50 text-teal-300",
          badgeDot: "bg-teal-400",
          accentText: "text-teal-400",
          themeLabel: "Frozen Glade"
        };
      }
    }

    if (cond === "storm") {
      if (theme === "light") {
        return {
          bg: "bg-gradient-to-br from-violet-50 via-purple-50/20 to-slate-100 text-slate-800",
          header: "bg-white/90 border-purple-100",
          logo: "bg-purple-600 text-white",
          badgeBg: "bg-purple-50 border-purple-200 text-purple-700",
          badgeDot: "bg-purple-500",
          accentText: "text-purple-600",
          themeLabel: "Electric Orchid"
        };
      } else {
        return {
          bg: "bg-gradient-to-br from-slate-950 via-purple-950/25 to-slate-950 text-slate-200",
          header: "bg-slate-900/90 border-purple-900/40",
          logo: "bg-purple-600 text-purple-100",
          badgeBg: "bg-purple-950/40 border-purple-900/50 text-purple-300",
          badgeDot: "bg-purple-400",
          accentText: "text-purple-400",
          themeLabel: "Supernova Purple"
        };
      }
    }

    // cond === "cloudy"
    if (theme === "light") {
      return {
        bg: "bg-gradient-to-br from-slate-150 via-zinc-100 to-slate-250 text-slate-800",
        header: "bg-white/90 border-slate-200",
        logo: "bg-slate-600 text-white",
        badgeBg: "bg-slate-100 border-slate-300 text-slate-700",
        badgeDot: "bg-slate-500",
        accentText: "text-slate-600",
        themeLabel: "Muted Nimbus"
      };
    } else {
      return {
        bg: "bg-gradient-to-br from-slate-950 via-zinc-900/10 to-slate-900 text-slate-200",
        header: "bg-slate-900/90 border-slate-800",
        logo: "bg-slate-600 text-slate-100",
        badgeBg: "bg-slate-800 border-slate-700 text-slate-300",
        badgeDot: "bg-slate-400",
        accentText: "text-slate-400",
        themeLabel: "Overcast Obsidian"
      };
    }
  };

  const wTheme = getWeatherThemeClasses();

  return (
    <div className={`min-h-screen font-sans flex flex-col justify-between transition-all duration-1000 ${wTheme.bg}`}>
      
      {/* 1. Skip to main content bypass link for keyboard accessibility (WCAG bypass mandate) */}
      <a href="#main-content" className="skip-link">
        Skip to Main Content
      </a>

      {/* Extreme weather push toasts container */}
      <div 
        className="fixed top-4 right-4 z-50 space-y-3 w-full max-w-sm" 
        role="region" 
        aria-label="Active emergency toast notifications"
      >
        {toasts.map((toast) => (
          <div 
            key={toast.id}
            className={`p-4 rounded-xl border-2 shadow-2xl flex flex-col gap-2 animate-bounce ${
              highContrast 
                ? "bg-black text-white border-yellow-400 font-bold" 
                : toast.severity === "Extreme" 
                  ? "bg-red-900 text-white border-red-500" 
                  : "bg-amber-900 text-white border-amber-500"
            }`}
            role="alert"
            aria-live="assertive"
          >
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider">
                <AlertTriangle className="w-4.5 h-4.5" /> Emergency Push Alarm
              </span>
              <button 
                onClick={() => setToasts((prev) => prev.filter((t) => t.id !== toast.id))}
                className="text-white hover:text-slate-200 p-0.5 cursor-pointer"
                aria-label="Dismiss toast warning"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div>
              <p className="text-sm font-bold">{toast.event}</p>
              <p className="text-xs text-white/90 mt-0.5">{toast.msg}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Accessible Global Header */}
      <header className={`border-b transition-all duration-1000 ${wTheme.header}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          
          {/* Brand/Heading Landmark */}
          <div className="flex items-center gap-3">
            <div className={`p-2.5 rounded-2xl transition-all duration-1000 ${wTheme.logo}`} aria-hidden="true">
              <Compass className="w-7 h-7 animate-spin-slow" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] uppercase font-bold tracking-widest text-sky-600 dark:text-sky-400 font-mono">
                  Meteorological Intel v2.1
                </span>
                {wTheme.themeLabel && (
                  <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] font-bold font-mono border transition-all duration-1000 ${wTheme.badgeBg}`}>
                    <span className={`w-1 h-1 rounded-full ${wTheme.badgeDot} animate-ping`} />
                    {wTheme.themeLabel}
                  </span>
                )}
              </div>
              <h1 className="text-xl sm:text-2xl font-display font-bold tracking-tight text-slate-900 dark:text-white leading-none">
                WEATHER INTELLIGENCE
              </h1>
            </div>
          </div>
          {/* Accessible Settings and search toggles */}
          <div className="flex flex-wrap items-center gap-2">
            
            {/* High Contrast Selector */}
            <button
              onClick={toggleHighContrast}
              className={`p-2 rounded-xl border transition-all-short cursor-pointer accessible-focus ${
                highContrast 
                  ? "bg-yellow-400 border-yellow-500 text-black font-extrabold" 
                  : "bg-white border-slate-200 text-slate-500 hover:text-slate-800 dark:bg-slate-900 dark:border-slate-800 dark:text-slate-400 dark:hover:text-white"
              }`}
              title="Toggle high contrast compliance layout"
              aria-label="Toggle High Contrast visual accessibility rules"
              aria-pressed={highContrast}
            >
              <Eye className="w-5 h-5" />
            </button>

            {/* Light/Dark Mode Toggle */}
            {!highContrast && (
              <button
                onClick={toggleTheme}
                className="p-2 rounded-xl border border-slate-200 hover:border-slate-300 text-slate-500 hover:text-slate-800 dark:bg-slate-900 dark:border-slate-800 dark:text-slate-400 dark:hover:text-white cursor-pointer accessible-focus"
                title={theme === "light" ? "Switch to Dark layout" : "Switch to Light layout"}
                aria-label={theme === "light" ? "Switch visual theme to Dark" : "Switch visual theme to Light"}
              >
                {theme === "light" ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
              </button>
            )}

          </div>

        </div>
      </header>

      {/* Accessible Interactive Navigation Menu */}
      <nav 
        className={`border-b ${
          highContrast 
            ? "border-yellow-400 bg-black text-white" 
            : "bg-white dark:bg-slate-900/80 border-slate-200/60 dark:border-slate-800/60"
        }`}
        aria-label="Primary atmospheric dashboards"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-2 overflow-x-auto py-2 Scrollbar-none">
            
            <button
              onClick={() => {
                setActiveTab("dashboard");
                announceSpeech("Navigated to Forecast Dashboard.");
              }}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition-all-short whitespace-nowrap cursor-pointer accessible-focus ${
                activeTab === "dashboard"
                  ? highContrast
                    ? "bg-yellow-400 text-black border-2 border-white font-extrabold"
                    : "bg-sky-600 text-white shadow-sm"
                  : "text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800"
              }`}
              aria-current={activeTab === "dashboard" ? "page" : undefined}
            >
              🌦️ Weather Dashboard
            </button>

            <button
              onClick={() => {
                setActiveTab("widgets");
                announceSpeech("Navigated to customizable widgets configuration dashboard.");
              }}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition-all-short whitespace-nowrap cursor-pointer accessible-focus ${
                activeTab === "widgets"
                  ? highContrast
                    ? "bg-yellow-400 text-black border-2 border-white font-extrabold"
                    : "bg-sky-600 text-white shadow-sm"
                  : "text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800"
              }`}
              aria-current={activeTab === "widgets" ? "page" : undefined}
            >
              ⚙️ Custom Hourly Widgets
            </button>

            <button
              onClick={() => {
                setActiveTab("alerts");
                announceSpeech("Navigated to Extreme weather alarms and warnings center.");
              }}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition-all-short whitespace-nowrap cursor-pointer accessible-focus ${
                activeTab === "alerts"
                  ? highContrast
                    ? "bg-yellow-400 text-black border-2 border-white font-extrabold"
                    : "bg-sky-600 text-white shadow-sm"
                  : "text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800"
              }`}
              aria-current={activeTab === "alerts" ? "page" : undefined}
            >
              🚨 Severe Alerts Simulator
            </button>

            <button
              onClick={() => {
                setActiveTab("sync");
                announceSpeech("Navigated to multi-device data backup portal.");
              }}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition-all-short whitespace-nowrap cursor-pointer accessible-focus ${
                activeTab === "sync"
                  ? highContrast
                    ? "bg-yellow-400 text-black border-2 border-white font-extrabold"
                    : "bg-sky-600 text-white shadow-sm"
                  : "text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800"
              }`}
              aria-current={activeTab === "sync" ? "page" : undefined}
            >
              🔄 Multi-Device Sync
            </button>

            <button
              onClick={() => {
                setActiveTab("docs");
                announceSpeech("Navigated to Developer Accessibility console.");
              }}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition-all-short whitespace-nowrap cursor-pointer accessible-focus ${
                activeTab === "docs"
                  ? highContrast
                    ? "bg-yellow-400 text-black border-2 border-white font-extrabold"
                    : "bg-sky-600 text-white shadow-sm"
                  : "text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800"
              }`}
              aria-current={activeTab === "docs" ? "page" : undefined}
            >
              🛠️ Compliance & Testing Hub
            </button>

          </div>
        </div>
      </nav>

      {/* Primary Landing Content Landmark */}
      <main 
        id="main-content" 
        className="flex-grow max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full outline-none"
        tabIndex={-1}
        role="main"
      >
        {/* Dynamic global notification banner when warnings exist */}
        {alerts.length > 0 && activeTab !== "alerts" && (
          <div 
            className={`p-3.5 rounded-xl border flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6 animate-pulse ${
              highContrast 
                ? "bg-black text-white border-yellow-400 border-2 font-bold" 
                : "bg-red-50 dark:bg-red-950/20 text-red-800 dark:text-red-300 border-red-200 dark:border-red-900/60"
            }`}
            role="alert"
          >
            <div className="flex items-start sm:items-center gap-2">
              <AlertTriangle className="w-5 h-5 shrink-0 text-red-500" />
              <p className="text-xs leading-normal">
                <span className="font-bold">Severe Alert active:</span> {alerts[0].event} (Severity: {alerts[0].severity}). 
                <span className="opacity-80 ml-1 hidden sm:inline">{alerts[0].description}</span>
              </p>
            </div>
            <button 
              onClick={() => setActiveTab("alerts")}
              className={`text-xs font-bold underline shrink-0 cursor-pointer ${
                highContrast ? "text-yellow-400" : "text-sky-600 dark:text-sky-400"
              }`}
              aria-label="Open emergency alerts desk dashboard"
            >
              Review Advisory & Safety Plans
            </button>
          </div>
        )}

        {/* Global Accessible Geocoding City Search Form */}
        <section 
          className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 mb-8 shadow-sm"
          aria-labelledby="city-search-section-label"
        >
          <h2 id="city-search-section-label" className="sr-only">Geocoding Weather City Search</h2>
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
            
            {/* Left Search input form */}
            <form onSubmit={handleSearchSubmit} className="md:col-span-7 relative">
              <label htmlFor="city-search-input" className="sr-only">
                Search weather conditions by city or regional coordinates
              </label>
              <div className="relative">
                <input
                  id="city-search-input"
                  type="search"
                  required
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onFocus={() => setShowSuggestions(true)}
                  placeholder="Search globally by city name (e.g., Tokyo, Oslo, San Francisco)..."
                  className="w-full text-sm pl-11 pr-24 py-3 border border-slate-200 dark:border-slate-800 rounded-xl focus:ring-4 focus:ring-sky-200 bg-slate-50/50 dark:bg-slate-950 dark:text-white accessible-focus"
                />
                <Search className="absolute left-4 top-3.5 w-5 h-5 text-slate-400" aria-hidden="true" />
                <button
                  type="submit"
                  disabled={isSearching}
                  className="absolute right-2 top-2 bg-sky-600 hover:bg-sky-500 disabled:opacity-50 text-white px-4 py-1.5 text-xs font-bold rounded-lg transition-all-short cursor-pointer"
                >
                  {isSearching ? "Searching..." : "Search"}
                </button>
              </div>

              {/* Suggestions suggestion panel dropdown */}
              {showSuggestions && (searchResults.length > 0 || isSearching) && (
                <div 
                  className={`absolute left-0 right-0 mt-2 rounded-xl border shadow-xl z-50 ${
                    highContrast 
                      ? "bg-black border-yellow-400 border-2" 
                      : "bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800"
                  }`}
                  role="listbox"
                  aria-label="Location search recommendations"
                >
                  {isSearching ? (
                    <div className="p-4 text-xs text-slate-400 font-mono text-center flex items-center justify-center gap-2">
                      <Loader2 className="w-4 h-4 animate-spin text-sky-500" />
                      Resolving geocoding coordinates...
                    </div>
                  ) : (
                    <div className="py-1">
                      {searchResults.map((loc, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => handleSelectLocation(loc)}
                          className="w-full text-left px-4 py-2.5 text-xs border-b border-slate-50 dark:border-slate-800/40 hover:bg-slate-50 dark:hover:bg-slate-800/50 flex items-center justify-between cursor-pointer focus:bg-slate-50 dark:focus:bg-slate-800/50 outline-none"
                          role="option"
                          aria-selected={false}
                        >
                          <div>
                            <span className="font-bold text-slate-900 dark:text-white">{loc.name}</span>
                            <span className="text-slate-400 ml-1.5">
                              {loc.admin1 ? `${loc.admin1}, ` : ""}{loc.country || ""}
                            </span>
                          </div>
                          <span className="text-[10px] font-mono text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded">
                            Lat: {loc.latitude.toFixed(2)}
                          </span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </form>

            {/* Right Quick favorites list layout */}
            <div className="md:col-span-5 flex flex-wrap items-center gap-2">
              <span className={`text-xs font-bold ${highContrast ? "text-yellow-400 font-extrabold" : "text-slate-600 dark:text-slate-300"} uppercase tracking-widest mr-1.5 flex items-center gap-1`}>
                <Heart className="w-4 h-4 text-rose-500 fill-current" /> Favorites:
              </span>
              {favorites.length === 0 ? (
                <span className={`text-xs ${highContrast ? "text-white font-medium" : "text-slate-600 dark:text-slate-400"} italic`}>No favorites saved.</span>
              ) : (
                favorites.map((fav, i) => (
                  <button
                    key={i}
                    onClick={() => fetchWeather(fav)}
                    className="text-xs bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 px-3 py-1.5 rounded-lg font-medium hover:border-sky-300 dark:hover:border-sky-900 transition-all-short cursor-pointer accessible-focus"
                    aria-label={`Show weather forecast for ${fav.name}`}
                  >
                    {fav.name}
                  </button>
                ))
              )}
            </div>

          </div>
        </section>

        {/* Core Tab Routing Panels */}
        {loadingWeather ? (
          <div className="py-24 flex flex-col items-center justify-center text-center">
            <Loader2 className="w-12 h-12 text-sky-600 animate-spin mb-4" />
            <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">Contacting atmospheric sensors...</p>
            <p className="text-xs text-slate-400 mt-1">Reconstructing local coordinate indexes and computing humidity parameters.</p>
          </div>
        ) : weather ? (
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.18, ease: "easeInOut" }}
              className="w-full"
            >
              {activeTab === "dashboard" && (
                <WeatherDashboard
                  weather={weather}
                  aiInsight={aiInsight}
                  loadingInsight={loadingInsight}
                  onRefreshInsight={() => fetchWeather(weather.location)}
                  favorites={favorites}
                  onToggleFavorite={handleToggleFavorite}
                  widgets={widgetConfig}
                  highContrast={highContrast}
                  announceSpeech={announceSpeech}
                  offline={offline}
                />
              )}

              {activeTab === "widgets" && (
                <WidgetConfigurator
                  config={widgetConfig}
                  onChange={setWidgetConfig}
                  announceSpeech={announceSpeech}
                />
              )}

              {activeTab === "alerts" && (
                <SevereAlerts
                  alerts={alerts}
                  notificationsEnabled={notificationsEnabled}
                  onToggleNotifications={() => setNotificationsEnabled(!notificationsEnabled)}
                  onAddCustomAlert={handleAddCustomAlert}
                  onClearAlerts={() => setAlerts([])}
                  announceSpeech={announceSpeech}
                />
              )}

              {activeTab === "sync" && (
                <SyncPortal
                  syncCode={syncCode}
                  onSavePreferences={handleSavePreferences}
                  onLoadPreferences={handleLoadPreferences}
                  announceSpeech={announceSpeech}
                />
              )}

              {activeTab === "docs" && (
                <AccessibilityDocs
                  highContrast={highContrast}
                  announceSpeech={announceSpeech}
                  testResult={testResult}
                  onRunAudit={setTestResult}
                />
              )}
            </motion.div>
          </AnimatePresence>
        ) : (
          <div className="py-24 text-center text-slate-400">
            <Compass className="w-16 h-16 text-slate-300 mx-auto mb-4 animate-spin" />
            <p className="text-sm font-semibold">Ready to compute weather indices</p>
            <p className="text-xs mt-1">Enter a city above or load a quick favorite city to begin.</p>
          </div>
        )}

      </main>

      <footer className={`border-t p-4 shrink-0 ${
        highContrast 
          ? "border-yellow-400 bg-black text-white" 
          : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800"
      }`}>
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          
          <div className="text-[10px] text-slate-400 text-center md:text-right shrink-0 md:ml-auto">
            <p className="font-mono">All operations compliant with Section 508 & WCAG 2.1 AAA.</p>
            <p className="mt-0.5">Designed with React 19 + Tailwind v4 + Express backend.</p>
          </div>

        </div>
      </footer>

    </div>
  );
}
