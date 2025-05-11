# Интеграция Telegram SDK
В index.html добавь мета-теги:
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
    <script src="https://telegram.org/js/telegram-web-app.js"></script>

# Инициализация в твоем приложении
    import { useEffect, useState } from 'react';
    import { initTelegramApp } from './utils/telegramHelper';

    function App() {
    const [tgInfo, setTgInfo] = useState(null);

    useEffect(() => {
        // Инициализация Telegram Web App
        const info = initTelegramApp();
        setTgInfo(info);

        // Проверка запуска внутри Telegram
        if (!window.Telegram.WebApp) {
        console.warn('Приложение запущено вне Telegram');
        }
    }, []);

    // Остальной код компонента
    }

# Запуск секвенсора
    function SequencerComponent() {
    // Инициализация аудио контекста
    const [audioContext, setAudioContext] = useState(null);

    // Обработчик для кнопки Play
    const handlePlay = () => {
        // Если аудио контекст еще не создан - создаем
        if (!audioContext) {
        // AudioContext не может быть создан автоматически в браузерах
        // Он должен быть создан по клику пользователя
        const newContext = new (window.AudioContext || window.webkitAudioContext)();
        setAudioContext(newContext);
        }

        // Запускаем секвенсор
        // ...логика запуска

        // Сообщаем Telegram о действии (для haptic feedback)
        hapticFeedback.success();
    };

    return (
        <div>
        <Grid />
        <PlayButton onClick={handlePlay} />
        </div>
    );
    }

# Пример правильного запуска секвенсора

    // В компоненте секвенсора
    const startSequencer = async () => {
    try {
        // 1. Создание/возобновление аудио контекста
        if (!audioContext) {
        const ctx = new (window.AudioContext || window.webkitAudioContext)();
        setAudioContext(ctx);
        } else if (audioContext.state === 'suspended') {
        await audioContext.resume();
        }

        // 2. Запуск таймера для шагов
        setIsPlaying(true);
        const stepTime = 60000 / (tempo * 4); // время для 16-х нот

        // 3. Используем requestAnimationFrame для более точного таймера
        let lastStepTime = performance.now();
        let animationId;

        const tick = (timestamp) => {
        if (timestamp - lastStepTime >= stepTime) {
            // Переход к следующему шагу
            setCurrentStep(prev => (prev + 1) % 16);
            lastStepTime = timestamp;

            // Проигрывание звуков для текущего шага
            playCurrentStepSounds();
        }

        if (isPlaying) {
            animationId = requestAnimationFrame(tick);
        }
        };

        animationId = requestAnimationFrame(tick);

        // Сохраняем ID для остановки
        setAnimationFrameId(animationId);

        // 4. Сообщить Telegram
        hapticFeedback.success();
    } catch (error) {
        console.error('Error starting sequencer:', error);
        hapticFeedback.error();
    }
    };

# Итог: Полный цикл запуска Mini App
Пользователь открывает Mini App через бота
Загружается веб-приложение
Выполняется initTelegramApp():
Приложение сообщает, что оно готово
Получает тему и данные пользователя
Адаптирует UI
Пользователь взаимодействует с UI:
Нажимает кнопку Play
Создается AudioContext
Запускается секвенсор
При взаимодействии с UI:
Используется haptic feedback
Обновляется состояние в Telegram (например, MainButton)
Это обеспечит правильную интеграцию с Telegram и плавную работу секвенсора как Mini App!

# Важные особенности при работе с аудио в Mini App

# Ограничения Web Audio API:
    AudioContext должен быть создан после взаимодействия с пользователем
    Некоторые браузеры требуют direct user interaction

# Оптимизация для мобильных устройств:
    Используй буферизацию аудио
    Предзагружай аудио сэмплы
    Освобождай ресурсы, когда они не используются

# Запуск в Telegram:
    При работе внутри Telegram WebView есть ограничения
    Некоторые API могут не работать как ожидается
    Всегда проверяй в реальном окружении Telegram

# Как разрабатывать локально 🖥️
1. Создание мок-функций для Telegram API
Чтобы разрабатывать локально, можно создать мок-обертку для Telegram API:
// Мок для WebApp объекта Telegram
export const TelegramWebAppMock = {
  ready: () => console.log('WebApp ready called'),
  expand: () => console.log('WebApp expand called'),
  close: () => console.log('WebApp close called'),

  // Параметры для темы
  colorScheme: 'light', // 'dark' или 'light'
  backgroundColor: '#ffffff',
  textColor: '#000000',
  buttonColor: '#3e92d1',
  buttonTextColor: '#ffffff',

  // Мок для главной кнопки
  MainButton: {
    text: '',
    color: '#3e92d1',
    textColor: '#ffffff',
    isVisible: false,
    isActive: true,

    setText: function(text: string) {
      this.text = text;
      console.log(`MainButton text set to: ${text}`);
      return this;
    },

    show: function() {
      this.isVisible = true;
      console.log('MainButton shown');
      return this;
    },

    hide: function() {
      this.isVisible = false;
      console.log('MainButton hidden');
      return this;
    },

    onClick: function(callback: Function) {
      this._callback = callback;
      return this;
    },

    offClick: function() {
      this._callback = null;
      return this;
    },

    // Метод для тестов - имитирует клик
    simulateClick: function() {
      if (this._callback) this._callback();
    },

    _callback: null
  },

  // Мок для haptic feedback
  HapticFeedback: {
    impactOccurred: (style: string) => console.log(`Impact feedback: ${style}`),
    notificationOccurred: (type: string) => console.log(`Notification feedback: ${type}`),
    selectionChanged: () => console.log('Selection changed feedback')
  },

  // Мок для метода showAlert
  showAlert: (message: string) => {
    alert(message);
    return Promise.resolve();
  },

  // Мок для инициализационных данных
  initDataUnsafe: {
    user: {
      id: 123456789,
      first_name: "Test",
      last_name: "User",
      username: "testuser",
      language_code: "en"
    }
  }
};