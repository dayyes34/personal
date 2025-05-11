// SequencerExporter.js - Модуль для экспорта секвенсора в видео/GIF
import html2canvas from 'html2canvas';

class SequencerExporter {
  constructor() {
    this.isRecording = false;
    this.frames = [];
    this.recordingStartTime = 0;
    this.sequencerElement = null;
    this.visualScheduler = null;
    this.audioEngine = null;
    this.onProgressChange = null;
    this.onExportComplete = null;
    this.frameRate = 30;
    this.maxDuration = 30; // максимальная длительность в секундах
    this.transparentBackground = true;
    this.captureAudio = true; // Флаг для включения/отключения записи звука
    this.audioStream = null; // Поток аудио для записи
  }

  /**
   * Инициализация экспортера
   */
  initialize(options = {}) {
    this.frameRate = options.frameRate || 30;
    this.maxDuration = options.maxDuration || 30;
    this.transparentBackground = options.transparentBackground !== false;
    this.visualScheduler = options.visualScheduler || null;
    this.audioEngine = options.audioEngine || null;
    this.onProgressChange = options.onProgressChange || null;
    this.onExportComplete = options.onExportComplete || null;
    this.captureAudio = options.captureAudio !== false;

    // Находим DOM-элемент секвенсора
    const selector = options.sequencerSelector || '.sequencer-container';
    this.sequencerElement = document.querySelector(selector);

    if (!this.sequencerElement) {
      console.error(`Элемент секвенсора не найден по селектору: ${selector}`);
      return false;
    }

    return true;
  }

  /**
   * Начало записи секвенсора
   */
  
  startRecording() {
    if (this.isRecording) return false;

    if (!this.sequencerElement) {
      console.error('Элемент секвенсора не найден. Вызовите initialize() перед записью.');
      return false;
    }

    // Сбрасываем предыдущие кадры
    this.frames = [];
    this.isRecording = true;
    this.recordingStartTime = Date.now();

    // Если есть аудиодвижок, перезапускаем его для синхронизации
    if (this.audioEngine && typeof this.audioEngine.restart === 'function') {
      this.audioEngine.restart();
    }

    // Запускаем захват кадров
    this.captureFrames();

    // Устанавливаем таймаут для максимальной длительности
    this.recordingTimeout = setTimeout(() => {
      if (this.isRecording) {
        this.stopRecording();
      }
    }, this.maxDuration * 1000);

    return true;
  }

  /**
   * Остановка записи
   */
  async stopRecording() {
    if (!this.isRecording) return null;

    this.isRecording = false;
    clearTimeout(this.recordingTimeout);

    const recordingDuration = (Date.now() - this.recordingStartTime) / 1000;
    console.log(`Запись остановлена после ${recordingDuration.toFixed(2)} секунд. Захвачено ${this.frames.length} кадров.`);

    // Уведомляем о прогрессе
    if (this.onProgressChange) {
      this.onProgressChange({
        stage: 'processing',
        progress: 0,
        message: 'Обработка кадров...'
      });
    }

    return this.frames;
  }

  /**
 * Захват кадров с корректным таймингом
 */
async captureFrames() {
  if (!this.isRecording) return;

  const startCaptureTime = Date.now();

  try {
    // Захватываем кадр с улучшенным качеством
    const canvas = await html2canvas(this.sequencerElement, {
      backgroundColor: this.transparentBackground ? null : '#ffffff',
      scale: window.devicePixelRatio || 2,
      useCORS: true,
      allowTaint: true,
      logging: false,
      imageTimeout: 0,
      letterRendering: true,
      removeContainer: false,
      optimized: false
    });

    // Получаем данные кадра в максимальном качестве
    const dataUrl = canvas.toDataURL('image/png', 1.0);
    const timestamp = (Date.now() - this.recordingStartTime) / 1000;

    // Добавляем кадр в коллекцию
    this.frames.push({
      dataUrl,
      timestamp, // Сохраняем точное время кадра
      width: canvas.width,
      height: canvas.height
    });

    // Уведомляем о прогрессе
    if (this.onProgressChange) {
      const progress = Math.min(timestamp / this.maxDuration, 0.99);
      this.onProgressChange({
        stage: 'recording',
        progress,
        message: `Запись: ${this.frames.length} кадров`
      });
    }

    // Рассчитываем время, затраченное на захват кадра
    const captureTime = Date.now() - startCaptureTime;

    // Рассчитываем, сколько осталось ждать до следующего кадра
    const frameInterval = 1000 / this.frameRate;
    const waitTime = Math.max(0, frameInterval - captureTime);

    // Планируем следующий кадр с компенсацией времени на захват
    if (this.isRecording) {
      setTimeout(() => this.captureFrames(), waitTime);
    }
  } catch (error) {
    console.error('Ошибка при захвате кадра:', error);

    // При ошибке продолжаем захват через стандартный интервал
    if (this.isRecording) {
      setTimeout(() => this.captureFrames(), 1000 / this.frameRate);
    }
  }
}


  /**
   * Экспорт в GIF
   */
  async exportToGIF(options = {}) {
    const frames = options.frames || this.frames;
    const fps = options.fps || this.frameRate;

    if (!frames || frames.length === 0) {
      console.error('Нет кадров для создания GIF');
      return null;
    }

    // Проверяем наличие библиотеки gif.js
    if (typeof window.GIF === 'undefined') {
      // Пытаемся загрузить gif.js
      await this.loadScript('https://cdn.jsdelivr.net/npm/gif.js@0.2.0/dist/gif.min.js');

      if (typeof window.GIF === 'undefined') {
        console.error('Не удалось загрузить библиотеку gif.js');
        return null;
      }
    }

    // Уведомляем о прогрессе
    if (this.onProgressChange) {
      this.onProgressChange({
        stage: 'processing',
        progress: 0.1,
        message: 'Создание GIF...'
      });
    }

    return new Promise((resolve) => {
      // Создаем экземпляр GIF
      const gif = new window.GIF({
        workers: 2,
        quality: 10,
        workerScript: 'https://cdn.jsdelivr.net/npm/gif.js@0.2.0/dist/gif.worker.min.js',
        width: frames[0].width,
        height: frames[0].height,
        transparent: this.transparentBackground ? 0x00FF00 : null
      });

      // Обработчик прогресса
      gif.on('progress', (p) => {
        if (this.onProgressChange) {
          this.onProgressChange({
            stage: 'encoding',
            progress: 0.1 + p * 0.8, // 10% - 90%
            message: `Создание GIF... ${Math.round(p * 100)}%`
          });
        }
      });

      // Обработчик завершения
      gif.on('finished', (blob) => {
        if (this.onProgressChange) {
          this.onProgressChange({
            stage: 'completed',
            progress: 1,
            message: `GIF создан: ${Math.round(blob.size / 1024)} KB`
          });
        }

        // Возвращаем результат
        resolve({
          blob,
          type: 'image/gif',
          extension: 'gif',
          frames: frames.length
        });

        // Вызываем обработчик завершения
        if (this.onExportComplete) {
          this.onExportComplete({
            blob,
            url: URL.createObjectURL(blob),
            type: 'image/gif',
            extension: 'gif'
          });
        }
      });

      // Добавляем все кадры в GIF
      const delay = 1000 / fps; // Интервал кадров в миллисекундах

      let framesProcessed = 0;
      frames.forEach((frame) => {
        // Создаем изображение из dataUrl
        const img = new Image();
        img.src = frame.dataUrl;

        img.onload = () => {
          // Добавляем изображение в GIF
          gif.addFrame(img, { delay });
          framesProcessed++;

          // Если все кадры добавлены, рендерим GIF
          if (framesProcessed === frames.length) {
            if (this.onProgressChange) {
              this.onProgressChange({
                stage: 'processing',
                progress: 0.1,
                message: 'Рендеринг GIF...'
              });
            }
            gif.render();
          }
        };
      });
    });
  }

  /**
 * Экспорт в WebM (с прозрачностью)
 */
async exportToWebM(options = {}) {
  const frames = options.frames || this.frames;
  const fps = options.fps || this.frameRate;

  if (!frames || frames.length === 0) {
    console.error('Нет кадров для создания WebM');
    return null;
  }

  // Уведомляем о прогрессе
  if (this.onProgressChange) {
    this.onProgressChange({
      stage: 'processing',
      progress: 0.1,
      message: 'Подготовка к созданию WebM-видео...'
    });
  }

  // Создаем canvas для рендеринга
  const canvas = document.createElement('canvas');
  canvas.width = frames[0].width;
  canvas.height = frames[0].height;
  const ctx = canvas.getContext('2d');

  // Настраиваем MediaRecorder с точным контролем битрейта
  const stream = canvas.captureStream(fps);
  const recorder = new MediaRecorder(stream, {
    mimeType: 'video/webm;codecs=vp9',
    videoBitsPerSecond: 8000000 // Высокий битрейт для качества
  });

  // Готовим временные изображения для каждого кадра - ИСПРАВЛЕНО
  const images = [];
  for (let i = 0; i < frames.length; i++) {
    const img = new Image();
    img.src = frames[i].dataUrl;
    // Важно дождаться полной загрузки каждого изображения
    await new Promise((resolve, reject) => {
      img.onload = () => resolve();
      img.onerror = () => {
        console.error(`Ошибка загрузки изображения для кадра ${i}`);
        reject(new Error(`Ошибка загрузки изображения для кадра ${i}`));
      };
    });
    images.push(img);
  }

  // Уведомляем о прогрессе
  if (this.onProgressChange) {
    this.onProgressChange({
      stage: 'processing',
      progress: 0.2,
      message: 'Создание WebM-видео...'
    });
  }

  // Начинаем запись
  return new Promise((resolve) => {
    const chunks = [];
    recorder.ondataavailable = e => { 
      if (e.data.size > 0) chunks.push(e.data);
    };

    recorder.onstop = () => {
      const blob = new Blob(chunks, { type: 'video/webm' });

      if (this.onProgressChange) {
        this.onProgressChange({
          stage: 'completed',
          progress: 1,
          message: `WebM видео создано: ${Math.round(blob.size / 1024)} KB`
        });
      }

      // Возвращаем результат
      resolve({
        blob,
        type: 'video/webm',
        extension: 'webm',
        frames: frames.length
      });

      // Вызываем обработчик завершения
      if (this.onExportComplete) {
        this.onExportComplete({
          blob,
          url: URL.createObjectURL(blob),
          type: 'video/webm',
          extension: 'webm'
        });
      }
    };

    recorder.start();

    // ИСПРАВЛЕНИЕ: Используем правильную логику рендеринга с временными метками
    let frameIndex = 0;
    const startTime = performance.now();

    // Получаем базовую временную метку (первого кадра)
    const baseTimestamp = frames[0].timestamp || 0;

    const renderFramesByTimestamps = () => {
      if (frameIndex >= images.length) {
        // Закончили все кадры, останавливаем запись
        recorder.stop();
        return;
      }

      const now = performance.now();
      const elapsedSinceStart = (now - startTime) / 1000; // Секунды с начала рендеринга

      // Находим кадр для текущего времени
      let targetFrameIndex = frameIndex;

      // Просматриваем следующие кадры, чтобы найти тот, который должен отображаться сейчас
      while (targetFrameIndex < frames.length - 1) {
        const nextTimestamp = frames[targetFrameIndex + 1].timestamp || 0;
        const relativeTimestamp = nextTimestamp - baseTimestamp;

        if (relativeTimestamp <= elapsedSinceStart) {
          targetFrameIndex++;
        } else {
          break;
        }
      }

      // Если нашли новый кадр для отображения
      if (targetFrameIndex !== frameIndex) {
        frameIndex = targetFrameIndex;

        // Очищаем canvas с прозрачностью
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Проверка на валидность объекта изображения
        if (images[frameIndex] instanceof HTMLImageElement) {
          // Рисуем текущий кадр
          ctx.drawImage(images[frameIndex], 0, 0);
        } else {
          console.error(`Невалидное изображение для кадра ${frameIndex}`);
        }

        // Обновляем прогресс
        if (this.onProgressChange) {
          const progress = 0.2 + 0.7 * (frameIndex / images.length);
          this.onProgressChange({
            stage: 'encoding',
            progress,
            message: `Рендеринг видео: ${frameIndex + 1}/${images.length}`
          });
        }
      }

      // Если не достигли последнего кадра, продолжаем
      if (frameIndex < frames.length - 1) {
        requestAnimationFrame(renderFramesByTimestamps);
      } else {
        // Ждем немного после последнего кадра и завершаем запись
        setTimeout(() => {
          recorder.stop();
        }, 1000 / fps); // Минимальное время для последнего кадра
      }
    };

    // Запускаем рендеринг
    requestAnimationFrame(renderFramesByTimestamps);
  });
}

  /**
   * Экспорт в ZIP архив с отдельными кадрами
   */
  async exportToZIP(options = {}) {
    const frames = options.frames || this.frames;

    if (!frames || frames.length === 0) {
      console.error('Нет кадров для создания ZIP');
      return null;
    }

    // Проверяем наличие библиотеки JSZip
    if (typeof window.JSZip === 'undefined') {
      // Пытаемся загрузить JSZip
      await this.loadScript('https://cdnjs.cloudflare.com/ajax/libs/jszip/3.10.1/jszip.min.js');

      if (typeof window.JSZip === 'undefined') {
        console.error('Не удалось загрузить библиотеку JSZip');
        return null;
      }
    }

    // Уведомляем о прогрессе
    if (this.onProgressChange) {
      this.onProgressChange({
        stage: 'processing',
        progress: 0.1,
        message: 'Создание ZIP-архива...'
      });
    }

    // Создаем новый ZIP-архив
    const zip = new window.JSZip();

    // Добавляем каждый кадр в архив
    for (let i = 0; i < frames.length; i++) {
      // Получаем данные изображения (обрезаем префикс data:image/png;base64,)
      const base64Data = frames[i].dataUrl.split(',')[1];

      // Имя файла с ведущими нулями
      const fileName = `frame_${String(i).padStart(5, '0')}.png`;

      // Добавляем в ZIP
      zip.file(fileName, base64Data, { base64: true });

      // Обновляем прогресс
      if (this.onProgressChange) {
        const progress = 0.1 + 0.8 * (i / frames.length);
        this.onProgressChange({
          stage: 'processing',
          progress,
          message: `Добавление в ZIP: ${i + 1}/${frames.length}`
        });
      }
    }

    // Генерируем ZIP-архив
    if (this.onProgressChange) {
      this.onProgressChange({
        stage: 'processing',
        progress: 0.9,
        message: 'Сжатие ZIP-архива...'
      });
    }

    const blob = await zip.generateAsync({ type: 'blob', compression: 'DEFLATE' });

    if (this.onProgressChange) {
      this.onProgressChange({
        stage: 'completed',
        progress: 1,
        message: `ZIP-архив создан: ${Math.round(blob.size / 1024)} KB`
      });
    }

    // Возвращаем результат
    const result = {
      blob,
      type: 'application/zip',
      extension: 'zip',
      frames: frames.length
    };

    // Вызываем обработчик завершения
    if (this.onExportComplete) {
      this.onExportComplete({
        blob,
        url: URL.createObjectURL(blob),
        type: 'application/zip',
        extension: 'zip'
      });
    }

    return result;
  }

  /**
   * Загрузка скрипта
   */
  loadScript(url) {
    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = url;
      script.onload = resolve;
      script.onerror = reject;
      document.head.appendChild(script);
    });
  }

  /**
   * Загрузка файла
   */
  downloadFile(options = {}) {
    const { blob, fileName, type } = options;

    if (!blob) {
      console.error('Не указан blob для скачивания');
      return false;
    }

    try {
      const url = URL.createObjectURL(blob);
      const downloadName = fileName || `sequencer-export-${Date.now()}.${options.extension || 'bin'}`;

      const a = document.createElement('a');
      a.href = url;
      a.download = downloadName;
      document.body.appendChild(a);
      a.click();

      setTimeout(() => {
        URL.revokeObjectURL(url);
        document.body.removeChild(a);
      }, 100);

      return true;
    } catch (error) {
      console.error('Ошибка при скачивании файла:', error);
      return false;
    }
  }
}

// Создаем и экспортируем экземпляр
const sequencerExporter = new SequencerExporter();
export default sequencerExporter;