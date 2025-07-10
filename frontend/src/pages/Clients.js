import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiSearch, FiFilter, FiPlus, FiRefreshCw } from 'react-icons/fi';
import { clientService } from '../services/clientService';
import ClientCard from '../components/ClientCard';
import LoadingSpinner from '../components/LoadingSpinner';

const Clients = () => {
  const navigate = useNavigate();
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [sourceFilter, setSourceFilter] = useState('');

  useEffect(() => {
    loadClients();
  }, [statusFilter, sourceFilter]);

  const loadClients = async () => {
    try {
      setLoading(true);
      const params = {};
      if (statusFilter) params.status = statusFilter;
      if (sourceFilter) params.source = sourceFilter;
      
      const data = await clientService.getClients(params);
      setClients(data);
    } catch (err) {
      setError('Ошибка загрузки клиентов');
      console.error('Error loading clients:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleClientCall = async (clientId) => {
    try {
      await clientService.callClient(clientId);
    } catch (err) {
      console.error('Error calling client:', err);
    }
  };

  const handleClientMessage = (clientId) => {
    navigate(`/chat/${clientId}`);
  };

  const handleClientClose = async (clientId) => {
    try {
      await clientService.closeClient(clientId);
      loadClients(); // Обновляем список
    } catch (err) {
      console.error('Error closing client:', err);
    }
  };

  const filteredClients = clients.filter(client => {
    const matchesSearch = client.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         (client.phone && client.phone.includes(searchQuery)) ||
                         (client.listing_title && client.listing_title.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesSearch;
  });

  if (loading) {
    return <LoadingSpinner text="Загрузка клиентов..." />;
  }

  return (
    <div className="p-4 space-y-4">
      {/* Заголовок */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Клиенты</h1>
        <div className="flex items-center space-x-2">
          <button
            onClick={loadClients}
            className="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100"
          >
            <FiRefreshCw className="w-5 h-5" />
          </button>
          <button
            onClick={() => navigate('/clients/new')}
            className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            <FiPlus className="w-4 h-4" />
            <span>Добавить</span>
          </button>
        </div>
      </div>

      {/* Поиск и фильтры */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div className="flex flex-col space-y-4">
          {/* Поиск */}
          <div className="relative">
            <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Поиск по имени, телефону или объявлению..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* Фильтры */}
          <div className="flex space-x-4 overflow-x-auto">
            <div className="flex-shrink-0">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Все статусы</option>
                <option value="new">Новые</option>
                <option value="in_progress">В работе</option>
                <option value="closed">Закрытые</option>
              </select>
            </div>
            
            <div className="flex-shrink-0">
              <select
                value={sourceFilter}
                onChange={(e) => setSourceFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Все источники</option>
                <option value="telegram">Telegram</option>
                <option value="whatsapp">WhatsApp</option>
                <option value="olx">OLX</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Список клиентов */}
      <div className="space-y-4">
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-center space-x-3">
              <span className="text-red-600">{error}</span>
              <button
                onClick={loadClients}
                className="text-blue-600 hover:text-blue-800 text-sm underline"
              >
                Повторить
              </button>
            </div>
          </div>
        )}

        {filteredClients.length === 0 ? (
          <div className="text-center py-12">
            <FiFilter className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">
              {searchQuery || statusFilter || sourceFilter 
                ? 'Клиенты не найдены' 
                : 'Нет клиентов'}
            </p>
          </div>
        ) : (
          filteredClients.map((client) => (
            <ClientCard
              key={client.id}
              client={client}
              onCall={handleClientCall}
              onMessage={handleClientMessage}
              onClose={handleClientClose}
              onClick={() => handleClientMessage(client.id)}
            />
          ))
        )}
      </div>
    </div>
  );
};

export default Clients;