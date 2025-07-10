import api from './api';

export const aiService = {
  // Предложить ответ клиенту
  suggestResponse: async (clientId, conversationHistory = []) => {
    const response = await api.post('/ai/suggest-response', {
      client_id: clientId,
      conversation_history: conversationHistory,
    });
    return response.data;
  },

  // Получить советы по закрытию сделки
  getCloseDealTips: async (clientId) => {
    const response = await api.post('/ai/close-deal-tips', {
      client_id: clientId,
    });
    return response.data;
  },

  // Анализ объявления
  analyzeListing: async (listingId, listingText) => {
    const response = await api.post('/ai/analyze-listing', {
      listing_id: listingId,
      listing_text: listingText,
    });
    return response.data;
  },

  // Генерация кастомного ответа
  generateCustomResponse: async (prompt, context = {}) => {
    const response = await api.post('/ai/generate-response', {
      prompt: prompt,
      context: context,
    });
    return response.data;
  },

  // Получить настройки AI
  getAISettings: async () => {
    const response = await api.get('/ai/settings');
    return response.data;
  },

  // Обновить настройки AI
  updateAISettings: async (settings) => {
    const response = await api.post('/ai/settings', settings);
    return response.data;
  },
};