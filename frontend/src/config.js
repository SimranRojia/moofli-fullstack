const isProduction = process.env.NODE_ENV === "production";

export const API_BASE_URL = isProduction
  ? "https://moofli-r5it.onrender.com"  
  : "http://localhost:4000";             
