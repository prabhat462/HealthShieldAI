import { ChatMessage } from '../types';

export const streamChatResponse = async (
  history: ChatMessage[],
  newMessage: string,
  attachments: { inlineData: { mimeType: string; data: string } }[],
  remoteFileIds: string[] = [] // New parameter for Drive files
): Promise<ReadableStreamDefaultReader<Uint8Array>> => {
  
  const response = await fetch('/api/chat', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      history: history.filter(msg => msg.text), // Send existing history
      message: newMessage,
      attachments: attachments,
      remoteFileIds: remoteFileIds // Pass IDs to worker
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