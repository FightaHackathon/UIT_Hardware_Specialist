import { SYSTEM_INSTRUCTION } from "../constants";

// Backend API URL - using localhost for development
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

let isConnected = false;

/**
 * Check if the backend server is available
 */
export const initializeMistral = (): boolean => {
  // Since we're using a backend proxy, we just need to check if we can reach it
  // This will be verified on the first actual request
  fetch(`${API_BASE_URL}/api/health`)
    .then(response => response.json())
    .then(data => {
      isConnected = data.status === 'ok' && data.mistralConnected;
      console.log('Backend connection status:', isConnected);
    })
    .catch(error => {
      console.error("Failed to connect to backend:", error);
      isConnected = false;
    });

  // Return true optimistically - actual errors will be caught in sendMessageToMistral
  return true;
};

/**
 * Send a message to the Mistral AI via the backend proxy
 */
export const sendMessageToMistral = async (message: string, systemInstructionOverride?: string): Promise<string> => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message,
        systemInstruction: systemInstructionOverride || SYSTEM_INSTRUCTION
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
      throw new Error(errorData.error || `Server responded with status ${response.status}`);
    }

    const data = await response.json();

    if (!data.response) {
      throw new Error("Received an empty response from the server.");
    }

    isConnected = true;
    return data.response;

  } catch (error: any) {
    console.error("Chat API Error:", error);
    isConnected = false;

    // Provide user-friendly error messages
    if (error.message.includes('Failed to fetch') || error.message.includes('Network request failed')) {
      throw new Error("Backend server unreachable. Please run 'npm run dev:all' or start the server.");
    }

    throw new Error(error.message || "Failed to get response from AI");
  }
};
