import { GoogleGenAI, HarmCategory, HarmBlockThreshold } from "@google/genai";
import { Buffer } from 'node:buffer';
import { inflateSync } from 'node:zlib';

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
3. **FACTUALITY**: Base your answers strictly on the provided Context Documents (User Policy/Rejection Letter) and the "RELEVANT KNOWLEDGE BASE" sections below. If the information is not found in the documents, state: "I cannot find a specific clause regarding this in your uploaded documents."
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

// Helper: Chunk Text for Embeddings
function chunkText(text: string, chunkSize: number = 800) {
  const chunks = [];
  for (let i = 0; i < text.length; i += chunkSize) {
    chunks.push(text.slice(i, i + chunkSize));
  }
  return chunks;
}

// Helper: Native PDF Text Extraction (Lightweight, Worker-compatible)
function extractTextFromPDF(pdfBuffer: Buffer): string {
    const textContent: string[] = [];
    const binaryStr = pdfBuffer.toString('binary');
    
    // Regex to find stream blocks
    const streamRegex = /stream[\r\n]+([\s\S]*?)[\r\n]+endstream/g;
    let match;

    while ((match = streamRegex.exec(binaryStr)) !== null) {
        let streamData = match[1];
        
        try {
            // Attempt to inflate (decompress) the stream assuming FlateDecode
            const streamBuffer = Buffer.from(streamData, 'binary');
            const decompressed = inflateSync(streamBuffer);
            const content = decompressed.toString('utf-8');
            const extracted = extractTextFromContentStream(content);
            if (extracted) textContent.push(extracted);
        } catch (e) {
            // If inflation fails, try extracting as plain text (uncompressed stream)
            const extracted = extractTextFromContentStream(streamData);
            if (extracted) textContent.push(extracted);
        }
    }

    return textContent.join(' ').replace(/\s+/g, ' ').trim();
}

function extractTextFromContentStream(content: string): string {
    // Look for text operators: (text) Tj or [(text)] TJ
    const textRegex = /\((.*?)\)\s*Tj|\[(.*?)\]\s*TJ/g;
    let extracted = "";
    let match;
    
    while ((match = textRegex.exec(content)) !== null) {
        if (match[1]) {
            // (text) Tj
            extracted += match[1];
        } else if (match[2]) {
            // [(text)(text)] TJ
            const parts = match[2].match(/\((.*?)\)/g);
            if (parts) {
                extracted += parts.map(p => p.slice(1, -1)).join("");
            }
        }
        extracted += " ";
    }
    
    // Simple unescape for PDF text
    return extracted.replace(/\\(\d{3})|\\(.)/g, (m, octal, char) => {
        if (octal) return String.fromCharCode(parseInt(octal, 8));
        return char || '';
    });
}

// Helper: Fetch and extract text from a stored file
async function getFileContent(env: any, fileId: string): Promise<string> {
    const { results } = await env.DB.prepare(
        `SELECT r2_key, type FROM Files WHERE id = ?`
    ).bind(fileId).all();

    if (!results || results.length === 0) return "";
    const fileRecord = results[0] as any;

    const object = await env.BUCKET.get(fileRecord.r2_key);
    if (!object) return "";

    const arrayBuffer = await object.arrayBuffer();
    
    if (fileRecord.type === 'application/pdf') {
        const buffer = Buffer.from(arrayBuffer);
        return extractTextFromPDF(buffer);
    } else {
        // Fallback for non-PDFs (unlikely for policies, but good for safety)
        return "[Non-text file content]";
    }
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

    // === API: UPLOAD FILE (To R2 & D1 & Vectorize) ===
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
            
            // 3. AI PIPELINE: PDF Parsing & Vectorization (For RAG)
            if (body.type === 'application/pdf' && body.folder === 'insurance') {
                try {
                   const pdfBuffer = Buffer.from(body.data, 'base64');
                   const rawText = extractTextFromPDF(pdfBuffer);
                   const chunks = chunkText(rawText);
                   const vectors = [];
                   for(let i=0; i<chunks.length; i++) {
                       const chunk = chunks[i];
                       if (!chunk.trim()) continue;
                       const { data } = await env.AI.run('@cf/baai/bge-base-en-v1.5', { text: [chunk] });
                       const embedding = data[0];
                       vectors.push({
                           id: `${fileId}_${i}`,
                           values: embedding,
                           metadata: {
                               text: chunk,
                               email: body.email,
                               fileId: fileId,
                               fileName: body.name
                           }
                       });
                   }
                   if (vectors.length > 0) {
                       await env.VECTORIZE.upsert(vectors);
                   }
                } catch (aiError) {
                    console.error("AI Processing Failed:", aiError);
                }
            }

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

    // === API: COMPARE POLICIES (Modular Feature) ===
    if (url.pathname === "/api/compare" && request.method === "POST") {
        try {
            const apiKey = env.API_KEY || env.GEMINI_API_KEY;
            const { fileId1, fileId2 } = await request.json();
            
            // Fetch text content for both files
            const [text1, text2] = await Promise.all([
                getFileContent(env, fileId1),
                getFileContent(env, fileId2)
            ]);

            const ai = new GoogleGenAI({ apiKey });
            // FIXED: Removed deprecated getGenerativeModel

            const prompt = `
                You are an expert health insurance analyst. Compare the following two health insurance policies based on these texts.
                
                POLICY 1 TEXT:
                ${text1.slice(0, 30000)} ... [truncated if too long]

                POLICY 2 TEXT:
                ${text2.slice(0, 30000)} ... [truncated if too long]

                OUTPUT FORMAT:
                Return a strictly valid JSON object with the following structure:
                {
                    "features": [
                        { "feature": "Room Rent Limit", "policy1": "value", "policy2": "value", "winner": "policy1" | "policy2" | "tie" },
                        { "feature": "Co-Pay", "policy1": "value", "policy2": "value", "winner": "policy1" | "policy2" | "tie" },
                        { "feature": "Pre/Post Hospitalization", "policy1": "value", "policy2": "value", "winner": "policy1" | "policy2" | "tie" },
                        { "feature": "No Claim Bonus", "policy1": "value", "policy2": "value", "winner": "policy1" | "policy2" | "tie" },
                        { "feature": "Waiting Period (PED)", "policy1": "value", "policy2": "value", "winner": "policy1" | "policy2" | "tie" }
                    ],
                    "summary": "A short summary comparing the two plans."
                }
                Do not use Markdown code blocks. Just return the raw JSON string.
            `;

            // FIXED: Use ai.models.generateContent
            const result = await ai.models.generateContent({
                model: "gemini-2.5-flash",
                contents: prompt
            });
            let text = result.text || ""; // FIXED: Use .text getter
            
            // Clean markdown if present
            text = text.replace(/```json/g, '').replace(/```/g, '').trim();

            return new Response(text, { headers: { "Content-Type": "application/json" } });

        } catch (e: any) {
            return new Response(JSON.stringify({ error: e.message }), { status: 500 });
        }
    }

    // === API: CLAIM PRE-ASSESSMENT (Modular Feature) ===
    if (url.pathname === "/api/assess-claim" && request.method === "POST") {
        try {
            const apiKey = env.API_KEY || env.GEMINI_API_KEY;
            const { policyFileId, billData, billMimeType } = await request.json(); // billData is base64

            // Get Policy Text
            const policyText = await getFileContent(env, policyFileId);
            
            const ai = new GoogleGenAI({ apiKey });
            // FIXED: Removed deprecated getGenerativeModel

            const parts: any[] = [
                { text: `
                    You are a Claims Adjudicator AI. 
                    Analyze the provided Hospital Bill image against the provided Insurance Policy text.
                    
                    POLICY TEXT:
                    ${policyText.slice(0, 30000)}
                    
                    TASK:
                    1. Extract total bill amount and key procedures from the image.
                    2. Check against policy exclusions, room rent caps, and sub-limits.
                    3. Calculate a "Claim Success Probability".
                    
                    OUTPUT FORMAT (Strict JSON):
                    {
                        "probability": "High" | "Medium" | "Low",
                        "score": number (0-100),
                        "reasoning": "Explanation of the score...",
                        "flaggedItems": ["Item 1 - Reason", "Item 2 - Reason"]
                    }
                     Do not use Markdown code blocks. Just return the raw JSON string.
                `}
            ];

            // Add Bill Image
            if (billData) {
                parts.push({
                    inlineData: {
                        mimeType: billMimeType || 'image/jpeg',
                        data: billData
                    }
                });
            }

            // FIXED: Use ai.models.generateContent
            const result = await ai.models.generateContent({
                model: "gemini-2.5-flash",
                contents: { parts: parts }
            });
            let text = result.text || ""; // FIXED: Use .text getter
            text = text.replace(/```json/g, '').replace(/```/g, '').trim();

            return new Response(text, { headers: { "Content-Type": "application/json" } });

        } catch (e: any) {
            return new Response(JSON.stringify({ error: e.message }), { status: 500 });
        }
    }

    // === API: CHAT (RAG via R2 & Vectorize) ===
    if (url.pathname === "/api/chat" && request.method === "POST") {
      try {
        const apiKey = env.API_KEY || env.GEMINI_API_KEY; 
        if (!apiKey) throw new Error("API_KEY not configured in Cloudflare Secrets");

        const { history, message, attachments, remoteFileIds, email } = await request.json();
        const ai = new GoogleGenAI({ apiKey }); 

        // 1. Fetch Explicit Remote File Content (Legacy/Manual Selection)
        let cloudAttachments = [];
        if (remoteFileIds && remoteFileIds.length > 0) {
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

        // 2. RAG: Semantic Search for Context (Implicit Memory)
        let ragContext = "";
        if (message && email) {
            try {
                // A. Embed User Question
                const { data } = await env.AI.run('@cf/baai/bge-base-en-v1.5', { text: [message] });
                const questionEmbedding = data[0];

                // B. Query Vector Index (Filter by User Email for Privacy)
                const matches = await env.VECTORIZE.query(questionEmbedding, { 
                    topK: 5, 
                    returnMetadata: true,
                    filter: { email: email } 
                });
                
                // C. Fallback Filter (Double check)
                const userMatches = matches.matches.filter((m: any) => m.metadata && m.metadata.email === email);
                
                if (userMatches.length > 0) {
                    ragContext = userMatches.map((m: any) => 
                        `[Document: ${m.metadata.fileName}]\nExcerpt: ${m.metadata.text}`
                    ).join("\n\n---\n\n");
                }
            } catch (ragError) {
                console.warn("RAG retrieval failed", ragError);
            }
        }

        // 3. Construct Chat History & System Prompt
        const chatHistory = history.map((msg: any) => ({
          role: msg.role,
          parts: [{ text: msg.text }],
        }));

        let activeSystemInstruction = SYSTEM_INSTRUCTION;
        if (ragContext) {
            activeSystemInstruction += `\n\n=== RELEVANT KNOWLEDGE BASE (FROM USER DOCUMENTS) ===\n${ragContext}\n\nINSTRUCTION: Use the above excerpts to answer specific questions if they are relevant.`;
        }

        const chat = ai.chats.create({
          model: 'gemini-2.5-flash',
          config: { 
              systemInstruction: activeSystemInstruction,
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