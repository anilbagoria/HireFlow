import dotenv from "dotenv";

dotenv.config({});

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_MODEL = process.env.GEMINI_MODEL || "gemini-2.0-flash";

const readGeminiText = (responseJson) => {
  const candidate = responseJson?.candidates?.[0];
  const parts = candidate?.content?.parts || [];
  return parts
    .map((part) => part?.text)
    .filter(Boolean)
    .join("\n")
    .trim();
};

const extractJsonObject = (text) => {
  if (!text) {
    throw new Error("Gemini returned an empty response.");
  }

  const markdownJsonMatch = text.match(/```json\s*([\s\S]*?)```/i);
  const raw = markdownJsonMatch ? markdownJsonMatch[1] : text;

  const firstBrace = raw.indexOf("{");
  const lastBrace = raw.lastIndexOf("}");

  if (firstBrace === -1 || lastBrace === -1 || lastBrace <= firstBrace) {
    throw new Error("Gemini response does not contain a valid JSON object.");
  }

  const jsonString = raw.slice(firstBrace, lastBrace + 1);
  return JSON.parse(jsonString);
};

export const askGemini = async ({ prompt, responseMimeType = "application/json", temperature = 0.4 }) => {
  if (!GEMINI_API_KEY) {
    throw new Error("GEMINI_API_KEY is missing in environment variables.");
  }

  const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${GEMINI_API_KEY}`;

  const body = {
    generationConfig: {
      temperature,
      responseMimeType,
    },
    contents: [
      {
        role: "user",
        parts: [{ text: prompt }],
      },
    ],
  };

  const response = await fetch(endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Gemini API error ${response.status}: ${errorText}`);
  }

  const responseJson = await response.json();
  const text = readGeminiText(responseJson);

  if (responseMimeType === "application/json") {
    return extractJsonObject(text);
  }

  return text;
};
