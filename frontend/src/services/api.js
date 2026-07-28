let activeBaseUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

class ApiClient {
  constructor() {
    this.token = localStorage.getItem('chrona_jwt_token') || null;
  }

  setToken(token) {
    this.token = token;
    if (token) {
      localStorage.setItem('chrona_jwt_token', token);
    } else {
      localStorage.removeItem('chrona_jwt_token');
    }
  }

  getHeaders(isFormData = false) {
    const headers = {};
    if (!isFormData) {
      headers['Content-Type'] = 'application/json';
    }
    if (this.token && this.token !== 'null' && this.token !== 'undefined') {
      headers['Authorization'] = `Bearer ${this.token}`;
    }
    return headers;
  }

  async request(endpoint, options = {}) {
    const isFormData = options.body instanceof FormData;
    const config = {
      ...options,
      headers: {
        ...this.getHeaders(isFormData),
        ...(options.headers || {}),
      },
    };

    const tryFetch = async (baseUrl) => {
      const response = await fetch(`${baseUrl}${endpoint}`, config);
      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.message || `API Error (${response.status})`);
      }
      return await response.json();
    };

    try {
      return await tryFetch(activeBaseUrl);
    } catch (error) {
      // If primary port is unreachable (e.g. server shifted to 5001), try fallback ports
      if (activeBaseUrl.includes('localhost') && (error.name === 'TypeError' || error.message.includes('fetch'))) {
        const fallbackPorts = ['5001', '5002', '5000'];
        for (const port of fallbackPorts) {
          const fallbackUrl = `http://localhost:${port}/api`;
          if (fallbackUrl === activeBaseUrl) continue;
          try {
            const res = await tryFetch(fallbackUrl);
            activeBaseUrl = fallbackUrl;
            return res;
          } catch (e) {
            // continue next port
          }
        }
      }
      console.warn(`[Chrona API Client] Endpoint ${endpoint} unreachable:`, error.message);
      throw error;
    }
  }

  // Auth APIs
  signup(data) {
    return this.request('/auth/signup', { method: 'POST', body: JSON.stringify(data) });
  }

  login(data) {
    return this.request('/auth/login', { method: 'POST', body: JSON.stringify(data) });
  }

  googleLogin(data) {
    return this.request('/auth/google', { method: 'POST', body: JSON.stringify(data) });
  }

  forgotPassword(email) {
    return this.request('/auth/forgot-password', { method: 'POST', body: JSON.stringify({ email }) });
  }

  getProfile() {
    return this.request('/auth/profile');
  }

  updateProfile(data) {
    return this.request('/auth/profile', { method: 'PUT', body: JSON.stringify(data) });
  }

  // Memory APIs
  getMemories() {
    return this.request('/memories');
  }

  createMemory(memoryData) {
    return this.request('/memories', { method: 'POST', body: JSON.stringify(memoryData) });
  }

  updateMemory(id, memoryData) {
    return this.request(`/memories/${id}`, { method: 'PUT', body: JSON.stringify(memoryData) });
  }

  deleteMemory(id) {
    return this.request(`/memories/${id}`, { method: 'DELETE' });
  }

  uploadFile(file) {
    const formData = new FormData();
    formData.append('file', file);
    return this.request('/memories/upload', { method: 'POST', body: formData });
  }

  toggleFavorite(id) {
    return this.request('/memories/favorite', { method: 'POST', body: JSON.stringify({ id }) });
  }

  toggleArchive(id) {
    return this.request('/memories/archive', { method: 'POST', body: JSON.stringify({ id }) });
  }

  shareMemory(memoryId, recipientEmail) {
    return this.request('/memories/share', { method: 'POST', body: JSON.stringify({ memoryId, recipientEmail }) });
  }

  searchMemories(searchParams) {
    return this.request('/memories/search', { method: 'POST', body: JSON.stringify(searchParams) });
  }

  importMemories(importedMemories) {
    return this.request('/memories/import', { method: 'POST', body: JSON.stringify({ importedMemories }) });
  }

  async downloadExport(format = 'pdf', memoryIds = []) {
    const headers = this.getHeaders();
    const res = await fetch(`${API_BASE_URL}/memories/export`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ format, memoryIds }),
    });
    if (!res.ok) throw new Error('Export download failed');
    return await res.blob();
  }

  // AI Microservices
  aiChat(prompt, history, memoryContext) {
    return this.request('/ai/chat', { method: 'POST', body: JSON.stringify({ prompt, history, memoryContext }) });
  }

  aiSummarize(title, description) {
    return this.request('/ai/summarize', { method: 'POST', body: JSON.stringify({ title, description }) });
  }

  aiDetectMood(text) {
    return this.request('/ai/mood', { method: 'POST', body: JSON.stringify({ text }) });
  }

  aiGenerateTags(title, description, category) {
    return this.request('/ai/tags', { method: 'POST', body: JSON.stringify({ title, description, category }) });
  }

  aiSemanticSearch(query, memories) {
    return this.request('/ai/search', { method: 'POST', body: JSON.stringify({ query, memories }) });
  }

  aiGetRecaps(timeframe, memories) {
    return this.request('/ai/insights', { method: 'POST', body: JSON.stringify({ timeframe, memories }) });
  }

  aiAnalyzeImage(imageBase64, textHint = '') {
    return this.request('/ai/analyze-image', { method: 'POST', body: JSON.stringify({ imageBase64, textHint }) });
  }


  aiGenerateStory(memories = []) {
    return this.request('/ai/story', { method: 'POST', body: JSON.stringify({ memories }) });
  }

  sendUnlockEmail(data = {}) {
    return this.request('/auth/send-unlock-email', { method: 'POST', body: JSON.stringify(data) });
  }

  pushEmailToUser(data = {}) {
    return this.request('/auth/push-email', { method: 'POST', body: JSON.stringify(data) });
  }


  sendVaultSummaryToEmail(data = {}) {
    return this.request('/auth/push-summary', { method: 'POST', body: JSON.stringify(data) });
  }

  getNotifications() {
    return this.request('/notifications');
  }

  getAnalyticsDashboard() {
    return this.request('/analytics/dashboard');
  }

  markNotificationsRead(notificationId = 'all') {
    return this.request('/notifications/read', { method: 'PUT', body: JSON.stringify({ notificationId }) });
  }

  uploadAttachment(fileOrBlob) {
    const formData = new FormData();
    const file = fileOrBlob instanceof File ? fileOrBlob : new File([fileOrBlob], `voice-note-${Date.now()}.webm`, { type: fileOrBlob.type || 'audio/webm' });
    formData.append('file', file);
    return this.request('/memories/upload', { method: 'POST', body: formData });
  }

  getHostUrl() {
    return activeBaseUrl.replace(/\/api\/?$/, '');
  }
}

export const api = new ApiClient();


