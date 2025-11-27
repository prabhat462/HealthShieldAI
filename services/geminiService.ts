import { ChatMessage } from '../types';

export const streamChatResponse = async (
  history: ChatMessage[],
  newMessage: string,
  attachments: { inlineData: { mimeType: string; data: string } }[]
): Promise<ReadableStreamDefaultReader<Uint8Array>> => {
  
  // Prepare payload
  // We exclude the very last message if it was optimistically added by UI, 
  // but here 'history' is passed from the component state.
  // We need to separate the "history" (context) from the "current message" (prompt).
  
  const response = await fetch('/api/chat', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      history: history.filter(msg => msg.text), // Send existing history
      message: newMessage,
      attachments: attachments
    }),
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`API Error: ${response.status} - ${err}`);
  }

  if (!response.body) {
    throw new Error("No response body received");
  }

  return response.body.getReader();
};