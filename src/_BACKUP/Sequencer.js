import React, { useState, useEffect } from 'react';
import { BlocksStructure } from './Blocks';
import audioEngine from './AudioEngine'; // Импортируем аудио движок

// Импортируем данные из отдельного модуля
let trackNames = [];
let sequencerStructure = [];
let initialInstruments = {};

try {
  const sequencerData = require('./sequencerData');
  trackNames = sequencerData.trackNames || [];
  sequencerStructure = sequencerData.sequencerStructure || [];
  initialInstruments = sequencerData.initialInstruments || {};
} catch (error) {
  console.warn('Данные секвенсора не доступны:', error.message);
}

function Sequencer() {
  const [cellsState, setCellsState] = useState({});

  useEffect(() => {
    const initialState = {};

    if (Array.isArray(sequencerStructure)) {
      sequencerStructure.forEach((block, blockIndex) => {
        if (block && block.trackSteps) {
          if (Array.isArray(trackNames)) {
            trackNames.forEach(trackName => {
              const stepCount = block.trackSteps[trackName];

              if (stepCount && typeof stepCount === 'number') {
                for (let i = 0; i < stepCount; i++) {
                  const cellId = `${blockIndex}-${trackName}-${i}`;
                  initialState[cellId] = {
                    instrumentId: null
                  };
                }
              }
            });
          }
        }
      });
    }

    if (initialInstruments && typeof initialInstruments === 'object') {
      Object.entries(initialInstruments).forEach(([rowKey, cells]) => {
        if (cells && typeof cells === 'object') {
          Object.entries(cells).forEach(([cellIndex, instrumentId]) => {
            const cellId = `${rowKey}-${cellIndex}`;
            if (initialState[cellId]) {
              initialState[cellId] = { instrumentId };
            }
          });
        }
      });
    }

    setCellsState(initialState);



    // Очистка при размонтировании компонента
    return () => {
      audioEngine.stop();
    };
  }, []);

  // Обновляем аудио движок при изменении состояния ячеек
  useEffect(() => {
    if (Object.keys(cellsState).length > 0) {
      audioEngine.prepareSequencerData(sequencerStructure, cellsState);
    }
  }, [cellsState]);

  const handleCellClick = (cellId) => {
    setCellsState(prevState => {
      const cell = prevState[cellId] || { instrumentId: null };
      const newInstrumentId = cell.instrumentId ? null : 'default-instrument';

      return {
        ...prevState,
        [cellId]: {
          ...cell,
          instrumentId: newInstrumentId
        }
      };
    });

    console.log(`Clicked cell: ${cellId}`);
  };

  const getCellState = (cellId) => {
    return cellsState[cellId] || { instrumentId: null };
  };

  
  return (
    <>

      <BlocksStructure
        sequencerStructure={sequencerStructure}
        trackNames={trackNames}
        getCellState={getCellState}
        handleCellClick={handleCellClick}
      />
    </>
  );
}

export default Sequencer;