import React, { useState, useEffect, useRef } from 'react';
import './BpmControl.css';

const BpmControl = ({ bpm, onBpmChange, onClose }) => {
  const controlsRef = useRef(null);

  // Функция изменения BPM
  const changeBpm = (delta) => {
    const newBpm = Math.min(Math.max(40, bpm + delta), 200);
    if (newBpm !== bpm) {
      onBpmChange(newBpm);
    }
  };

  // Обработчик колесика мыши для изменения BPM
  const handleWheel = (e) => {
    e.preventDefault();
    changeBpm(e.deltaY > 0 ? -1 : 1);
  };

  // Обработчики для сенсорного управления
  const [touchStartY, setTouchStartY] = useState(null);
  const [ignoreTouchEnd, setIgnoreTouchEnd] = useState(false);

  const handleTouchStart = (e) => {
    setTouchStartY(e.touches[0].clientY);
    setIgnoreTouchEnd(false);
  };

  const handleTouchMove = (e) => {
    if (touchStartY === null) return;

    // Предотвращаем стандартное поведение скролла
    e.preventDefault();

    const touchY = e.touches[0].clientY;
    const diff = touchStartY - touchY;

    if (Math.abs(diff) > 5) {
      changeBpm(diff > 0 ? 1 : -1);
      setTouchStartY(touchY);
      setIgnoreTouchEnd(true);
    }
  };

  // Предотвращаем глобальный скролл когда меню открыто
  const preventGlobalScroll = (e) => {
    e.preventDefault();
  };

  // Устанавливаем глобальный обработчик для всех событий touchmove
  useEffect(() => {
    // Блокируем скролл на документе
    document.body.style.overflow = 'hidden';
    document.body.style.position = 'fixed';
    document.body.style.width = '100%';
    document.body.style.height = '100%';
    document.body.style.top = `-${window.scrollY}px`;

    // Добавляем специфичные для WebView атрибуты
    document.documentElement.style.overscrollBehavior = 'none';
    document.documentElement.style.webkitOverflowScrolling = 'none';

    // Добавляем глобальный перехватчик событий
    document.addEventListener('touchmove', preventGlobalScroll, { passive: false });

    return () => {
      // Восстанавливаем настройки при закрытии меню
      const scrollY = document.body.style.top;
      document.body.style.overflow = '';
      document.body.style.position = '';
      document.body.style.width = '';
      document.body.style.height = '';
      document.body.style.top = '';
      document.documentElement.style.overscrollBehavior = '';
      document.documentElement.style.webkitOverflowScrolling = '';

      window.scrollTo(0, parseInt(scrollY || '0') * -1);
      document.removeEventListener('touchmove', preventGlobalScroll);
    };
  }, []);

  // Для элементов управления BPM
  useEffect(() => {
    const controls = controlsRef.current;
    if (controls) {
      controls.addEventListener('wheel', handleWheel, { passive: false });
      return () => controls.removeEventListener('wheel', handleWheel);
    }
  }, [bpm]);

  // Закрываем меню при клике вне компонента
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (controlsRef.current && !controlsRef.current.contains(event.target)) {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [onClose]);

  return (
    <div className="bpm-popup-overlay">
      <div className="bpm-popup-wrapper">
        <div 
          className="bpm-controls"
          ref={controlsRef}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={() => !ignoreTouchEnd && setTouchStartY(null)}
        >
          <div className="bpm-buttons">
            <button 
              className="bpm-button"
              onClick={() => changeBpm(1)}
            >
              {bpm + 1}
            </button>
            <div className="bpm-value">
              {bpm}
            </div>
            <button 
              className="bpm-button"
              onClick={() => changeBpm(-1)}
            >
              {bpm - 1}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BpmControl;