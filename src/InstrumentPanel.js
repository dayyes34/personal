import React, { useState } from 'react';
import instruments from './instruments';
import './InstrumentPanel.css';

const InstrumentPanel = ({ onInstrumentSelect, onClearAll }) => {
  // Изначально ничего не выбрано
  const [selectedInstrument, setSelectedInstrument] = useState(null);

  // Обработчик выбора инструмента
  const handleInstrumentSelect = (instrumentId) => {
    if (selectedInstrument === instrumentId) {
      setSelectedInstrument(null);
      onInstrumentSelect?.(null, { id: null, name: "" });
    } else {
      setSelectedInstrument(instrumentId);
      if (onInstrumentSelect) {
        if (instrumentId === 'eraser') {
          onInstrumentSelect(instrumentId, { id: instrumentId, name: "Ластик" });
        } else {
          onInstrumentSelect(instrumentId, instruments[instrumentId]);
        }
      }
    }
  };

  return (
    <div className="instrument-panel">
      <div className="instrument-list">
        {Object.keys(instruments).map((instrumentId) => (
          <div
            key={instrumentId}
            className={`instrument-item ${selectedInstrument === instrumentId ? 'selected' : ''}`}
            onClick={() => handleInstrumentSelect(instrumentId)}
            title={instruments[instrumentId].name}
          >
            <img src={instruments[instrumentId].icon} alt={instruments[instrumentId].name} />
          </div>
        ))}
        
        <div
          className={`instrument-item eraser ${selectedInstrument === 'eraser' ? 'selected' : ''}`}
          onClick={() => handleInstrumentSelect('eraser')}
          title="Ластик"
        >
          <img src="/icons/eraser.png" alt="Ластик" />
        </div>
      </div>
      
      <button 
        className="clear-button"
        onClick={onClearAll}
        title="Очистить все ячейки"
      >
        <span className="clear-icon">×</span>
      </button>
    </div>
  );
};

export default InstrumentPanel;