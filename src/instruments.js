// Определяем доступные инструменты и их звуковые файлы
const instruments = {
  'kick': {
    urls: {
      C4: "kick.mp3",
    },
    baseUrl: "./samples/drums/",
    volume: 0,
    icon: "./icons/kick.PNG", // Добавляем иконку
    name: "Бас-барабан" // Добавляем понятное название
  },
  'snare': {
    urls: {
      C4: "snare.mp3",
    },
    baseUrl: "./samples/drums/",
    volume: 0,
    icon: "./icons/snare.png",
    name: "Малый барабан"
  },
  'hihat': {
    urls: {
      C4: "hihat.mp3",
    },
    baseUrl: "./samples/drums/",
    volume: -3, // Немного тише
    icon: "./icons/hihat.png",
    name: "Хай-хэт"
  },
  'tom': {
    urls: {
      C4: "tom.mp3",
    },
    baseUrl: "./samples/drums/",
    volume: 0,
    icon: "./icons/tom.png",
    name: "Том"
  },
  'default-instrument': {
    urls: {
      C4: "default.mp3",
    },
    baseUrl: "./samples/",
    volume: 0,
    icon: "./icons/default.png",
    name: "По умолчанию"
  },
};

export default instruments;