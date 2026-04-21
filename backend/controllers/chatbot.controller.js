import { GoogleGenAI } from "@google/genai";

// Initialize the GoogleGenAI client (automatically uses process.env.GEMINI_API_KEY)
const ai = new GoogleGenAI({});

const predefinedQA = {
  "how it works": "Our platform connects you with skilled local technicians for various tasks. Simply browse services, book an appointment, and pay securely.",
  "payment": "We support secure card payments through Stripe. You can pay online during checkout.",
  "guarantee": "All our technicians are vetted, and we offer a satisfaction guarantee for all tasks.",
  "cancel": "You can cancel your booking from your dashboard. Please refer to our cancellation policy for refund details.",
  "contact": "You can reach out to our admin team via the contact form or email us directly at support@platform.com."
};

export const chatWithBot = async (req, res) => {
  try {
    const { message } = req.body;
    if (!message) {
      return res.status(400).json({ success: false, message: "Message is required" });
    }

    const lowerMessage = message.toLowerCase();

    // 1. Check for predefined questions first
    for (const key of Object.keys(predefinedQA)) {
      if (lowerMessage.includes(key)) {
        return res.status(200).json({ 
          success: true, 
          reply: predefinedQA[key] 
        });
      }
    }

    // 2. If it's a custom question, use Gemini LLM
    const response = await ai.models.generateContent({
      model: "gemini-1.5-flash",
      contents: `You are a helpful customer support assistant for a services platform similar to TaskRabbit. Answer the following query concisely, politely, and within 3-4 sentences.\n\nUser: ${message}`,
    });

    return res.status(200).json({ 
      success: true, 
      reply: response.text 
    });
  } catch (error) {
    console.error("Chatbot Error:", error);
    res.status(500).json({ success: false, message: "Chatbot service is currently unavailable. Please try again later." });
  }
};
