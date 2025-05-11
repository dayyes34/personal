import * as Tone from 'tone';
import instrumentsConfig from './instruments';

class AudioEngine {
  constructor() {
    this.isPlaying = false;
    this.bpm = 60;
    this.transport = Tone.Transport;
    this.transport.bpm.value = this.bpm;
    this.transport.timeSignature = [4, 4];
    this.sequences = [];
    this.currentBlockIndex = 0;
    this.totalBlocks = 0;
    this.instruments = {};
    this.stepCallback = null; // Для отслеживания текущего шага

    // Инициализируем инструменты
    this.initializeInstruments();
  }

  // Инициализация инструментов
  async initializeInstruments() {
    const loadPromises = Object.entries(instrumentsConfig).map(([instrumentId, config]) => {
      return new Promise(resolve => {
        const urls = {};
        for (const note in config.urls) {
          urls[note] = config.urls[note];
        }

        const sampler = new Tone.Sampler({
          urls: urls,
          baseUrl: config.baseUrl,
          onload: () => {
            if (typeof config.volume === 'number') {
              sampler.volume.value = config.volume;
            }

            this.instruments[instrumentId] = sampler;
            resolve();
          }
        }).toDestination();
      });
    });

    // Ждем загрузки всех инструментов
    await Promise.all(loadPromises);
  }

  // Установка callback для отслеживания шагов
  setStepCallback(callback) {
    this.stepCallback = callback;
  }

  // Получение инструмента
  getInstrument(instrumentId) {
    return this.instruments[instrumentId] || new Tone.Synth().toDestination();
  }

  // Установка BPM
  setBPM(bpm) {
    this.bpm = bpm;
    this.transport.bpm.value = bpm;
  }

  // Обновление только одной ячейки вместо пересчёта всей секвенции
  updateCell(blockIndex, trackName, stepIndex, instrumentId) {
    // Проверяем, инициализированы ли последовательности
    if (!this.sequences || !this.sequences[blockIndex]) {
      // Возможно, нужно сначала инициализировать структуру
      if (!this.sequences) {
        this.sequences = [];
      }
      while (this.sequences.length <= blockIndex) {
        this.sequences.push({});
      }
    }

    // Получаем или создаем расписание для указанного трека
    if (!this.sequences[blockIndex][trackName]) {
      this.sequences[blockIndex][trackName] = [];
    }

    const trackSteps = this.sequences[blockIndex][trackName];
    let stepCount = 16; // Значение по умолчанию, если нет других шагов

    // Если есть другие шаги, используем их количество для расчёта времени
    if (trackSteps.length > 0) {
      const lastStep = trackSteps[trackSteps.length - 1];
      if (lastStep && typeof lastStep.duration === 'number') {
        stepCount = Math.round(1 / lastStep.duration);
      }
    }

    const stepTime = stepIndex / stepCount;

    // Находим существующую запись для этого шага
    let existingStepIndex = -1;
    for (let i = 0; i < trackSteps.length; i++) {
      if (Math.abs(trackSteps[i].time - stepTime) < 0.001) {
        existingStepIndex = i;
        break;
      }
    }

    // Обрабатываем в зависимости от instrumentId
    if (instrumentId === null) {
      // Если instrumentId = null, удаляем шаг
      if (existingStepIndex !== -1) {
        trackSteps.splice(existingStepIndex, 1);
      }
    } else {
      // Обновляем существующий шаг или добавляем новый
      if (existingStepIndex !== -1) {
        trackSteps[existingStepIndex].instrumentId = instrumentId;
      } else {
        trackSteps.push({
          time: stepTime,
          note: 'C4', // Дефолтная нота
          instrumentId: instrumentId,
          duration: 1 / stepCount
        });
      }
    }

    // Перепланируем события в транспорте
    this.transport.cancel();
    this.scheduleBlocks();

    return true;
  }

  // Подготовка данных секвенсора к воспроизведению
  prepareSequencerData(sequencerStructure, cellsState) {
    this.sequences = [];
    this.totalBlocks = sequencerStructure.length;

    // Очищаем все существующие события
    this.transport.cancel();

    sequencerStructure.forEach((block, blockIndex) => {
      const trackSchedule = {};

      if (block && block.trackSteps) {
        Object.entries(block.trackSteps).forEach(([trackName, stepCount]) => {
          trackSchedule[trackName] = [];

          // Для каждого шага в треке
          for (let step = 0; step < stepCount; step++) {
            const cellId = `${blockIndex}-${trackName}-${step}`;
            const cell = cellsState[cellId];

            if (cell && cell.instrumentId) {
              // Рассчитываем время воспроизведения в долях блока
              const time = step / stepCount;

              trackSchedule[trackName].push({
                time,
                note: cell.note || 'C4',
                instrumentId: cell.instrumentId,
                duration: 1 / stepCount
              });
            }
          }
        });
      }

      this.sequences.push(trackSchedule);
    });

    // Настраиваем события
    this.scheduleBlocks();
    return true;
  }

  // Планирование воспроизведения блоков
  scheduleBlocks() {
    const blockDuration = '4n';
    let startTime = 0;

    // Добавляем отслеживание позиции
    this.transport.scheduleRepeat(time => {
      // Определяем текущий блок на основе времени
      const currentTime = this.transport.seconds;
      const blockDurationSeconds = Tone.Time(blockDuration).toSeconds();
      const totalDuration = blockDurationSeconds * this.totalBlocks;

      // Учитываем зацикливание для корректного определения блока
      const adjustedTime = currentTime % totalDuration;
      const currentBlock = Math.floor(adjustedTime / blockDurationSeconds);

      // Определяем прогресс внутри блока от 0 до 1
      const timeWithinBlock = adjustedTime % blockDurationSeconds;
      const stepProgress = timeWithinBlock / blockDurationSeconds;

      // Передаем информацию через callback
      if (this.stepCallback) {
        this.stepCallback(currentBlock, stepProgress);
      }
    }, '32n'); // Частое обновление для плавного отображения

    this.sequences.forEach((blockTracks, blockIndex) => {
      Object.entries(blockTracks).forEach(([trackName, events]) => {
        events.forEach(event => {
          // Рассчитываем абсолютное время
          const absoluteTime = startTime + event.time * Tone.Time(blockDuration).toSeconds();

          // Планируем событие в транспорте
          this.transport.schedule(time => {
            const instrument = this.getInstrument(event.instrumentId);
            instrument.triggerAttackRelease(
              event.note,
              event.duration * Tone.Time(blockDuration).toSeconds(),
              time
            );
          }, absoluteTime);
        });
      });

      // Увеличиваем время для следующего блока
      startTime += Tone.Time(blockDuration).toSeconds();
    });

    // Устанавливаем цикл
    this.transport.loop = true;
    this.transport.loopEnd = startTime;
    this.transport.loopStart = 0;

    return true;
  }

  // Начать воспроизведение
  async play() {
    await Tone.start();
    if (!this.isPlaying) {
      this.transport.start();
      this.isPlaying = true;
    }

    return true;
  }

  // Остановить воспроизведение (пауза)
  pause() {
    if (this.isPlaying) {
      this.transport.pause();
      this.isPlaying = false;
    }
    return true;
  }

  // Полная остановка (возврат в начало)
  stop() {
    this.transport.stop();
    this.isPlaying = false;

    // Сбрасываем отображение активной ячейки через callback
    if (this.stepCallback) {
      this.stepCallback(null, null);
    }

    return true;
  }

  // Переключение воспроизведения
  async togglePlay() {
    if (this.isPlaying) {
      this.stop();
    } else {
      await this.play();
    }

    return this.isPlaying;
  }
}

// Создаем синглтон аудио движка
const audioEngine = new AudioEngine();
export default audioEngine;