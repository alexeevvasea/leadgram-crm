import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiAlertTriangle, FiRefreshCw, FiArrowRight } from 'react-icons/fi';
import { attentionService } from '../services/attentionService';
import LoadingSpinner from '../components/LoadingSpinner';

const Attention = () => {
  const navigate = useNavigate();
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadAttentionData();
  }, []);

  const loadAttentionData = async () => {
    try {
      setLoading(true);
      const data = await attentionService.getListingsRequiringAttention();
      setListings(data);
    } catch (err) {
      setError('Ошибка загрузки данных');
      console.error('Error loading attention data:', err);
    } finally {
      setLoading(false);
    }
  };

  const getReasonText = (reason) => {
    switch (reason) {
      case 'high_volume': return 'Много входящих сообщений';
      case 'low_response': return 'Мало ответов от вас';
      case 'no_recent_activity': return 'Нет активности более суток';
      default: return 'Требует внимания';
    }
  };

  const getReasonColor = (reason) => {
    switch (reason) {
      case 'high_volume': return 'text-orange-600 bg-orange-50 border-orange-200';
      case 'low_response': return 'text-red-600 bg-red-50 border-red-200';
      case 'no_recent_activity': return 'text-gray-600 bg-gray-50 border-gray-200';
      default: return 'text-yellow-600 bg-yellow-50 border-yellow-200';
    }
  };

  const getPriorityIcon = (reason) => {
    switch (reason) {
      case 'high_volume': return '🔥';
      case 'low_response': return '⚠️';
      case 'no_recent_activity': return '⏰';
      default: return '❗';
    }
  };

  const handleViewListing = (listingId) => {
    navigate(`/listing/${listingId}`);
  };

  if (loading) {
    return <LoadingSpinner text="Загрузка объявлений..." />;
  }

  return (
    <div className="p-4 space-y-6">
      {/* Заголовок */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Требует внимания
          </h1>
          <p className="text-gray-600 mt-1">
            Объявления с повышенной активностью или проблемами
          </p>
        </div>
        <button
          onClick={loadAttentionData}
          className="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100"
        >
          <FiRefreshCw className="w-5 h-5" />
        </button>
      </div>

      {/* Ошибка */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center space-x-3">
            <FiAlertTriangle className="w-5 h-5 text-red-500" />
            <span className="text-red-600">{error}</span>
            <button
              onClick={loadAttentionData}
              className="text-blue-600 hover:text-blue-800 text-sm underline"
            >
              Повторить
            </button>
          </div>
        </div>
      )}

      {/* Контент */}
      {listings.length === 0 ? (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl">✅</span>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Отлично! Все под контролем
          </h3>
          <p className="text-gray-600 max-w-md mx-auto">
            Все ваши объявления работают нормально. Никаких проблем не обнаружено.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Статистика */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <h3 className="text-lg font-medium text-gray-900 mb-3">
              Сводка проблем
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600">
                  {listings.filter(l => l.reason === 'high_volume').length}
                </div>
                <div className="text-sm text-gray-600">Высокая активность</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-red-600">
                  {listings.filter(l => l.reason === 'low_response').length}
                </div>
                <div className="text-sm text-gray-600">Мало ответов</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-600">
                  {listings.filter(l => l.reason === 'no_recent_activity').length}
                </div>
                <div className="text-sm text-gray-600">Нет активности</div>
              </div>
            </div>
          </div>

          {/* Список объявлений */}
          <div className="space-y-4">
            {listings.map((listing, index) => (
              <div
                key={index}
                className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-3">
                    <div className="text-2xl mt-1">
                      {getPriorityIcon(listing.reason)}
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900 mb-1">
                        {listing.listing_title}
                      </h4>
                      <p className="text-sm text-gray-600 mb-3">
                        {listing.details}
                      </p>
                      
                      {/* Дополнительная информация */}
                      <div className="flex items-center space-x-4 text-sm text-gray-500">
                        {listing.incoming_count && (
                          <span>📨 {listing.incoming_count} сообщений</span>
                        )}
                        {listing.outgoing_count !== undefined && (
                          <span>📤 {listing.outgoing_count} ответов</span>
                        )}
                        {listing.client_name && (
                          <span>👤 {listing.client_name}</span>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${getReasonColor(listing.reason)}`}>
                      {getReasonText(listing.reason)}
                    </span>
                    <button
                      onClick={() => handleViewListing(listing.listing_id)}
                      className="p-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-full transition-colors"
                    >
                      <FiArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Attention;