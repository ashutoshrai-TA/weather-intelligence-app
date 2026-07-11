import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

// Enable JSON parsing
app.use(express.json());

// Initialize Gemini Client lazily to prevent crashing on boot if key is missing
let aiClient: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY environment variable is not set. Please set it in Settings > Secrets.");
    }
    aiClient = new GoogleGenAI({
      apiKey: apiKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return aiClient;
}

// In-memory data synchronization store
interface UserPreferences {
  favorites: any[];
  widgets: any;
  theme: string;
  highContrast: boolean;
  notificationsEnabled: boolean;
  alertHistory: any[];
  updatedAt: string;
}

const syncStore: Record<string, UserPreferences> = {};

// ------------------------------------------
// API Endpoints
// ------------------------------------------

// Health check
app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    geminiConfigured: !!process.env.GEMINI_API_KEY,
    time: new Date().toISOString(),
  });
});

// Sync Save Endpoint
app.post("/api/sync/save", (req, res) => {
  const { syncCode, preferences } = req.body;
  
  if (!preferences) {
    return res.status(400).json({ error: "No preferences data provided" });
  }

  // Generate a code if not provided
  let targetCode = syncCode;
  if (!targetCode) {
    // Generate a simple readable 6-character code
    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
    let isUnique = false;
    while (!isUnique) {
      targetCode = "";
      for (let i = 0; i < 6; i++) {
        targetCode += chars.charAt(Math.floor(Math.random() * chars.length));
      }
      if (!syncStore[targetCode]) {
        isUnique = true;
      }
    }
  }

  syncStore[targetCode] = {
    favorites: preferences.favorites || [],
    widgets: preferences.widgets || {},
    theme: preferences.theme || "light",
    highContrast: !!preferences.highContrast,
    notificationsEnabled: !!preferences.notificationsEnabled,
    alertHistory: preferences.alertHistory || [],
    updatedAt: new Date().toISOString(),
  };

  return res.json({
    success: true,
    syncCode: targetCode,
    updatedAt: syncStore[targetCode].updatedAt,
  });
});

// Sync Load Endpoint
app.get("/api/sync/load/:code", (req, res) => {
  const code = req.params.code?.toUpperCase();
  const data = syncStore[code];

  if (!data) {
    return res.status(404).json({ error: "Invalid sync code or backup not found." });
  }

  return res.json({
    success: true,
    syncCode: code,
    preferences: data,
  });
});

// Weather Intelligence Insight Generator (Gemini-powered)
app.post("/api/weather/intelligence", async (req, res) => {
  try {
    const { location, current, forecast, alerts } = req.body;

    if (!location || !current) {
      return res.status(400).json({ error: "Missing weather context data" });
    }

    const ai = getGeminiClient();

    const prompt = `
      You are an expert weather analyst and accessibility advisor. Provide an actionable Weather Intelligence Analysis for ${location.name}, ${location.country || ""}.
      
      Weather Context:
      - Current Temperature: ${current.temp}°C
      - Apparent (Feels Like) Temp: ${current.apparentTemp}°C
      - Weather Code: ${current.weatherCode} (Description: ${current.weatherDesc})
      - Humidity: ${current.humidity}%
      - Wind Speed: ${current.windSpeed} km/h
      - Precipitation Probability: ${current.precipitationProb}%
      - Forecast for the next hours/days: ${JSON.stringify(forecast || [])}
      - Active extreme weather alert conditions: ${JSON.stringify(alerts || [])}

      Generate a comprehensive intelligence analysis in JSON format matching the schema requested below.
    `;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        systemInstruction: "You are a professional weather adviser and health risk specialist. Respond ONLY with valid, raw, unquoted JSON conforming exactly to the responseSchema.",
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            summary: {
              type: Type.STRING,
              description: "A friendly 1-2 sentence overview of the current conditions and immediate outlook.",
            },
            clothing: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "List of recommended clothes/accessories for today's weather (e.g., lightweight layers, umbrella, polarized sunglasses).",
            },
            outdoorRating: {
              type: Type.NUMBER,
              description: "Score from 0 to 10 for outdoor activities.",
            },
            outdoorDetails: {
              type: Type.STRING,
              description: "Short, accessible reasoning for the outdoor activity rating.",
            },
            healthTips: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "Critical health and wellness advice concerning allergies, hydration, thermal comfort, or wind-chill.",
            },
            hazardChecklist: {
              type: Type.OBJECT,
              properties: {
                level: {
                  type: Type.STRING,
                  description: "Must be one of: 'none', 'low', 'medium', 'high'",
                },
                message: {
                  type: Type.STRING,
                  description: "Clear warning message if any potential hazards exist (e.g., heatstroke risks, icy patches, lightning), otherwise empty or safe message.",
                },
                precautions: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING },
                  description: "Key safety actions users can take (e.g., drinking water, securing objects, avoiding direct exposure).",
                },
              },
              required: ["level", "message", "precautions"],
            },
          },
          required: ["summary", "clothing", "outdoorRating", "outdoorDetails", "healthTips", "hazardChecklist"],
        },
      },
    });

    const resultText = response.text || "{}";
    const resultJson = JSON.parse(resultText);

    return res.json(resultJson);
  } catch (error: any) {
    console.error("Gemini Weather Intelligence Error:", error);
    
    // Provide a smart fallback response if Gemini is not set up or fails
    const mockFallbacks = [
      "Bring along a durable jacket and umbrella to ensure comfort.",
      "Stay well-hydrated throughout the day and seek shade during peak UV hours.",
      "Dress in soft breathable layers and keep an eye on sudden wind shifts."
    ];
    const chosenFallback = mockFallbacks[Math.floor(Math.random() * mockFallbacks.length)];
    
    return res.json({
      summary: `[Fallback Analysis] Local weather suggests a temperature of ${req.body?.current?.temp || "normal"}°C. ${chosenFallback}`,
      clothing: req.body?.current?.temp < 15 
        ? ["Warm insulated coat", "Thermal socks", "Scarf or neck gaiter"] 
        : ["Light breathable shirt", "Comfortable shorts or pants", "Polarized sunglasses"],
      outdoorRating: req.body?.current?.temp > 15 && req.body?.current?.temp < 28 ? 8 : 5,
      outdoorDetails: "Temperature is within normal thresholds. Wind is manageable, but prepare for local temperature variations.",
      healthTips: [
        "Monitor local air quality if you have dynamic respiratory sensitivity.",
        "Ensure consistent water intake to stay perfectly hydrated.",
        "Take brief breaks from continuous outdoor exercises if temperature is elevated."
      ],
      hazardChecklist: {
        level: "none",
        message: "No severe meteorological warnings are currently active for this coordinate zone.",
        precautions: ["Always check local conditions before starting long outdoor trips."]
      },
      _isFallback: true,
      _errorMessage: error.message
    });
  }
});

// Mock service for simulated extreme alerts
app.get("/api/alerts/simulated", (req, res) => {
  const alerts = [
    {
      id: "alert-1",
      event: "Severe Gale Warning",
      severity: "Moderate",
      sender: "Meteorological Central Service",
      description: "Sustained high gusts of wind up to 75 km/h expected in elevated sections. Secure all loose outdoor items.",
      ends: new Date(Date.now() + 6 * 3600 * 1000).toISOString(),
    },
    {
      id: "alert-2",
      event: "Excessive Cold Alert",
      severity: "Extreme",
      sender: "Climate Assessment Agency",
      description: "Temperatures expected to drop rapidly overnight to sub-zero levels with localized frost formation.",
      ends: new Date(Date.now() + 18 * 3600 * 1000).toISOString(),
    },
    {
      id: "alert-3",
      event: "Thunderstorm Vigilance",
      severity: "Minor",
      sender: "National Flash Alert Network",
      description: "Scattered thunderstorm clouds moving from east. High local lightning strikes and brief downpours potential.",
      ends: new Date(Date.now() + 3 * 3600 * 1000).toISOString(),
    }
  ];
  return res.json(alerts);
});


// ------------------------------------------
// Vite Integration & Static Assets Serving
// ------------------------------------------

async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    // Development mode
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    
    app.use(vite.middlewares);
    console.log("Vite development server middleware mounted.");
  } else {
    // Production mode
    const distPath = path.join(process.cwd(), "dist");
    
    // Serve static files
    app.use(express.static(distPath));
    
    // Fallback all routes to index.html for React SPA
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
    console.log("Production static files server mounted at:", distPath);
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Weather Intelligence server listening on port ${PORT} in ${process.env.NODE_ENV || "development"} mode`);
  });
}

startServer().catch((err) => {
  console.error("Failed to start full-stack server:", err);
});
