import { GoogleGenAI, HarmCategory, HarmBlockThreshold } from "@google/genai";

// === Simulated Database (In-Memory for Demo Stability) ===
// In a real production app, this would be Cloudflare R2, D1, or real Google Drive calls.
const FILE_STORAGE = new Map(); 

// === ADVOCATE AI GUARDRAILS (SAFETY SETTINGS) ===
// Separate configuration for easy manual tuning.
const ADVOCATE_AI_SAFETY_SETTINGS = [
    {
        category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
        threshold: HarmBlockThreshold.BLOCK_LOW_AND_ABOVE
    },
    {
        category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
        threshold: HarmBlockThreshold.BLOCK_LOW_AND_ABOVE
    },
    {
        category: HarmCategory.HARM_CATEGORY_HARASSMENT,
        threshold: HarmBlockThreshold.BLOCK_LOW_AND_ABOVE
    },
    {
        category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
        threshold: HarmBlockThreshold.BLOCK_LOW_AND_ABOVE
    }
];

// === SYSTEM INSTRUCTIONS & BEHAVIORAL GUARDRAILS ===
const SYSTEM_INSTRUCTION = `
You are ClaimAdvocate AI, a specialized assistant for the HealthShield AI platform. 

ROLE:
Your goal is to help Indian health insurance policyholders understand their policies, explain claim rejections in simple terms, and guide them through the appeals process.

GUARDRAILS & PROTOCOLS (STRICT ENFORCEMENT):
1. **MEDICAL DISCLAIMER**: You are an AI Insurance Advocate, NOT a doctor. DO NOT provide medical diagnoses, treatment advice, or prognoses. If a user asks for medical advice, strictly reply: "I am an insurance assistant, not a doctor. Please consult a medical professional for health advice."
2. **SCOPE LIMITATION**: Only answer questions related to Health Insurance, Claims, Policies, and Wellness programs. If the topic is unrelated (e.g., politics, coding), politely decline.
3. **FACTUALITY**: Base your answers strictly on the provided Context Documents (User Policy/Rejection Letter). If the information is not found in the documents, state: "I cannot find a specific clause regarding this in your uploaded documents."
4. **TONE**: Empathetic, professional, yet firm regarding financial limits and exclusions.

CAPABILITIES:
1. **Document Analysis**: Analyze uploaded Policy PDFs and Rejection Letters.
2. **Explain Rejections**: Identify specific clauses (e.g., "Room Rent Capping", "Co-pay").
3. **Appeals Guidance**: Suggest specific documents needed for an appeal based on the rejection reason.
`;

export default {
  async fetch(request: Request, env: any) {
    // CORS
    if (request.method === "OPTIONS") {
      return new Response(null, {
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "POST, GET, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type",
        },
      });
    }

    const url = new URL(request.url);

    // === API: UPLOAD FILE (Mock Drive) ===
    if (url.pathname === "/api/upload" && request.method === "POST") {
        const body = await request.json();
        const fileId = "drive-" + Date.now();
        
        const newFile = {
            id: fileId,
            name: body.name,
            type: body.type,
            size: body.size,
            folder: body.folder,
            uploadDate: new Date().toISOString(),
            data: body.data // Storing Base64 in memory for the demo
        };

        // Store in "DB"
        let userFiles = FILE_STORAGE.get(body.email) || [];
        userFiles.push(newFile);
        FILE_STORAGE.set(body.email, userFiles);

        return new Response(JSON.stringify(newFile), {
            headers: { "Content-Type": "application/json" }
        });
    }

    // === API: LIST FILES ===
    if (url.pathname === "/api/documents" && request.method === "GET") {
        const email = url.searchParams.get("email");
        const files = FILE_STORAGE.get(email) || [];
        // Return metadata only (exclude heavy data)
        const meta = files.map(({data, ...rest}) => rest);
        return new Response(JSON.stringify({ files: meta }), {
            headers: { "Content-Type": "application/json" }
        });
    }

    // === API: CHAT ===
    if (url.pathname === "/api/chat" && request.method === "POST") {
      try {
        const apiKey = env.API_KEY || "YOUR_FALLBACK_KEY"; 
        
        // Safety Check
        if (!apiKey || apiKey === "YOUR_FALLBACK_KEY") {
             // Try to use a hardcoded fallback if env is missing (for demo stability)
             const hardcoded = "AIza..."; // DO NOT COMMIT REAL KEYS
        }

        const { history, message, attachments, remoteFileIds } = await request.json();

        const ai = new GoogleGenAI({ apiKey: env.API_KEY || env.GEMINI_API_KEY }); 

        // 1. Fetch Remote File Content (from "Drive")
        let cloudAttachments = [];
        if (remoteFileIds && remoteFileIds.length > 0) {
            // Flatten all user storage to find files (Simple search)
            for (const userStore of FILE_STORAGE.values()) {
                const found = userStore.filter((f: any) => remoteFileIds.includes(f.id));
                found.forEach((f: any) => {
                    cloudAttachments.push({
                        inlineData: {
                            mimeType: f.type,
                            data: f.data
                        }
                    });
                });
            }
        }

        const chatHistory = history.map((msg: any) => ({
          role: msg.role,
          parts: [{ text: msg.text }],
        }));

        // === CONTEXT CACHING STRATEGY (Prepared Structure) ===
        // In a production scenario with heavy documents (e.g. > 32k tokens),
        // we would initialize the cache here.
        /*
        let cachedContentName = undefined;
        if (cloudAttachments.length > 0) {
             // hypothetical check if we should cache
             const cacheOp = await ai.cache.create({
                 model: 'gemini-1.5-flash-001',
                 contents: cloudAttachments, 
                 ttl: '300s'
             });
             cachedContentName = cacheOp.name;
        }
        */

        const chat = ai.chats.create({
          model: 'gemini-2.5-flash',
          config: { 
              systemInstruction: SYSTEM_INSTRUCTION,
              safetySettings: ADVOCATE_AI_SAFETY_SETTINGS, // Applied Guardrails
              // cachedContent: cachedContentName // Apply cache if created
          },
          history: chatHistory
        });

        let currentMessageParts = [];
        if (message) currentMessageParts.push({ text: message });
        
        // Add Local Attachments
        if (attachments && Array.isArray(attachments)) {
            currentMessageParts = [...currentMessageParts, ...attachments];
        }
        // Add Cloud Attachments (Context)
        if (cloudAttachments.length > 0) {
             currentMessageParts = [...currentMessageParts, ...cloudAttachments];
        }

        const resultStream = await chat.sendMessageStream({ 
            message: currentMessageParts 
        });

        const { readable, writable } = new TransformStream();
        const writer = writable.getWriter();
        const encoder = new TextEncoder();

        (async () => {
          try {
            for await (const chunk of resultStream) {
              const text = chunk.text;
              if (text) await writer.write(encoder.encode(text));
            }
          } catch (e) {
            console.error("Stream error:", e);
            await writer.write(encoder.encode("\n[Error processing response]"));
          } finally {
            await writer.close();
          }
        })();

        return new Response(readable, {
          headers: { "Content-Type": "text/plain; charset=utf-8" },
        });

      } catch (error: any) {
        return new Response(JSON.stringify({ error: error.message }), { status: 500 });
      }
    }

    return new Response("Not Found", { status: 404 });
  },
};