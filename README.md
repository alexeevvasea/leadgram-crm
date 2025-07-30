# 🚀 Leadgram - Telegram WebApp CRM

**Мощная CRM система для продавцов в Telegram WebApp**

Leadgram - это современная CRM система, специально разработанная для работы в Telegram WebApp. Она помогает продавцам эффективно управлять клиентами, получающими сообщения через различные мессенджеры (Telegram, WhatsApp, OLX).

## 📱 Скриншоты

[Здесь будут скриншоты приложения]

## ✨ Основные функции

### 📊 Дашборд
- **Обзор продаж** - статистика по лидам, активным чатам, закрытым сделкам
- **Последние чаты** - быстрый доступ к активным беседам
- **Уведомления** - важные события и напоминания

### 👥 Управление клиентами
- **Единая база клиентов** - все контакты в одном месте
- **Фильтрация и поиск** - быстрый поиск по имени, телефону, объявлению
- **Статусы клиентов** - Новый, В работе, Закрыт
- **Источники** - Telegram, WhatsApp, OLX с цветовой индикацией

### 💬 Unified Inbox
- **Объединенные чаты** - все сообщения из разных источников
- **Групповка по объявлениям** - логическая организация переписок
- **Поиск по сообщениям** - полнотекстовый поиск
- **Непрочитанные сообщения** - счетчики и уведомления

### ⚠️ Секция "Требует внимания"
- **Высокая активность** - объявления с >5 сообщениями за 48ч
- **Низкая отзывчивость** - мало ответов на много сообщений
- **Неактивные клиенты** - нет активности >24 часов
- **Приоритизация** - автоматическое выявление проблем

### 🔗 Интеграции
- **Telegram Bot** - получение сообщений через Telegram API
- **WhatsApp Business** - интеграция с WhatsApp Business API
- **OLX** - синхронизация с объявлениями на OLX
- **Webhook система** - универсальный механизм интеграций

### 🤖 AI-Ассистент
- **Предложения ответов** - AI генерирует варианты ответов
- **Советы по продажам** - как закрыть сделку
- **Анализ объявлений** - рекомендации по улучшению
- **Кастомные запросы** - генерация ответов по вашим промптам

### ⚡ Автоматизация
- **Готовые шаблоны** - автоответчики, напоминания
- **n8n интеграция** - сложные workflow
- **Триггеры** - новое сообщение, нет ответа, по времени
- **Тестирование** - проверка работы автоматизации

## 🛠 Технологии

### Backend
- **FastAPI** - современный Python веб-фреймворк
- **MongoDB** - NoSQL база данных
- **Motor** - асинхронный драйвер MongoDB
- **Pydantic** - валидация данных
- **Telegram WebApp Auth** - аутентификация через Telegram

### Frontend
- **React 18** - современная библиотека UI
- **Tailwind CSS** - utility-first CSS фреймворк
- **React Router** - маршрутизация
- **Axios** - HTTP клиент
- **React Icons** - иконки
- **Date-fns** - работа с датами

### Особенности
- **Telegram WebApp SDK** - нативная интеграция с Telegram
- **Responsive Design** - адаптивный дизайн для всех устройств
- **PWA Ready** - готовность к работе как Progressive Web App
- **Dark Mode** - поддержка темной темы Telegram

## 🚀 Установка и запуск

### 1. Клонирование репозитория
```bash
git clone <your-repo-url>
cd leadgram
```

### 2. Настройка Backend
```bash
cd backend

# Установка зависимостей
pip install -r requirements.txt

# Настройка переменных окружения
cp .env.example .env
# Отредактируйте .env файл с вашими настройками

# Создание демо-данных (опционально)
python demo_data.py
```

### 3. Настройка Frontend
```bash
cd frontend

# Установка зависимостей
yarn install

# Настройка переменных окружения
cp .env.example .env
# Отредактируйте .env файл с URL вашего backend
```

### 4. Запуск приложения
```bash
# Запуск backend (в одном терминале)
cd backend
uvicorn server:app --host 0.0.0.0 --port 8001 --reload

# Запуск frontend (в другом терминале)
cd frontend
yarn start
```

### 5. Запуск через Docker (альтернатива)
```bash
# Сборка и запуск всех сервисов
docker-compose up --build

# Или в фоновом режиме
docker-compose up -d --build
```

## 📝 Переменные окружения

### Backend (.env)
```env
MONGO_URL=mongodb://localhost:27017
DB_NAME=leadgram_db
TELEGRAM_BOT_TOKEN=your_telegram_bot_token
ENVIRONMENT=development
N8N_WEBHOOK_URL=https://your-n8n-instance.com/webhook
```

### Frontend (.env)
```env
REACT_APP_BACKEND_URL=http://localhost:8001
REACT_APP_TELEGRAM_BOT_USERNAME=your_bot_username
```

## 🧪 Тестирование

### Backend тесты
Запустите юнит-тесты из корня проекта:
```bash
pytest backend/tests
```

### Frontend тесты
```bash
cd frontend
yarn test
```

### E2E тесты
```bash
# Запуск Playwright тестов
npx playwright test
```

## 📊 API Документация

После запуска backend, API документация доступна по адресу:
- **Swagger UI**: http://localhost:8001/docs
- **ReDoc**: http://localhost:8001/redoc

### Основные endpoints:

#### Клиенты
- `GET /api/clients` - получить список клиентов
- `POST /api/clients` - создать клиента
- `GET /api/clients/{id}` - получить клиента
- `PUT /api/clients/{id}` - обновить клиента
- `GET /api/clients/dashboard` - статистика дашборда

#### Сообщения
- `GET /api/messages` - получить сообщения
- `POST /api/messages/respond` - отправить ответ
- `GET /api/messages/client/{id}` - сообщения клиента
- `GET /api/messages/unread-count` - непрочитанные

#### Внимание
- `GET /api/attention/listings` - объявления требующие внимания
- `GET /api/attention/summary` - сводка

## 🔧 Настройка интеграций

### Telegram Bot
1. Создайте бота через @BotFather
2. Получите токен и добавьте в `.env`
3. Настройте webhook URL в интеграциях

### WhatsApp Business
1. Зарегистрируйтесь в WhatsApp Business API
2. Получите токен доступа
3. Настройте webhook endpoints

### OLX
1. Получите API ключи в личном кабинете OLX
2. Настройте уведомления о сообщениях
3. Добавьте webhook URL

### n8n Автоматизация
1. Установите n8n локально или используйте облачную версию
2. Создайте workflow для обработки событий
3. Настройте webhook endpoints в Leadgram

## 🎨 Кастомизация

### Темы
Приложение поддерживает темы Telegram:
- Светлая тема
- Темная тема
- Автоматическое переключение

### Цвета
Настройте цвета в `tailwind.config.js`:
```javascript
module.exports = {
  theme: {
    extend: {
      colors: {
        primary: '#2481cc',
        secondary: '#48bb78',
        // ...
      }
    }
  }
}
```

## 🔒 Безопасность

- **Telegram WebApp Auth** - безопасная аутентификация
- **CORS настройки** - ограничение доступа
- **Input валидация** - проверка всех входных данных
- **SQL Injection защита** - параметризованные запросы
- **XSS защита** - экранирование данных

## 📈 Производительность

- **Асинхронный backend** - высокая производительность
- **Lazy loading** - загрузка по требованию
- **Кэширование** - Redis для кэширования данных
- **CDN** - статические файлы через CDN
- **Минификация** - сжатие JS/CSS

## 🌍 Локализация

Приложение поддерживает:
- 🇷🇺 Русский язык (по умолчанию)
- 🇺🇸 Английский язык
- 🇺🇦 Украинский язык

## 🤝 Вклад в развитие

1. Fork репозитория
2. Создайте feature branch (`git checkout -b feature/amazing-feature`)
3. Commit изменения (`git commit -m 'Add amazing feature'`)
4. Push в branch (`git push origin feature/amazing-feature`)
5. Создайте Pull Request

## 📄 Лицензия

Этот проект лицензирован под MIT License - см. [LICENSE](LICENSE) файл.

## 🙋‍♂️ Поддержка

Если у вас есть вопросы или нужна помощь:

- 📧 Email: support@leadgram.com
- 💬 Telegram: @leadgram_support
- 🐛 Issues: [GitHub Issues](https://github.com/your-username/leadgram/issues)

## 📅 Roadmap

### v1.1 (Скоро)
- [ ] Групповые чаты
- [ ] Отчеты и аналитика
- [ ] Экспорт данных
- [ ] Мобильные push-уведомления

### v1.2 (Планируется)
- [ ] Интеграция с CRM системами
- [ ] API для разработчиков
- [ ] Белая маркировка
- [ ] Мультиязычность

### v2.0 (Будущее)
- [ ] AI-помощник для продаж
- [ ] Машинное обучение
- [ ] Прогнозирование продаж
- [ ] Расширенная автоматизация

---

**Сделано с ❤️ для продавцов в Telegram**