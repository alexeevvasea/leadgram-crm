import React from 'react';
import { FiPhone, FiMessage, FiX, FiClock, FiUser } from 'react-icons/fi';
import { formatDistanceToNow } from 'date-fns';
import { ru } from 'date-fns/locale';

const ClientCard = ({ client, onCall, onMessage, onClose, onClick }) => {
  const getStatusColor = (status) => {
    switch (status) {
      case 'new': return 'bg-green-100 text-green-800';
      case 'in_progress': return 'bg-blue-100 text-blue-800';
      case 'closed': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'new': return 'Новый';
      case 'in_progress': return 'В работе';
      case 'closed': return 'Закрыт';
      default: return 'Неизвестно';
    }
  };

  const getSourceColor = (source) => {
    switch (source) {
      case 'telegram': return 'bg-blue-500';
      case 'whatsapp': return 'bg-green-500';
      case 'olx': return 'bg-purple-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <div 
      className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 hover:shadow-md transition-shadow cursor-pointer"
      onClick={onClick}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center space-x-3">
          <div className="flex-shrink-0">
            <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
              <FiUser className="w-5 h-5 text-gray-500" />
            </div>
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium text-gray-900 truncate">
              {client.name}
            </p>
            {client.phone && (
              <p className="text-sm text-gray-500 truncate">
                {client.phone}
              </p>
            )}
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(client.status)}`}>
            {getStatusText(client.status)}
          </span>
          <div className={`w-3 h-3 rounded-full ${getSourceColor(client.source)}`} title={client.source} />
        </div>
      </div>

      {client.listing_title && (
        <div className="mb-3">
          <p className="text-sm text-gray-600 truncate">
            📋 {client.listing_title}
          </p>
        </div>
      )}

      <div className="flex items-center justify-between">
        <div className="flex items-center text-sm text-gray-500">
          <FiClock className="w-4 h-4 mr-1" />
          {client.last_message_at ? (
            <span>
              {formatDistanceToNow(new Date(client.last_message_at), { 
                addSuffix: true, 
                locale: ru 
              })}
            </span>
          ) : (
            <span>Нет сообщений</span>
          )}
        </div>
        
        <div className="flex items-center space-x-2">
          {client.messages_count > 0 && (
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
              {client.messages_count}
            </span>
          )}
          
          <button
            onClick={(e) => {
              e.stopPropagation();
              onMessage(client.id);
            }}
            className="p-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-full transition-colors"
            title="Написать сообщение"
          >
            <FiMessage className="w-4 h-4" />
          </button>

          {client.phone && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onCall(client.id);
              }}
              className="p-2 text-green-600 hover:text-green-800 hover:bg-green-50 rounded-full transition-colors"
              title="Позвонить"
            >
              <FiPhone className="w-4 h-4" />
            </button>
          )}

          {client.status !== 'closed' && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onClose(client.id);
              }}
              className="p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-full transition-colors"
              title="Закрыть"
            >
              <FiX className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ClientCard;