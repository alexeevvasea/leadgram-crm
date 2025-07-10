import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiUsers, FiMessageCircle, FiAlertTriangle, FiCheckCircle, FiRefreshCw } from 'react-icons/fi';
import { clientService } from '../services/clientService';
import { attentionService } from '../services/attentionService';
import ClientCard from '../components/ClientCard';
import AttentionPanel from '../components/AttentionPanel';
import LoadingSpinner from '../components/LoadingSpinner';

const Dashboard = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState({});
  const [recentChats, setRecentChats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const [dashboardStats, recentChatsData] = await Promise.all([
        clientService.getDashboardStats(),
        clientService.getRecentChats(5),
      ]);
      
      setStats(dashboardStats);
      setRecentChats(recentChatsData);
    } catch (err) {
      setError('Ошибка загрузки данных');
      console.error('Error loading dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleClientCall = async (clientId) => {
    try {
      await clientService.callClient(clientId);
      // Здесь можно добавить уведомление об успешном звонке
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
      loadDashboardData(); // Обновляем данные
    } catch (err) {
      console.error('Error closing client:', err);
    }
  };

  const handleViewListing = (listingId) => {
    // Здесь можно добавить переход к объявлению
    navigate(`/listing/${listingId}`);
  };

  if (loading) {
    return <LoadingSpinner text="Загрузка дашборда..." />;
  }

  if (error) {
    return (
      <div className="p-4">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center space-x-3">
            <FiAlertTriangle className="w-5 h-5 text-red-500" />
            <span className="text-red-600">{error}</span>
            <button
              onClick={loadDashboardData}
              className="text-blue-600 hover:text-blue-800 text-sm underline"
            >
              Повторить
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 space-y-6">
      {/* Заголовок */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Добро пожаловать, Пользователь!
          </h1>
          <p className="text-gray-600 mt-1">
            Обзор продаж и активности
          </p>
        </div>
        <button
          onClick={loadDashboardData}
          className="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100"
        >
          <FiRefreshCw className="w-5 h-5" />
        </button>
      </div>

      {/* Статистики */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <FiUsers className="w-6 h-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-2xl font-bold text-gray-900">
                {stats.new_leads || 0}
              </p>
              <p className="text-sm text-gray-600">Новые лиды</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center">
            <div className="p-2 bg-orange-100 rounded-lg">
              <FiAlertTriangle className="w-6 h-6 text-orange-600" />
            </div>
            <div className="ml-4">
              <p className="text-2xl font-bold text-gray-900">
                {stats.pending_attention || 0}
              </p>
              <p className="text-sm text-gray-600">Требует внимания</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <FiMessageCircle className="w-6 h-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-2xl font-bold text-gray-900">
                {stats.active_chats || 0}
              </p>
              <p className="text-sm text-gray-600">Активные чаты</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 rounded-lg">
              <FiCheckCircle className="w-6 h-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-2xl font-bold text-gray-900">
                {stats.completed_sales || 0}
              </p>
              <p className="text-sm text-gray-600">Закрытые сделки</p>
            </div>
          </div>
        </div>
      </div>

      {/* Последние чаты */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium text-gray-900">
              Последние чаты
            </h3>
            <button
              onClick={() => navigate('/clients')}
              className="text-blue-600 hover:text-blue-800 text-sm font-medium"
            >
              Показать все
            </button>
          </div>
        </div>
        
        <div className="p-4">
          {recentChats.length === 0 ? (
            <div className="text-center py-8">
              <FiMessageCircle className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">Нет активных чатов</p>
            </div>
          ) : (
            <div className="space-y-4">
              {recentChats.map((client) => (
                <ClientCard
                  key={client.id}
                  client={client}
                  onCall={handleClientCall}
                  onMessage={handleClientMessage}
                  onClose={handleClientClose}
                  onClick={() => handleClientMessage(client.id)}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Панель внимания */}
      <AttentionPanel onViewListing={handleViewListing} />
    </div>
  );
};

export default Dashboard;