import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiSearch, FiRefreshCw, FiUser, FiClock } from 'react-icons/fi';
import { messageService } from '../services/messageService';
import { clientService } from '../services/clientService';
import LoadingSpinner from '../components/LoadingSpinner';
import { formatDistanceToNow } from 'date-fns';
import { ru } from 'date-fns/locale';

const Messages = () => {
  const navigate = useNavigate();
  const [messages, setMessages] = useState([]);
  const [clients, setClients] = useState({});
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    loadMessagesData();
    loadUnreadCount();
  }, []);

  const loadMessagesData = async () => {
    try {
      setLoading(true);
      const messagesData = await messageService.getRecentMessages(100);
      setMessages(messagesData);
      
      // Получаем информацию о клиентах
      const clientIds = [...new Set(messagesData.map(m => m.client_id))];
      const clientsData = {};
      
      for (const clientId of clientIds) {
        try {
          const client = await clientService.getClient(clientId);
          clientsData[clientId] = client;
        } catch (err) {
          console.error(`Error loading client ${clientId}:`, err);
        }
      }
      
      setClients(clientsData);
    } catch (err) {
      console.error('Error loading messages:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadUnreadCount = async () => {
    try {
      const data = await messageService.getUnreadCount();
      setUnreadCount(data.unread_count);
    } catch (err) {
      console.error('Error loading unread count:', err);
    }
  };

  const handleSearchMessages = async () => {
    if (!searchQuery.trim()) {
      loadMessagesData();
      return;
    }

    try {
      setLoading(true);
      const searchResults = await messageService.searchMessages(searchQuery);
      setMessages(searchResults);
    } catch (err) {
      console.error('Error searching messages:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleMessageClick = (message) => {
    navigate(`/chat/${message.client_id}`);
  };

  const getSourceColor = (source) => {
    switch (source) {
      case 'telegram': return 'bg-blue-500';
      case 'whatsapp': return 'bg-green-500';
      case 'olx': return 'bg-purple-500';
      default: return 'bg-gray-500';
    }
  };

  const groupedMessages = messages.reduce((groups, message) => {
    const clientId = message.client_id;
    if (!groups[clientId]) {
      groups[clientId] = [];
    }
    groups[clientId].push(message);
    return groups;
  }, {});

  if (loading) {
    return <LoadingSpinner text="Загрузка сообщений..." />;
  }

  return (
    <div className="p-4 space-y-4">
      {/* Заголовок */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Сообщения</h1>
          {unreadCount > 0 && (
            <p className="text-sm text-gray-600 mt-1">
              {unreadCount} непрочитанных сообщений
            </p>
          )}
        </div>
        <button
          onClick={loadMessagesData}
          className="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100"
        >
          <FiRefreshCw className="w-5 h-5" />
        </button>
      </div>

      {/* Поиск */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div className="flex space-x-2">
          <div className="relative flex-1">
            <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Поиск по сообщениям..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearchMessages()}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <button
            onClick={handleSearchMessages}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Найти
          </button>
        </div>
      </div>

      {/* Список чатов */}
      <div className="space-y-4">
        {Object.keys(groupedMessages).length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <FiUser className="w-8 h-8 text-gray-400" />
            </div>
            <p className="text-gray-500">Нет сообщений</p>
          </div>
        ) : (
          Object.entries(groupedMessages).map(([clientId, clientMessages]) => {
            const client = clients[clientId];
            const lastMessage = clientMessages[0]; // Сообщения уже отсортированы по времени
            
            return (
              <div
                key={clientId}
                onClick={() => handleMessageClick(lastMessage)}
                className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 hover:shadow-md transition-shadow cursor-pointer"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-3 flex-1">
                    <div className="flex-shrink-0">
                      <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center">
                        <FiUser className="w-6 h-6 text-gray-500" />
                      </div>
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2 mb-1">
                        <h3 className="font-medium text-gray-900 truncate">
                          {client?.name || 'Неизвестный клиент'}
                        </h3>
                        <div className={`w-3 h-3 rounded-full ${getSourceColor(lastMessage.source)}`} />
                      </div>
                      
                      {client?.listing_title && (
                        <p className="text-sm text-gray-500 truncate mb-1">
                          📋 {client.listing_title}
                        </p>
                      )}
                      
                      <p className="text-sm text-gray-600 truncate">
                        {lastMessage.message_type === 'incoming' ? '' : 'Вы: '}
                        {lastMessage.content}
                      </p>
                      
                      <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
                        <div className="flex items-center space-x-1">
                          <FiClock className="w-3 h-3" />
                          <span>
                            {formatDistanceToNow(new Date(lastMessage.timestamp), { 
                              addSuffix: true, 
                              locale: ru 
                            })}
                          </span>
                        </div>
                        <span>{clientMessages.length} сообщений</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex flex-col items-end space-y-2">
                    {!lastMessage.is_read && lastMessage.message_type === 'incoming' && (
                      <div className="w-3 h-3 bg-blue-500 rounded-full" />
                    )}
                    {clientMessages.filter(m => m.message_type === 'incoming' && !m.is_read).length > 0 && (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {clientMessages.filter(m => m.message_type === 'incoming' && !m.is_read).length}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default Messages;