import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FiSend, FiArrowLeft, FiPhone, FiUser, FiMoreVertical, FiX } from 'react-icons/fi';
import { clientService } from '../services/clientService';
import { messageService } from '../services/messageService';
import { aiService } from '../services/aiService';
import MessageBubble from '../components/MessageBubble';
import LoadingSpinner from '../components/LoadingSpinner';

const Chat = () => {
  const { clientId } = useParams();
  const navigate = useNavigate();
  const [client, setClient] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [aiSuggestions, setAiSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    loadChatData();
  }, [clientId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const loadChatData = async () => {
    try {
      setLoading(true);
      const [clientData, messagesData] = await Promise.all([
        clientService.getClient(clientId),
        messageService.getClientMessages(clientId)
      ]);
      
      setClient(clientData);
      setMessages(messagesData);
    } catch (err) {
      console.error('Error loading chat data:', err);
    } finally {
      setLoading(false);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || sending) return;

    setSending(true);
    try {
      const message = await messageService.sendResponse(clientId, newMessage);
      setMessages(prev => [...prev, message]);
      setNewMessage('');
      setShowSuggestions(false);
    } catch (err) {
      console.error('Error sending message:', err);
    } finally {
      setSending(false);
    }
  };

  const handleGetAISuggestions = async () => {
    try {
      const conversationHistory = messages.map(msg => msg.content);
      const response = await aiService.suggestResponse(clientId, conversationHistory);
      setAiSuggestions(response.suggestions || []);
      setShowSuggestions(true);
    } catch (err) {
      console.error('Error getting AI suggestions:', err);
    }
  };

  const handleUseSuggestion = (suggestion) => {
    setNewMessage(suggestion);
    setShowSuggestions(false);
  };

  const handleCall = async () => {
    try {
      await clientService.callClient(clientId);
    } catch (err) {
      console.error('Error calling client:', err);
    }
  };

  const handleCloseClient = async () => {
    try {
      await clientService.closeClient(clientId);
      navigate('/clients');
    } catch (err) {
      console.error('Error closing client:', err);
    }
  };

  if (loading) {
    return <LoadingSpinner text="Загрузка чата..." />;
  }

  if (!client) {
    return (
      <div className="p-4">
        <div className="text-center py-8">
          <p className="text-gray-500">Клиент не найден</p>
          <button
            onClick={() => navigate('/clients')}
            className="text-blue-600 hover:text-blue-800 text-sm underline mt-2"
          >
            Вернуться к клиентам
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      {/* Заголовок чата */}
      <div className="bg-white border-b border-gray-200 px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <button
              onClick={() => navigate('/clients')}
              className="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100"
            >
              <FiArrowLeft className="w-5 h-5" />
            </button>
            
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                <FiUser className="w-5 h-5 text-gray-500" />
              </div>
              <div>
                <h2 className="font-semibold text-gray-900">{client.name}</h2>
                {client.phone && (
                  <p className="text-sm text-gray-500">{client.phone}</p>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            {client.phone && (
              <button
                onClick={handleCall}
                className="p-2 text-green-600 hover:text-green-800 hover:bg-green-50 rounded-full transition-colors"
              >
                <FiPhone className="w-5 h-5" />
              </button>
            )}
            
            <div className="relative">
              <button
                onClick={handleCloseClient}
                className="p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-full transition-colors"
              >
                <FiX className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {client.listing_title && (
          <div className="mt-2 text-sm text-gray-600">
            📋 {client.listing_title}
          </div>
        )}
      </div>

      {/* Сообщения */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500">Нет сообщений</p>
          </div>
        ) : (
          messages.map((message) => (
            <MessageBubble
              key={message.id}
              message={message}
              isOwn={message.message_type === 'outgoing'}
            />
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* AI Предложения */}
      {showSuggestions && aiSuggestions.length > 0 && (
        <div className="bg-white border-t border-gray-200 p-4">
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-sm font-medium text-gray-900">AI Предложения:</h4>
            <button
              onClick={() => setShowSuggestions(false)}
              className="text-gray-400 hover:text-gray-600"
            >
              <FiX className="w-4 h-4" />
            </button>
          </div>
          <div className="space-y-2">
            {aiSuggestions.map((suggestion, index) => (
              <button
                key={index}
                onClick={() => handleUseSuggestion(suggestion)}
                className="w-full text-left p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors text-sm"
              >
                {suggestion}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Поле ввода */}
      <div className="bg-white border-t border-gray-200 p-4">
        <form onSubmit={handleSendMessage} className="flex space-x-2">
          <button
            type="button"
            onClick={handleGetAISuggestions}
            className="flex-shrink-0 p-2 text-purple-600 hover:text-purple-800 hover:bg-purple-50 rounded-full transition-colors"
            title="Получить AI предложения"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path d="M9 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path d="M9 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path d="M15 8a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </button>
          
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Напишите сообщение..."
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            disabled={sending}
          />
          
          <button
            type="submit"
            disabled={sending || !newMessage.trim()}
            className="flex-shrink-0 p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <FiSend className="w-5 h-5" />
          </button>
        </form>
      </div>
    </div>
  );
};

export default Chat;