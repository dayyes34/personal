import React, { useState, useEffect, useRef } from 'react';
import './SwingControl.css'; // Создайте похожий CSS файл

const SwingControl = ({ swing, onSwingChange, onClose }) => {
  const controlsRef = useRef(null);

  // Функция изменения Swing
  const changeSwing = (delta) => {
    const newSwing = Math.min(Math.max(0, swing + delta), 1);
    if (newSwing !== swing) {
      onSwingChange(newSwing);
    }
  };

  // Обработчик колесика мыши для изменения Swing
  const handleWheel = (e) => {
    e.preventDefault();
    changeSwing(e.deltaY > 0 ? -0.05 : 0.05);
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
      changeSwing(diff > 0 ? 0.05 : -0.05);
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

  // Для элементов управления Swing
  useEffect(() => {
    const controls = controlsRef.current;
    if (controls) {
      controls.addEventListener('wheel', handleWheel, { passive: false });
      return () => controls.removeEventListener('wheel', handleWheel);
    }
  }, [swing]);

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

  // Форматирование значения свинга для отображения (от 0 до 100%)
  const swingDisplay = `${Math.round(swing * 100)}%`;

  return (
    <div className="swing-popup-overlay">
      <div className="swing-popup-wrapper">
        <div 
          className="swing-controls"
          ref={controlsRef}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={() => ignoreTouchEnd || setTouchStartY(null)}
        >
          <div className="swing-buttons">
            <button 
              className="swing-button"
              onClick={() => changeSwing(-0.05)}
            >
              -
            </button>
            <div className="swing-value">
              {swingDisplay}
            </div>
            <button 
              className="swing-button"
              onClick={() => changeSwing(0.05)}
            >
              +
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SwingControl;