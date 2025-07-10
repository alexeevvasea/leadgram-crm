import api from './api';

export const attentionService = {
  // Получить объявления, требующие внимания
  getListingsRequiringAttention: async () => {
    const response = await api.get('/attention/listings');
    return response.data;
  },

  // Получить краткую сводку
  getAttentionSummary: async () => {
    const response = await api.get('/attention/summary');
    return response.data;
  },
};