import React, { useState } from 'react';
import './Sequencer.css';

function Sequencer({ currentPlayingStep = -1 }) {
  // Определяем фиксированный список дорожек
  const trackNames = ['R', 'L', 'RF', 'LF'];

  // Структура данных для блоков
  const [blocks, setBlocks] = useState([
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
    },
    {
      id: 3,
      name: "Блок 3",
      trackSteps: {
        'R': 4,
        'L': 4,
        'RF': 4,
        'LF': 4
      }
    },
    {
      id: 4,
      name: "Блок 4",
      trackSteps: {
        'R': 4,
        'L': 4,
        'RF': 4,
        'LF': 4
      }
    },
    {
      id: 5,
      name: "Блок 5",
      trackSteps: {
        'R': 4,
        'L': 4,
        'RF': 4,
        'LF': 4
      }
    },
  ]);

  // Добавляем состояние для активных ячеек
  const [activeCells, setActiveCells] = useState({});

  // Функция для расчета глобального индекса шага для конкретной дорожки
  const calculateGlobalStep = (blockIndex, trackName, stepIndex) => {
    let globalStep = stepIndex;

    // Добавляем количество шагов из предыдущих блоков только для этой дорожки
    for (let i = 0; i < blockIndex; i++) {
      globalStep += blocks[i].trackSteps[trackName];
    }

    return globalStep;
  };

  // Обработчик клика по ячейке
  const handleCellClick = (blockIndex, trackName, stepIndex) => {
    const globalStepIndex = calculateGlobalStep(blockIndex, trackName, stepIndex);
    console.log(`Clicked: Block ${blocks[blockIndex].id}, Track ${trackName}, Step ${stepIndex}, Global Step ${globalStepIndex}`);

    // Формируем уникальный идентификатор для ячейки
    const cellId = `${blocks[blockIndex].id}-${trackName}-${stepIndex}`;

    // Переключаем состояние ячейки
    setActiveCells(prev => ({
      ...prev,
      [cellId]: !prev[cellId]
    }));
  };

  // Функция для проверки активности ячейки
  const isCellActive = (blockId, trackName, stepIndex) => {
    const cellId = `${blockId}-${trackName}-${stepIndex}`;
    return activeCells[cellId];
  };

  // Функция для проверки, является ли ячейка текущей при воспроизведении
  const isCurrentCell = (blockIndex, trackName, stepIndex) => {
    if (currentPlayingStep === -1) return false;

    const globalStep = calculateGlobalStep(blockIndex, trackName, stepIndex);
    return globalStep === currentPlayingStep;
  };

  return (
    <div className="blocks-container">
      {blocks.map((block, blockIndex) => (
        <div key={block.id} className="block-container">
          <div className="sequencer">
            <div className="sequencer-header">
              <h2>{block.name}</h2>
              <button className="loop-button">LOOP</button>
            </div>

            <div className="grid">
              {trackNames.map(trackName => (
                <div key={trackName} className="track-row">
                  {Array.from({ length: block.trackSteps[trackName] }).map((_, stepIndex) => {
                    const globalStep = calculateGlobalStep(blockIndex, trackName, stepIndex);
                    const isActive = isCellActive(block.id, trackName, stepIndex);
                    const isCurrent = isCurrentCell(blockIndex, trackName, stepIndex);

                    return (
                      <div
                        key={stepIndex}
                        className={`grid-cell ${isActive ? 'active' : ''} ${isCurrent ? 'current' : ''}`}
                        onClick={() => handleCellClick(blockIndex, trackName, stepIndex)}
                        data-globalstep={globalStep}
                      />
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export default Sequencer;