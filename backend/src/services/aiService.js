import axios from "axios";
import { env } from "../config/env.js";

const DEPARTMENTS = [
  "Sanitation Department",
  "Roads and Transport Department",
  "Water Supply Department",
  "Electricity Department",
  "Public Safety Department",
  "Health Department",
  "Environment Department",
  "General Administration"
];

const urgencyRank = {
  low: 25,
  medium: 50,
  high: 75,
  critical: 95
};

const normalizeUrgency = (value = "medium") => {
  const urgency = String(value).toLowerCase();
  return ["low", "medium", "high", "critical"].includes(urgency) ? urgency : "medium";
};

const cleanText = (value = "", max = 700) => String(value).replace(/\s+/g, " ").trim().slice(0, max);

const extractJson = (content) => {
  const trimmed = String(content || "").trim();
  const start = trimmed.indexOf("{");
  const end = trimmed.lastIndexOf("}");

  if (start === -1 || end === -1 || end <= start) {
    throw new Error("AI response did not contain valid JSON");
  }

  return JSON.parse(trimmed.slice(start, end + 1));
};

const normalizeAnalysis = (analysis, source) => {
  const urgency = normalizeUrgency(analysis.urgency);
  const department = cleanText(analysis.department || "General Administration", 120);

  return {
    urgency,
    urgencyScore: Number.isFinite(Number(analysis.urgencyScore))
      ? Math.max(0, Math.min(100, Number(analysis.urgencyScore)))
      : urgencyRank[urgency],
    department,
    autoResponse: cleanText(
      analysis.autoResponse ||
        "Your complaint has been registered and routed to the responsible department for review.",
      900
    ),
    summary: cleanText(analysis.summary || "Complaint summary is not available.", 500),
    model: source === "ai" ? env.openaiModel : "local-heuristic",
    source,
    analyzedAt: new Date()
  };
};

const buildPrompt = (complaint) => `
You are an assistant for a municipal complaint management system.
Analyze the complaint and return only JSON with these keys:
urgency: one of low, medium, high, critical
urgencyScore: number from 0 to 100
department: the most responsible department from this list: ${DEPARTMENTS.join(", ")}
autoResponse: a concise citizen-facing response with next steps
summary: a concise one-sentence summary

Complaint:
Title: ${complaint.title}
Category: ${complaint.category}
Location: ${complaint.location?.address}, ${complaint.location?.city}, ${complaint.location?.state}
Description: ${complaint.description}
`;

const callOpenAICompatibleApi = async (complaint) => {
  const { data } = await axios.post(
    `${env.openaiBaseUrl.replace(/\/$/, "")}/chat/completions`,
    {
      model: env.openaiModel,
      temperature: 0.2,
      response_format: { type: "json_object" },
      messages: [
        {
          role: "system",
          content:
            "Return strict JSON only. Do not include markdown, prose, or extra keys. Be practical and safety-aware."
        },
        {
          role: "user",
          content: buildPrompt(complaint)
        }
      ]
    },
    {
      headers: {
        Authorization: `Bearer ${env.openaiApiKey}`,
        "Content-Type": "application/json",
        "HTTP-Referer": env.openrouterSiteUrl,
        "X-Title": env.openrouterAppName
      },
      timeout: 25000
    }
  );

  const content = data.choices?.[0]?.message?.content;
  return normalizeAnalysis(extractJson(content), "ai");
};

const localFallbackAnalysis = (complaint) => {
  const text = `${complaint.title} ${complaint.category} ${complaint.description}`.toLowerCase();
  const category = String(complaint.category || "").toLowerCase();

  const criticalWords = ["fire", "electrocution", "accident", "sewage overflow", "contamination", "collapse"];
  const highWords = ["urgent", "danger", "blocked", "leak", "broken", "outage", "overflow", "unsafe"];

  let urgency = "medium";
  if (criticalWords.some((word) => text.includes(word))) urgency = "critical";
  else if (highWords.some((word) => text.includes(word))) urgency = "high";
  else if (text.includes("minor") || text.includes("request")) urgency = "low";

  let department = "General Administration";
  if (category.includes("sanitation") || text.includes("garbage") || text.includes("waste")) {
    department = "Sanitation Department";
  } else if (category.includes("road") || text.includes("pothole") || text.includes("traffic")) {
    department = "Roads and Transport Department";
  } else if (category.includes("water") || text.includes("drain") || text.includes("leak")) {
    department = "Water Supply Department";
  } else if (category.includes("electric") || text.includes("streetlight") || text.includes("power")) {
    department = "Electricity Department";
  } else if (category.includes("safety") || text.includes("crime") || text.includes("hazard")) {
    department = "Public Safety Department";
  } else if (category.includes("health") || text.includes("disease")) {
    department = "Health Department";
  } else if (category.includes("environment") || text.includes("pollution")) {
    department = "Environment Department";
  }

  return normalizeAnalysis(
    {
      urgency,
      urgencyScore: urgencyRank[urgency],
      department,
      summary: `${cleanText(complaint.title, 120)} in ${complaint.location?.city || "the reported area"}.`,
      autoResponse: `Your complaint has been categorized as ${urgency} priority and routed to the ${department}. Please track the complaint ID for status updates.`
    },
    "local-fallback"
  );
};

export const analyzeComplaintInput = async (complaint) => {
  if (!env.openaiApiKey) {
    return localFallbackAnalysis(complaint);
  }

  try {
    return await callOpenAICompatibleApi(complaint);
  } catch (error) {
    console.warn("AI analysis fallback used:", error.message);
    return localFallbackAnalysis(complaint);
  }
};

export const analyzeComplaintWithProvider = async (complaint) => {
  if (!env.openaiApiKey) {
    const error = new Error("OPENROUTER_API_KEY is not configured");
    error.statusCode = 503;
    error.code = "AI_API_KEY_MISSING";
    throw error;
  }

  try {
    return await callOpenAICompatibleApi(complaint);
  } catch (error) {
    const providerMessage = error.response?.data?.error?.message || error.response?.data?.message || error.message;
    const wrapped = new Error(`AI analysis failed: ${providerMessage}`);
    wrapped.statusCode = error.response?.status || 502;
    wrapped.code = "AI_API_ERROR";
    wrapped.errors = [
      {
        field: "ai",
        message: providerMessage
      }
    ];
    throw wrapped;
  }
};
