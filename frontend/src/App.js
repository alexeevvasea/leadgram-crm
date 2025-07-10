import React, { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import './App.css';

// Импорт страниц
import Dashboard from './pages/Dashboard';
import Clients from './pages/Clients';
import Messages from './pages/Messages';
import Chat from './pages/Chat';
import Attention from './pages/Attention';
import Integrations from './pages/Integrations';
import Automation from './pages/Automation';

// Импорт компонентов
import Navigation from './components/Navigation';
import LoadingSpinner from './components/LoadingSpinner';

function App() {
  const [isLoading, setIsLoading] = useState(true);
  const [telegramUser, setTelegramUser] = useState(null);

  useEffect(() => {
    // Инициализация Telegram WebApp
    const initTelegramWebApp = () => {
      if (window.Telegram && window.Telegram.WebApp) {
        const tg = window.Telegram.WebApp;
        
        // Настройка WebApp
        tg.ready();
        tg.expand();
        
        // Получение данных пользователя
        if (tg.initDataUnsafe && tg.initDataUnsafe.user) {
          setTelegramUser(tg.initDataUnsafe.user);
        }
        
        // Настройка темы
        if (tg.colorScheme === 'dark') {
          document.documentElement.classList.add('dark');
        }
        
        // Настройка кнопок
        tg.MainButton.hide();
        tg.BackButton.hide();
        
        console.log('Telegram WebApp initialized:', tg.initDataUnsafe);
      } else {
        console.log('Running outside Telegram WebApp');
      }
      
      setIsLoading(false);
    };

    // Загружаем Telegram WebApp SDK
    const script = document.createElement('script');
    script.src = 'https://telegram.org/js/telegram-web-app.js';
    script.async = true;
    script.onload = initTelegramWebApp;
    script.onerror = () => {
      console.log('Failed to load Telegram WebApp SDK');
      setIsLoading(false);
    };
    
    document.head.appendChild(script);

    return () => {
      document.head.removeChild(script);
    };
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <LoadingSpinner text="Загрузка Leadgram..." />
      </div>
    );
  }

  return (
    <div className="App bg-gray-50 min-h-screen">
      <BrowserRouter>
        <div className="flex flex-col min-h-screen">
          {/* Основной контент */}
          <main className="flex-1 pb-20">
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/clients" element={<Clients />} />
              <Route path="/messages" element={<Messages />} />
              <Route path="/chat/:clientId" element={<Chat />} />
              <Route path="/attention" element={<Attention />} />
              <Route path="/integrations" element={<Integrations />} />
              <Route path="/automation" element={<Automation />} />
            </Routes>
          </main>

          {/* Нижняя навигация */}
          <div className="fixed bottom-0 left-0 right-0 z-50">
            <Navigation />
          </div>
        </div>
      </BrowserRouter>
    </div>
  );
}

export default App;
