import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({
  path: path.resolve(__dirname, "../../.env")
});

const requiredInProduction = ["MONGO_URI", "JWT_SECRET"];

for (const key of requiredInProduction) {
  if (process.env.NODE_ENV === "production" && !process.env[key]) {
    throw new Error(`${key} is required in production`);
  }
}

export const env = {
  nodeEnv: process.env.NODE_ENV || "development",
  port: process.env.PORT || 5000,
  mongoUri: process.env.MONGO_URI || "mongodb://127.0.0.1:27017/smart_complaints",
  jwtSecret: process.env.JWT_SECRET || "development-only-secret-change-me",
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || "7d",
  clientUrl: process.env.CLIENT_URL || "http://localhost:5173",
  openaiApiKey: process.env.OPENROUTER_API_KEY || process.env.OPENAI_API_KEY || "",
  openaiBaseUrl: process.env.OPENROUTER_BASE_URL || process.env.OPENAI_BASE_URL || "https://openrouter.ai/api/v1",
  openaiModel: process.env.AI_MODEL || process.env.OPENAI_MODEL || "deepseek/deepseek-chat-v3-0324",
  openrouterSiteUrl: process.env.OPENROUTER_SITE_URL || process.env.CLIENT_URL || "http://localhost:5173",
  openrouterAppName: process.env.OPENROUTER_APP_NAME || "AI Smart Complaint Management System"
};
