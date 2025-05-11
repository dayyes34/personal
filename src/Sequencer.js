import React, { useState, useEffect, useImperativeHandle, forwardRef } from 'react';
import { BlocksStructure } from './Blocks';
import sequencerDataImport from './sequencerData'; // Импортируем данные из отдельного модуля

// Инициализируем данные из импорта
let trackNames = sequencerDataImport.trackNames || [];
let sequencerStructure = sequencerDataImport.sequencerStructure || [];
let initialInstruments = sequencerDataImport.initialInstruments || {};

const Sequencer = forwardRef(({ selectedInstrument }, ref) => {
  const [cellsState, setCellsState] = useState({});

  // Экспортируем методы через ref для использования в родительском компоненте
  useImperativeHandle(ref, () => ({
    clearAllCells: () => {
      if (window.confirm('Вы уверены, что хотите очистить все ячейки?')) {
        // Создаем новое состояние, где все ячейки пустые
        const clearedState = {};
        Object.keys(cellsState).forEach(cellId => {
          clearedState[cellId] = {
            ...cellsState[cellId],
            instrumentId: null
          };
        });
        setCellsState(clearedState);
      }
    }
  }));

  // Инициализация начального состояния ячеек
  useEffect(() => {
    const initialState = {};

    if (Array.isArray(sequencerStructure)) {
      sequencerStructure.forEach((block, blockIndex) => {
        if (block && block.trackSteps) {
          if (Array.isArray(trackNames)) {
            trackNames.forEach((trackName) => {
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
              initialState[cellId].instrumentId = instrumentId;
            }
          });
        }
      });
    }

    setCellsState(initialState);
  }, []);

  // Обработчик клика по ячейке
  const handleCellClick = (cellId) => {
    // Получаем ID выбранного инструмента из props
    const selectedInstrumentId = selectedInstrument?.id;

    // Если инструмент не выбран (null или undefined), ничего не делаем
    if (selectedInstrumentId === null || selectedInstrumentId === undefined) {
      console.log("Инструмент не выбран, клик по ячейке игнорируется");
      return;
    }

    setCellsState(prevState => {
      const cell = prevState[cellId] || { instrumentId: null };

      // Обработка ластика
      if (selectedInstrumentId === 'eraser') {
        // Если в ячейке что-то есть - удаляем, иначе ничего не меняем
        if (cell.instrumentId) {
          return {
            ...prevState,
            [cellId]: {
              ...cell,
              instrumentId: null
            }
          };
        }
        return prevState; // Ничего не меняем, если ячейка пустая
      }

      // Определяем, какой инструмент должен быть в ячейке после клика
      let newInstrumentId;

      // Если ячейка пустая - добавляем выбранный инструмент
      if (!cell.instrumentId) {
        newInstrumentId = selectedInstrumentId;
      } 
      // Если тот же инструмент уже в ячейке - убираем его
      else if (cell.instrumentId === selectedInstrumentId) {
        newInstrumentId = null;
      } 
      // Если в ячейке другой инструмент - заменяем на выбранный
      else {
        newInstrumentId = selectedInstrumentId;
      }

      return {
        ...prevState,
        [cellId]: {
          ...cell,
          instrumentId: newInstrumentId
        }
      };
    });

    console.log(`Clicked cell: ${cellId}, instrument: ${selectedInstrumentId || 'none'}`);
  };

  // getCellState остается без изменений
  const getCellState = (cellId) => {
    return cellsState[cellId] || { instrumentId: null };
  };

  return (
    <BlocksStructure
      sequencerStructure={sequencerStructure}
      trackNames={trackNames}
      getCellState={getCellState}
      handleCellClick={handleCellClick}
    />
  );
});

export default Sequencer;