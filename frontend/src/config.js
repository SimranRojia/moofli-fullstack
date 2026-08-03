const isProduction = process.env.NODE_ENV === "production";

// Set REACT_APP_API_URL in Vercel project settings to your Render backend URL.
export const API_BASE_URL =
  process.env.REACT_APP_API_URL ||
  (isProduction ? "https://moofli-r5it.onrender.com" : "http://localhost:4000");
