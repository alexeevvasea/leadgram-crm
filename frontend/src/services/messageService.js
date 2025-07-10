import api from './api';

export const messageService = {
  // Получить сообщения клиента
  getClientMessages: async (clientId, limit = 100) => {
    const response = await api.get(`/messages/client/${clientId}`, { params: { limit } });
    return response.data;
  },

  // Получить последние сообщения (unified inbox)
  getRecentMessages: async (limit = 50) => {
    const response = await api.get('/messages', { params: { limit } });
    return response.data;
  },

  // Отправить ответ
  sendResponse: async (clientId, content) => {
    const response = await api.post('/messages/respond', {
      client_id: clientId,
      content: content,
    });
    return response.data;
  },

  // Создать сообщение
  createMessage: async (messageData) => {
    const response = await api.post('/messages', messageData);
    return response.data;
  },

  // Отметить сообщение как прочитанное
  markAsRead: async (messageId) => {
    const response = await api.patch(`/messages/${messageId}/read`);
    return response.data;
  },

  // Получить количество непрочитанных сообщений
  getUnreadCount: async () => {
    const response = await api.get('/messages/unread-count');
    return response.data;
  },

  // Поиск по сообщениям
  searchMessages: async (query, limit = 50) => {
    const response = await api.get('/messages/search', { params: { query, limit } });
    return response.data;
  },
};