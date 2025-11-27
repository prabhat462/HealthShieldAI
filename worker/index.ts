import { GoogleGenAI, HarmCategory, HarmBlockThreshold } from "@google/genai";

// === ADVOCATE AI GUARDRAILS (SAFETY SETTINGS) ===
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

// === SYSTEM INSTRUCTIONS ===
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

// Helper: Convert ArrayBuffer to Base64
function arrayBufferToBase64(buffer: ArrayBuffer) {
  let binary = '';
  const bytes = new Uint8Array(buffer);
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

// Helper: Convert Base64 string to Uint8Array for R2 storage
function base64ToUint8Array(base64: string) {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

export default {
  async fetch(request: Request, env: any) {
    // CORS Handling
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

    // === API: AUTH/LOGIN (Sync User to D1) ===
    if (url.pathname === "/api/auth/login" && request.method === "POST") {
        try {
            const user = await request.json();
            // Insert user if not exists (Upsert logic)
            await env.DB.prepare(
                `INSERT INTO Users (email, name, picture) VALUES (?, ?, ?) 
                 ON CONFLICT(email) DO UPDATE SET name=excluded.name, picture=excluded.picture`
            ).bind(user.email, user.name, user.picture).run();
            
            return new Response(JSON.stringify({ success: true }), { 
                headers: { "Content-Type": "application/json" } 
            });
        } catch (e: any) {
            return new Response(JSON.stringify({ error: e.message }), { status: 500 });
        }
    }

    // === API: UPLOAD FILE (To R2 & D1) ===
    if (url.pathname === "/api/upload" && request.method === "POST") {
        try {
            const body = await request.json();
            const fileId = crypto.randomUUID();
            const r2Key = `${body.email}/${fileId}-${body.name}`;
            
            // 1. Store Binary in R2
            const fileData = base64ToUint8Array(body.data);
            await env.BUCKET.put(r2Key, fileData, {
                httpMetadata: { contentType: body.type }
            });

            // 2. Store Metadata in D1
            await env.DB.prepare(
                `INSERT INTO Files (id, email, name, type, size, folder, r2_key) VALUES (?, ?, ?, ?, ?, ?, ?)`
            ).bind(fileId, body.email, body.name, body.type, body.size, body.folder, r2Key).run();
            
            const newFile = {
                id: fileId,
                name: body.name,
                type: body.type,
                size: body.size,
                folder: body.folder,
                uploadDate: new Date().toISOString()
            };

            return new Response(JSON.stringify(newFile), {
                headers: { "Content-Type": "application/json" }
            });
        } catch (e: any) {
            console.error("Upload Error", e);
            return new Response(JSON.stringify({ error: e.message }), { status: 500 });
        }
    }

    // === API: LIST FILES (From D1) ===
    if (url.pathname === "/api/documents" && request.method === "GET") {
        const email = url.searchParams.get("email");
        if (!email) return new Response("Missing email", { status: 400 });

        try {
            const { results } = await env.DB.prepare(
                "SELECT id, name, type, size, folder, upload_date as uploadDate FROM Files WHERE email = ? ORDER BY upload_date DESC"
            ).bind(email).all();

            return new Response(JSON.stringify({ files: results }), {
                headers: { "Content-Type": "application/json" }
            });
        } catch (e: any) {
             return new Response(JSON.stringify({ error: e.message }), { status: 500 });
        }
    }

    // === API: CHAT (RAG via R2) ===
    if (url.pathname === "/api/chat" && request.method === "POST") {
      try {
        const apiKey = env.API_KEY || env.GEMINI_API_KEY; 
        if (!apiKey) throw new Error("API_KEY not configured in Cloudflare Secrets");

        const { history, message, attachments, remoteFileIds } = await request.json();
        const ai = new GoogleGenAI({ apiKey }); 

        // 1. Fetch Remote File Content from R2
        let cloudAttachments = [];
        if (remoteFileIds && remoteFileIds.length > 0) {
            // Get R2 keys from D1 for these file IDs
            // Note: In production, verify user ownership of these IDs via auth token
            const placeholders = remoteFileIds.map(() => '?').join(',');
            const { results } = await env.DB.prepare(
                `SELECT r2_key, type FROM Files WHERE id IN (${placeholders})`
            ).bind(...remoteFileIds).all();

            for (const fileRecord of results as any[]) {
                const object = await env.BUCKET.get(fileRecord.r2_key);
                if (object) {
                    const arrayBuffer = await object.arrayBuffer();
                    const base64Data = arrayBufferToBase64(arrayBuffer);
                    cloudAttachments.push({
                        inlineData: {
                            mimeType: fileRecord.type,
                            data: base64Data
                        }
                    });
                }
            }
        }

        const chatHistory = history.map((msg: any) => ({
          role: msg.role,
          parts: [{ text: msg.text }],
        }));

        const chat = ai.chats.create({
          model: 'gemini-2.5-flash',
          config: { 
              systemInstruction: SYSTEM_INSTRUCTION,
              safetySettings: ADVOCATE_AI_SAFETY_SETTINGS,
          },
          history: chatHistory
        });

        let currentMessageParts: any[] = [];
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