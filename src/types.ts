/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface LocationInfo {
  name: string;
  latitude: number;
  longitude: number;
  country?: string;
  admin1?: string; // state/region
  country_code?: string;
}

export interface CurrentWeather {
  temp: number;
  apparentTemp: number;
  weatherCode: number;
  weatherDesc: string;
  humidity: number;
  windSpeed: number;
  precipitationProb: number;
  uvIndex: number;
  pressure: number;
  time: string;
}

export interface HourlyForecast {
  time: string;
  temp: number;
  apparentTemp: number;
  precipitationProb: number;
  weatherCode: number;
  weatherDesc: string;
  humidity: number;
  windSpeed: number;
  uvIndex: number;
}

export interface DailyForecast {
  date: string;
  tempMax: number;
  tempMin: number;
  precipitationProb: number;
  weatherCode: number;
  weatherDesc: string;
  uvIndexMax: number;
}

export interface WeatherData {
  location: LocationInfo;
  current: CurrentWeather;
  hourly: HourlyForecast[];
  daily: DailyForecast[];
  fetchedAt: string;
}

export interface WeatherAlert {
  id: string;
  event: string;
  severity: "Minor" | "Moderate" | "Extreme";
  sender: string;
  description: string;
  ends: string;
}

export interface WidgetMetric {
  id: string;
  label: string;
  enabled: boolean;
  icon: string;
}

export interface WidgetConfig {
  hourlyHoursCount: number; // e.g. 5, 8, 12, 24
  visibleMetrics: string[]; // e.g., ["temp", "apparentTemp", "humidity", "windSpeed", "precipitationProb", "uvIndex"]
  layout: "grid" | "list" | "compact";
}

export interface UserPreferences {
  favorites: LocationInfo[];
  widgets: WidgetConfig;
  theme: "light" | "dark";
  highContrast: boolean;
  notificationsEnabled: boolean;
  alertHistory: WeatherAlert[];
  syncCode?: string;
}

export interface DeveloperDoc {
  section: string;
  title: string;
  content: string;
  codeSnippet?: string;
  ariaRoles?: string[];
}

export interface AccessibilityTest {
  id: string;
  name: string;
  category: "Contrast" | "ARIA" | "Keyboard" | "Semantic";
  description: string;
  status: "passed" | "failed" | "untested";
  details?: string;
}

export interface TestSuiteResult {
  score: number; // 0-100
  passedCount: number;
  failedCount: number;
  tests: AccessibilityTest[];
  timestamp: string;
}
