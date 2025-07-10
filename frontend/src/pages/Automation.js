import React, { useState, useEffect } from 'react';
import { FiPlus, FiPlay, FiPause, FiSettings, FiZap, FiRefreshCw } from 'react-icons/fi';
import api from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';

const Automation = () => {
  const [automations, setAutomations] = useState([]);
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadAutomationData();
  }, []);

  const loadAutomationData = async () => {
    try {
      setLoading(true);
      const [automationsResponse, templatesResponse] = await Promise.all([
        api.get('/automation'),
        api.get('/automation/templates')
      ]);
      
      setAutomations(automationsResponse.data);
      setTemplates(templatesResponse.data);
    } catch (err) {
      setError('Ошибка загрузки автоматизации');
      console.error('Error loading automation data:', err);
    } finally {
      setLoading(false);
    }
  };

  const getTriggerText = (trigger) => {
    switch (trigger) {
      case 'new_message': return 'Новое сообщение';
      case 'no_response': return 'Нет ответа';
      case 'time_based': return 'По времени';
      case 'manual': return 'Ручной запуск';
      default: return 'Неизвестно';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'text-green-600 bg-green-50';
      case 'inactive': return 'text-gray-600 bg-gray-50';
      case 'paused': return 'text-yellow-600 bg-yellow-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'active': return 'Активна';
      case 'inactive': return 'Неактивна';
      case 'paused': return 'Приостановлена';
      default: return 'Неизвестно';
    }
  };

  const toggleAutomation = async (automationId, currentStatus) => {
    try {
      const newStatus = currentStatus === 'active' ? 'paused' : 'active';
      await api.put(`/automation/${automationId}`, { status: newStatus });
      loadAutomationData();
    } catch (err) {
      console.error('Error toggling automation:', err);
    }
  };

  const testAutomation = async (automationId) => {
    try {
      const response = await api.post(`/automation/${automationId}/test`, {
        test_message: 'Тестовое сообщение'
      });
      alert('Автоматизация протестирована успешно!');
    } catch (err) {
      alert('Ошибка при тестировании автоматизации');
      console.error('Error testing automation:', err);
    }
  };

  const createFromTemplate = async (template) => {
    try {
      const response = await api.post('/automation', {
        name: template.name,
        description: template.description,
        trigger: template.trigger,
        conditions: template.conditions || {},
        actions: template.actions || []
      });
      
      alert('Автоматизация создана успешно!');
      loadAutomationData();
    } catch (err) {
      alert('Ошибка при создании автоматизации');
      console.error('Error creating automation:', err);
    }
  };

  if (loading) {
    return <LoadingSpinner text="Загрузка автоматизации..." />;
  }

  return (
    <div className="p-4 space-y-6">
      {/* Заголовок */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Автоматизация</h1>
          <p className="text-gray-600 mt-1">
            Настройте автоматические действия для ваших сообщений
          </p>
        </div>
        <button
          onClick={loadAutomationData}
          className="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100"
        >
          <FiRefreshCw className="w-5 h-5" />
        </button>
      </div>

      {/* Ошибка */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center space-x-3">
            <span className="text-red-600">{error}</span>
            <button
              onClick={loadAutomationData}
              className="text-blue-600 hover:text-blue-800 text-sm underline"
            >
              Повторить
            </button>
          </div>
        </div>
      )}

      {/* Активные автоматизации */}
      {automations.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">
              Ваши автоматизации
            </h3>
          </div>
          <div className="p-4 space-y-4">
            {automations.map((automation) => (
              <div
                key={automation.id}
                className="flex items-center justify-between p-4 border border-gray-200 rounded-lg"
              >
                <div className="flex items-center space-x-4">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <FiZap className="w-5 h-5 text-purple-600" />
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">
                      {automation.name}
                    </h4>
                    <p className="text-sm text-gray-600 mb-1">
                      {automation.description}
                    </p>
                    <div className="flex items-center space-x-3 text-xs text-gray-500">
                      <span>Триггер: {getTriggerText(automation.trigger)}</span>
                      <span>•</span>
                      <span>{automation.actions?.length || 0} действий</span>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(automation.status)}`}>
                    {getStatusText(automation.status)}
                  </span>
                  
                  <button
                    onClick={() => toggleAutomation(automation.id, automation.status)}
                    className="p-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-full transition-colors"
                    title={automation.status === 'active' ? 'Приостановить' : 'Активировать'}
                  >
                    {automation.status === 'active' ? (
                      <FiPause className="w-4 h-4" />
                    ) : (
                      <FiPlay className="w-4 h-4" />
                    )}
                  </button>
                  
                  <button
                    onClick={() => testAutomation(automation.id)}
                    className="p-2 text-green-600 hover:text-green-800 hover:bg-green-50 rounded-full transition-colors"
                    title="Тестировать"
                  >
                    <FiZap className="w-4 h-4" />
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

      {/* Шаблоны автоматизации */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">
            Шаблоны автоматизации
          </h3>
        </div>
        <div className="p-4 space-y-4">
          {templates.map((template) => (
            <div
              key={template.id}
              className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:shadow-sm transition-shadow"
            >
              <div className="flex items-center space-x-4">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <FiZap className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <h4 className="font-medium text-gray-900">
                    {template.name}
                  </h4>
                  <p className="text-sm text-gray-600 mb-1">
                    {template.description}
                  </p>
                  <div className="flex items-center space-x-3 text-xs text-gray-500">
                    <span>Триггер: {getTriggerText(template.trigger)}</span>
                    <span>•</span>
                    <span>{template.actions?.length || 0} действий</span>
                  </div>
                </div>
              </div>
              
              <button
                onClick={() => createFromTemplate(template)}
                className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <FiPlus className="w-4 h-4" />
                <span>Создать</span>
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Информация о n8n */}
      <div className="bg-purple-50 rounded-lg p-4">
        <h4 className="font-medium text-purple-900 mb-2">
          🔧 Продвинутая автоматизация с n8n
        </h4>
        <p className="text-sm text-purple-800 mb-3">
          Для более сложных сценариев автоматизации подключите n8n - платформу для создания workflows.
        </p>
        <div className="text-sm text-purple-700 space-y-1">
          <div>• Создавайте сложные цепочки действий</div>
          <div>• Интегрируйтесь с любыми API</div>
          <div>• Используйте условную логику</div>
          <div>• Планируйте выполнение по времени</div>
        </div>
      </div>

      {/* Пустое состояние */}
      {automations.length === 0 && (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <FiZap className="w-8 h-8 text-purple-600" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Начните автоматизацию
          </h3>
          <p className="text-gray-600 max-w-md mx-auto mb-6">
            Создайте свою первую автоматизацию из готовых шаблонов выше
          </p>
        </div>
      )}
    </div>
  );
};

export default Automation;