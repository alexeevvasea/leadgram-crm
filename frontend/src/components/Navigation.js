import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { FiHome, FiUsers, FiMessageCircle, FiAlertTriangle, FiSettings, FiZap } from 'react-icons/fi';

const Navigation = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const menuItems = [
    { path: '/', icon: FiHome, label: 'Главная' },
    { path: '/clients', icon: FiUsers, label: 'Клиенты' },
    { path: '/messages', icon: FiMessageCircle, label: 'Сообщения' },
    { path: '/attention', icon: FiAlertTriangle, label: 'Внимание' },
    { path: '/automation', icon: FiZap, label: 'Автоматизация' },
    { path: '/integrations', icon: FiSettings, label: 'Интеграции' },
  ];

  const isActive = (path) => {
    return location.pathname === path;
  };

  return (
    <nav className="bg-white border-t border-gray-200 px-4 py-2">
      <div className="flex justify-around max-w-md mx-auto">
        {menuItems.map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className={`flex flex-col items-center space-y-1 px-3 py-2 rounded-lg transition-colors ${
                isActive(item.path)
                  ? 'text-blue-600 bg-blue-50'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              <Icon className="w-5 h-5" />
              <span className="text-xs font-medium">{item.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};

export default Navigation;