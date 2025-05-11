// Данные для секвенсора

// Список дорожек (треков)
export const trackNames = ['R', 'L', 'RF', 'LF'];

// Структура секвенсора с блоками и шагами для каждого трека
export const sequencerStructure = [
  { 
    id: 1, 
    name: "Блок 1",
    trackSteps: {
      'R': 4,
      'L': 4,
      'RF': 4,
      'LF': 4
    }
  },
  { 
    id: 2, 
    name: "Блок 2",
    trackSteps: {
      'R': 4,
      'L': 4,
      'RF': 4,
      'LF': 4
    }
  }
];

// Начальное состояние инструментов для ячеек
export const initialInstruments = {
  // Формат: "номер_блока-имя_трека": { "индекс_шага": "id_инструмента" }
  "0-R": {
    "0": "kick",
    "2": "kick"
  },
  "0-L": {
    "1": "snare",
    "3": "snare"
  },
  "1-R": {
    "0": "kick",
    "2": "kick"
  },
  "1-L": {
    "1": "snare",
    "3": "snare"
  },
  "1-RF": {
    "0": "hihat",
    "1": "hihat",
    "2": "hihat",
    "3": "hihat"
  }
};

// Экспорт по умолчанию для совместимости с импортом
export default {
  trackNames,
  sequencerStructure,
  initialInstruments
};
