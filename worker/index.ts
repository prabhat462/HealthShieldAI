import { GoogleGenAI } from "@google/genai";

// === Simulated Database (In-Memory for Demo Stability) ===
// In a real production app, this would be Cloudflare R2, D1, or real Google Drive calls.
// Since we cannot configure Service Accounts in this environment, we simulate the storage
// so the "Feature" works for the user immediately.
const FILE_STORAGE = new Map(); 

const SYSTEM_INSTRUCTION = `
You are ClaimAdvocate AI, a specialized assistant for the HealthShield AI platform. 
Your goal is to help Indian health insurance policyholders understand their policies, explain claim rejections in simple terms, and guide them through the appeals process.

Key Capabilities & Instructions:
1. **Document Analysis**: You have access to the user's uploaded documents (Policy PDFs, Rejection Letters). Refer to them explicitly.
2. **Explain Rejections**: Identify specific clauses (e.g., "Room Rent Capping").
3. **Appeals Guidance**: Suggest documents needed for appeal.
4. **Tone**: Empathetic, professional.

If specific context documents are provided, analyze them first.
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

        // NOTE: To implement REAL Google Drive Upload:
        // 1. Use Service Account credentials from `env.SERVICE_ACCOUNT_JSON`
        // 2. Mint a JWT
        // 3. POST https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart
        // 4. Use `body.folder` to map to subfolder IDs inside "1HegvNJd..."

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
        const apiKey = env.API_KEY || "YOUR_FALLBACK_KEY"; // Use env secret
        
        // Safety Check
        if (!apiKey || apiKey === "YOUR_FALLBACK_KEY") {
             // Try to use a hardcoded fallback if env is missing (for demo stability)
             const hardcoded = "AIza..."; // DO NOT COMMIT REAL KEYS
             // In production, this error is correct. In this demo, we might want to be lenient.
        }

        const { history, message, attachments, remoteFileIds } = await request.json();

        const ai = new GoogleGenAI({ apiKey: env.API_KEY || env.GEMINI_API_KEY }); // Prefer Env

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

        const chat = ai.chats.create({
          model: 'gemini-2.5-flash',
          config: { systemInstruction: SYSTEM_INSTRUCTION },
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
