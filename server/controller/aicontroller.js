import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

export const askAI = async (req, res) => {
  try {
    const { message } = req.body;

    if (!message || !message.trim()) {
      return res.status(400).json({
        success: false,
        message: "Please enter a message",
      });
    }

    const response = await ai.models.generateContent({
      model: "gemini-3.8-flash",
      contents: message,
      config: {
        systemInstruction:
          "You are Vantix AI, a helpful project management assistant. Help users plan projects, manage tasks, organize deadlines, and improve productivity.",
      },
    });

    res.status(200).json({
      success: true,
      reply: response.text,
    });
  } catch (error) {
  console.error("Vantix AI error:", error.message);

  if (error.status === 503) {
    return res.status(503).json({
      success: false,
      message:
        "AI is temporarily busy. Please try again in a few seconds.",
    });
  }

  if (error.status === 429) {
    return res.status(429).json({
      success: false,
      message:
        "AI usage limit reached. Please try again later.",
    });
  }

  return res.status(500).json({
    success: false,
    message: "Unable to generate an AI response.",
  });
  }
}