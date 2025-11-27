import { GoogleGenAI } from "@google/genai";

// System instruction for the Advocate AI
const SYSTEM_INSTRUCTION = `
You are ClaimAdvocate AI, a specialized assistant for the HealthShield AI platform. 
Your goal is to help Indian health insurance policyholders understand their policies, explain claim rejections in simple terms, and guide them through the appeals process.

Key Capabilities & Instructions:
1. **Document Analysis**: The user may upload images or PDFs of their insurance policy, claim rejection letters, or hospital bills. You must analyze these documents thoroughly to answer their questions.
2. **Explain Rejections**: If a user uploads a rejection letter, identify the specific clause or reason (e.g., "Non-disclosure of PED", "Room Rent Capping", "Reasonable & Customary Charges") and explain it in simple, non-legal English.
3. **Appeals Guidance**: Based on the rejection reason, suggest the specific documents needed for an appeal (e.g., "Treating Doctor's Certificate", "Detailed Breakup of Bill").
4. **Tone**: Empathetic, professional, and reassuring. You are on the user's side.
5. **Safety**: Do not provide medical diagnoses or legal advice. Always suggest consulting a professional for critical decisions.

If the user provides a document, refer to its content specifically in your response.
`;

export default {
  async fetch(request: Request, env: any) {
    // Handle CORS preflight requests
    if (request.method === "OPTIONS") {
      return new Response(null, {
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "POST, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type",
        },
      });
    }

    // Handle Chat API requests
    if (request.url.endsWith("/api/chat") && request.method === "POST") {
      try {
        const apiKey = env.API_KEY;
        if (!apiKey) {
          return new Response(JSON.stringify({ error: "API_KEY not configured in Cloudflare Secrets" }), {
            status: 500,
            headers: { "Content-Type": "application/json" }
          });
        }

        const { history, message, attachments } = await request.json();

        const ai = new GoogleGenAI({ apiKey });

        // Transform frontend history to Gemini SDK history format
        // Note: In a stateless request, we treat previous history as text-only to save bandwidth/complexity
        // unless we store full objects. For this implementation, we assume text history context is sufficient
        // and only the *current* message has active attachments.
        const chatHistory = history.map((msg: any) => ({
          role: msg.role,
          parts: [{ text: msg.text }],
        }));

        const chat = ai.chats.create({
          model: 'gemini-2.5-flash',
          config: {
            systemInstruction: SYSTEM_INSTRUCTION,
            temperature: 0.7,
          },
          history: chatHistory
        });

        // Construct the current message content with attachments if any
        let currentMessageParts = [];
        if (message) {
            currentMessageParts.push({ text: message });
        }
        if (attachments && Array.isArray(attachments)) {
            // attachments should be array of { inlineData: { mimeType, data } }
            currentMessageParts = [...currentMessageParts, ...attachments];
        }

        const resultStream = await chat.sendMessageStream({ 
            message: currentMessageParts 
        });

        // Create a ReadableStream to stream the response back to the client
        const { readable, writable } = new TransformStream();
        const writer = writable.getWriter();
        const encoder = new TextEncoder();

        // Process the stream asynchronously
        (async () => {
          try {
            for await (const chunk of resultStream) {
              const text = chunk.text;
              if (text) {
                await writer.write(encoder.encode(text));
              }
            }
          } catch (e) {
            console.error("Stream processing error:", e);
            await writer.write(encoder.encode("\n[Error processing response]"));
          } finally {
            await writer.close();
          }
        })();

        return new Response(readable, {
          headers: {
            "Content-Type": "text/plain; charset=utf-8",
            "Access-Control-Allow-Origin": "*",
          },
        });

      } catch (error: any) {
        console.error("Worker Error:", error);
        return new Response(JSON.stringify({ error: error.message }), {
          status: 500,
          headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
          },
        });
      }
    }

    return new Response("Not Found", { status: 404 });
  },
};