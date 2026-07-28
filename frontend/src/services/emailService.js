import { sendUnlockEmail as apiSendUnlockEmail } from './emailApi';

/**
 * Service function to handle sending capsule unlock notification emails.
 * Abstracts API calls to backend Express/Nodemailer service.
 * Safely handles missing or failing backend services without throwing runtime errors.
 *
 * @param {Object} data - Payload containing email, userName, memoryTitle, unlockDate, memoryId
 * @returns {Promise<Object>} Response object containing success boolean
 */
export async function sendUnlockEmail(data = {}) {
  try {
    return await apiSendUnlockEmail(data);
  } catch (error) {
    console.warn('[Unlock Email Service Notice]:', error.message || error);
    return { success: false, error: error.message };
  }
}

