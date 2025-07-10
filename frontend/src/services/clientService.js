import api from './api';

export const clientService = {
  // Получить список клиентов
  getClients: async (params = {}) => {
    const response = await api.get('/clients', { params });
    return response.data;
  },

  // Получить клиента по ID
  getClient: async (clientId) => {
    const response = await api.get(`/clients/${clientId}`);
    return response.data;
  },

  // Создать нового клиента
  createClient: async (clientData) => {
    const response = await api.post('/clients', clientData);
    return response.data;
  },

  // Обновить клиента
  updateClient: async (clientId, updateData) => {
    const response = await api.put(`/clients/${clientId}`, updateData);
    return response.data;
  },

  // Получить последние чаты
  getRecentChats: async (limit = 10) => {
    const response = await api.get('/clients/recent', { params: { limit } });
    return response.data;
  },

  // Получить статистику дашборда
  getDashboardStats: async () => {
    const response = await api.get('/clients/dashboard');
    return response.data;
  },

  // Позвонить клиенту
  callClient: async (clientId) => {
    const response = await api.post(`/clients/${clientId}/call`);
    return response.data;
  },

  // Закрыть клиента
  closeClient: async (clientId) => {
    const response = await api.post(`/clients/${clientId}/close`);
    return response.data;
  },
};