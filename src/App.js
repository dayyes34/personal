import React, { useState, useRef } from 'react';
import './App.css';
import Sequencer from './Sequencer';
import InstrumentPanel from './InstrumentPanel';

function App() {
  const [currentInstrument, setCurrentInstrument] = useState(null);
  const sequencerRef = useRef(null);

  const handleInstrumentSelect = (instrumentId, instrumentConfig) => {
    console.log('Выбран инструмент:', instrumentId);
    console.log('Конфигурация:', instrumentConfig);
    setCurrentInstrument({ id: instrumentId, config: instrumentConfig });
  };

  const handleClearAll = () => {
    // Вызываем метод очистки всех ячеек через ref
    if (sequencerRef.current) {
      sequencerRef.current.clearAllCells();
    }
  };

  return (
    <div className="App">
      <div className="cover-container">
        <img 
          src="cover.PNG" 
          alt="Обложка" 
          className="cover-image" 
        />
      </div>

      <div className="main-content">
        <InstrumentPanel 
          onInstrumentSelect={handleInstrumentSelect} 
          onClearAll={handleClearAll}
        />

        <div className="sequencer-container">
          <Sequencer 
            selectedInstrument={currentInstrument} 
            ref={sequencerRef}
          />
        </div>
      </div>
    </div>
  );
}

export default App;