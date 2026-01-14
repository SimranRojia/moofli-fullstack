import { toast } from "react-hot-toast";

const apiKey = process.env.REACT_APP_GEMINI_API_KEY;

export async function getMoodFromGemini(content) {
  if (!apiKey) {
    console.error("API Key is missing. Check your .env.local file and restart the server.");
    toast.error("Missing Gemini API key");
    return "neutral";
  }

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: `
You are a mood detection model.
Analyze the following diary text and respond ONLY with one word from this list:
happy, sad, angry, relaxed, anxious, neutral, ecstatic, joyful, excited, amazing, wonderful terrible, awful, miserable, depressed, furious, bad, worried, unhappy, down, okay, calm, fine, normal, content, pleased, positive, great, good.

Diary entry:
"${content}"
                  `,
                },
              ],
            },
          ],
        }),
      }
    );


    // If the response status is not OK, log the detailed error from the API
    if (!response.ok) {
      const errorData = await response.json();
      console.error("3. Gemini API Error:", errorData);
      throw new Error(`API Error: ${errorData.error.message}`);
    }

    const data = await response.json();

    const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || "";

    const match = rawText
      .toLowerCase()
      .match(/\b(happy|sad|angry|relaxed|anxious|neutral)\b/);

    const mood = match ? match[1] : "neutral";

    if (!match) {
        toast.error("Mood text not recognized.");
    } 

    return mood;

  } catch (error) {
    console.error("CRITICAL: The mood detection function failed.", error);
    toast.error("Mood detection failed critically.");
    return "neutral";
  }
}