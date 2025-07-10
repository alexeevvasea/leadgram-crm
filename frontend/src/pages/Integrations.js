import React, { useState, useEffect } from 'react';
import { FiPlus, FiSettings, FiCheck, FiX, FiRefreshCw, FiAlertCircle } from 'react-icons/fi';
import api from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';

const Integrations = () => {
  const [integrations, setIntegrations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadIntegrations();
  }, []);

  const loadIntegrations = async () => {
    try {
      setLoading(true);
      const response = await api.get('/integrations');
      setIntegrations(response.data);
    } catch (err) {
      setError('Ошибка загрузки интеграций');
      console.error('Error loading integrations:', err);
    } finally {
      setLoading(false);
    }
  };

  const getIntegrationIcon = (type) => {
    switch (type) {
      case 'telegram': return '📱';
      case 'whatsapp': return '💬';
      case 'olx': return '🏪';
      case 'n8n': return '🔧';
      default: return '⚙️';
    }
  };

  const getIntegrationTitle = (type) => {
    switch (type) {
      case 'telegram': return 'Telegram';
      case 'whatsapp': return 'WhatsApp';
      case 'olx': return 'OLX';
      case 'n8n': return 'n8n Автоматизация';
      default: return 'Неизвестная интеграция';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'text-green-600 bg-green-50';
      case 'inactive': return 'text-gray-600 bg-gray-50';
      case 'error': return 'text-red-600 bg-red-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'active': return 'Активна';
      case 'inactive': return 'Неактивна';
      case 'error': return 'Ошибка';
      default: return 'Неизвестно';
    }
  };

  const testIntegration = async (integrationId) => {
    try {
      const response = await api.post(`/integrations/test/${integrationId}`);
      alert('Тест прошел успешно!');
    } catch (err) {
      alert('Ошибка при тестировании интеграции');
      console.error('Error testing integration:', err);
    }
  };

  const availableIntegrations = [
    {
      type: 'telegram',
      title: 'Telegram',
      description: 'Получение сообщений из Telegram',
      icon: '📱',
      comingSoon: false
    },
    {
      type: 'whatsapp',
      title: 'WhatsApp Business',
      description: 'Интеграция с WhatsApp Business API',
      icon: '💬',
      comingSoon: true
    },
    {
      type: 'olx',
      title: 'OLX',
      description: 'Синхронизация с OLX объявлениями',
      icon: '🏪',
      comingSoon: true
    },
    {
      type: 'n8n',
      title: 'n8n Автоматизация',
      description: 'Подключение к n8n для автоматизации',
      icon: '🔧',
      comingSoon: false
    }
  ];

  if (loading) {
    return <LoadingSpinner text="Загрузка интеграций..." />;
  }

  return (
    <div className="p-4 space-y-6">
      {/* Заголовок */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Интеграции</h1>
          <p className="text-gray-600 mt-1">
            Подключите внешние сервисы для получения сообщений
          </p>
        </div>
        <button
          onClick={loadIntegrations}
          className="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100"
        >
          <FiRefreshCw className="w-5 h-5" />
        </button>
      </div>

      {/* Ошибка */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center space-x-3">
            <FiAlertCircle className="w-5 h-5 text-red-500" />
            <span className="text-red-600">{error}</span>
            <button
              onClick={loadIntegrations}
              className="text-blue-600 hover:text-blue-800 text-sm underline"
            >
              Повторить
            </button>
          </div>
        </div>
      )}

      {/* Активные интеграции */}
      {integrations.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">
              Активные интеграции
            </h3>
          </div>
          <div className="p-4 space-y-4">
            {integrations.map((integration) => (
              <div
                key={integration.id}
                className="flex items-center justify-between p-4 border border-gray-200 rounded-lg"
              >
                <div className="flex items-center space-x-4">
                  <div className="text-2xl">
                    {getIntegrationIcon(integration.type)}
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">
                      {integration.name}
                    </h4>
                    <p className="text-sm text-gray-600">
                      {getIntegrationTitle(integration.type)}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(integration.status)}`}>
                    {getStatusText(integration.status)}
                  </span>
                  
                  <button
                    onClick={() => testIntegration(integration.id)}
                    className="p-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-full transition-colors"
                    title="Тестировать"
                  >
                    <FiCheck className="w-4 h-4" />
                  </button>
                  
                  <button
                    className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-50 rounded-full transition-colors"
                    title="Настройки"
                  >
                    <FiSettings className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Доступные интеграции */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">
            Доступные интеграции
          </h3>
        </div>
        <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
          {availableIntegrations.map((integration) => (
            <div
              key={integration.type}
              className="p-4 border border-gray-200 rounded-lg hover:shadow-sm transition-shadow"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-3">
                  <div className="text-2xl mt-1">
                    {integration.icon}
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900 mb-1">
                      {integration.title}
                    </h4>
                    <p className="text-sm text-gray-600 mb-3">
                      {integration.description}
                    </p>
                    
                    {integration.comingSoon ? (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                        Скоро
                      </span>
                    ) : (
                      <button
                        onClick={() => alert('Настройка интеграции будет доступна в следующих версиях')}
                        className="inline-flex items-center px-3 py-1 rounded-lg text-sm font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 transition-colors"
                      >
                        <FiPlus className="w-4 h-4 mr-1" />
                        Подключить
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Инструкции */}
      <div className="bg-blue-50 rounded-lg p-4">
        <h4 className="font-medium text-blue-900 mb-2">
          💡 Как подключить интеграции:
        </h4>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• Для Telegram: создайте бота через @BotFather</li>
          <li>• Для WhatsApp: получите доступ к Business API</li>
          <li>• Для OLX: настройте уведомления в личном кабинете</li>
          <li>• Для n8n: установите собственный инстанс или используйте облачный</li>
        </ul>
      </div>
    </div>
  );
};

export default Integrations;