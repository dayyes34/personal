
import * as Tone from 'tone';
import instrumentsConfig from './instruments';

class AudioEngine {
  constructor() {
    this.isPlaying = false;
    this.bpm = 120;
    this.transport = Tone.Transport;
    this.transport.bpm.value = this.bpm;
    this.transport.timeSignature = [4, 4];
    this.sequences = [];
    this.currentBlockIndex = 0;
    this.totalBlocks = 0;
    this.instruments = {};

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

  // Получение инструмента
  getInstrument(instrumentId) {
    return this.instruments[instrumentId] || new Tone.Synth().toDestination();
  }

  // Установка BPM
  setBPM(bpm) {
    this.bpm = bpm;
    this.transport.bpm.value = bpm;
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
                note: cell.note || "C4",
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
    const blockDuration = "4n";
    let startTime = 0;

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
    this.transport.loopEnd = `${startTime}`;
    this.transport.loopStart = "0";

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
    return true;
  }

  // Переключение воспроизведения
  async togglePlay() {
    if (this.isPlaying) {
      this.pause();
    } else {
      await this.play();
    }
    return this.isPlaying;
  }
}

// Создаем синглтон аудио движка
const audioEngine = new AudioEngine();
export default audioEngine;
