import React, { useState, useEffect } from 'react';
import { FiAlertTriangle, FiArrowRight, FiRefreshCw } from 'react-icons/fi';
import { attentionService } from '../services/attentionService';

const AttentionPanel = ({ onViewListing }) => {
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadAttentionListings();
  }, []);

  const loadAttentionListings = async () => {
    try {
      setLoading(true);
      const data = await attentionService.getListingsRequiringAttention();
      setListings(data);
    } catch (err) {
      setError('Ошибка загрузки данных');
      console.error('Error loading attention listings:', err);
    } finally {
      setLoading(false);
    }
  };

  const getReasonText = (reason) => {
    switch (reason) {
      case 'high_volume': return 'Много сообщений';
      case 'low_response': return 'Мало ответов';
      case 'no_recent_activity': return 'Нет активности';
      default: return 'Требует внимания';
    }
  };

  const getReasonColor = (reason) => {
    switch (reason) {
      case 'high_volume': return 'text-orange-600 bg-orange-50';
      case 'low_response': return 'text-red-600 bg-red-50';
      case 'no_recent_activity': return 'text-gray-600 bg-gray-50';
      default: return 'text-yellow-600 bg-yellow-50';
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center space-x-3">
          <FiRefreshCw className="w-5 h-5 text-gray-400 animate-spin" />
          <span className="text-gray-500">Загрузка...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-red-200 p-6">
        <div className="flex items-center space-x-3">
          <FiAlertTriangle className="w-5 h-5 text-red-500" />
          <span className="text-red-600">{error}</span>
          <button
            onClick={loadAttentionListings}
            className="text-blue-600 hover:text-blue-800 text-sm underline"
          >
            Повторить
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-medium text-gray-900">
            Требует внимания
          </h3>
          <button
            onClick={loadAttentionListings}
            className="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100"
          >
            <FiRefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="p-4">
        {listings.length === 0 ? (
          <div className="text-center py-8">
            <FiAlertTriangle className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">
              Отлично! Все объявления под контролем
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {listings.map((listing, index) => (
              <div
                key={index}
                className="border border-gray-200 rounded-lg p-4 hover:shadow-sm transition-shadow"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900 mb-1">
                      {listing.listing_title}
                    </h4>
                    <p className="text-sm text-gray-600 mb-2">
                      {listing.details}
                    </p>
                    <div className="flex items-center space-x-2">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getReasonColor(listing.reason)}`}>
                        {getReasonText(listing.reason)}
                      </span>
                      {listing.incoming_count && (
                        <span className="text-xs text-gray-500">
                          {listing.incoming_count} сообщений
                        </span>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={() => onViewListing(listing.listing_id)}
                    className="ml-4 p-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-full transition-colors"
                  >
                    <FiArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AttentionPanel;