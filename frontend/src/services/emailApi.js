import { api } from './api';

/**
 * Sends a time capsule unlock notification email via the Chrona backend API.
 *
 * @param {Object} data - Payload containing { email, userName, memoryTitle, unlockDate, memoryId }
 * @returns {Promise<Object>} Resolves with { success: true } or rejects with Error
 */
export async function sendUnlockEmail(data = {}) {
  const hostUrl = api && typeof api.getHostUrl === 'function' ? api.getHostUrl() : 'http://localhost:5000';
  const url = `${hostUrl}/api/email/send-unlock`;

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    const result = await response.json().catch(() => ({}));

    if (!response.ok) {
      throw new Error(result.error || `Server responded with status ${response.status}`);
    }

    return result;
  } catch (error) {
    console.error('[emailApi] Error sending unlock email:', error.message || error);
    throw error;
  }
}

export default { sendUnlockEmail };
