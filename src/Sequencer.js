import React, { useState } from 'react';
import './Sequencer.css';

function Sequencer() {
  // Определяем фиксированный список дорожек
  const trackNames = ['R', 'L', 'RF', 'LF'];

  // Структура данных для блоков
  const [blocks] = useState([
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
      }
  ]);

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

                    return (
                      <div
                        key={stepIndex}
                        className="grid-cell"
                        onClick={() => handleCellClick(blockIndex, trackName, stepIndex)}
                        data-global-step={globalStep}
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