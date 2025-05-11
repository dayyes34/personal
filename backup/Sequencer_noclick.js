import React, { useState } from 'react';
import './Sequencer.css';

function Sequencer() {
  // Определяем фиксированный список дорожек
  const trackNames = ['R', 'L', 'RF', 'LF'];

  // Структура данных для блоков с ячейками, содержащими информацию об инструментах
  const [blocks, setBlocks] = useState([
    { 
      id: 1, 
      name: "Блок 1",
      trackSteps: {
        'R': {
          stepCount: 4,
          cells: [
            { id: 'R-0', instrumentId: 'kick', isActive: true },
            { id: 'R-1', instrumentId: null, isActive: false },
            { id: 'R-2', instrumentId: 'kick', isActive: true },
            { id: 'R-3', instrumentId: null, isActive: false }
          ]
        },
        'L': {
          stepCount: 4,
          cells: [
            { id: 'L-0', instrumentId: null, isActive: false },
            { id: 'L-1', instrumentId: 'snare', isActive: true },
            { id: 'L-2', instrumentId: null, isActive: false },
            { id: 'L-3', instrumentId: 'snare', isActive: true }
          ]
        },
        'RF': {
          stepCount: 4,
          cells: [
            { id: 'RF-0', instrumentId: null, isActive: false },
            { id: 'RF-1', instrumentId: null, isActive: false },
            { id: 'RF-2', instrumentId: null, isActive: false },
            { id: 'RF-3', instrumentId: null, isActive: false }
          ]
        },
        'LF': {
          stepCount: 4,
          cells: [
            { id: 'LF-0', instrumentId: null, isActive: false },
            { id: 'LF-1', instrumentId: null, isActive: false },
            { id: 'LF-2', instrumentId: null, isActive: false },
            { id: 'LF-3', instrumentId: null, isActive: false }
          ]
        }
      }
    }
  ]);

  // Обработчик клика по ячейке
  const handleCellClick = (blockIndex, trackName, cellIndex) => {
    const block = blocks[blockIndex];
    const cell = block.trackSteps[trackName].cells[cellIndex];

    // Здесь можно добавить логику переключения инструмента
    const newInstrumentId = cell.instrumentId ? null : 'default-instrument';

    const updatedBlocks = [...blocks];
    updatedBlocks[blockIndex].trackSteps[trackName].cells[cellIndex] = {
      ...cell,
      instrumentId: newInstrumentId,
      isActive: !!newInstrumentId
    };

    setBlocks(updatedBlocks);
    console.log(`Clicked: Block ${block.id}, Track ${trackName}, Cell ${cellIndex}, Address: ${cell.id}`);
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
                  {block.trackSteps[trackName].cells.map((cell, cellIndex) => (
                    <div
                      key={cell.id}
                      className={`grid-cell ${cell.isActive ? 'active' : ''}`}
                      onClick={() => handleCellClick(blockIndex, trackName, cellIndex)}
                      data-cell-id={cell.id}
                    >
                      {cell.instrumentId && <span className="instrument-indicator">{cell.instrumentId}</span>}
                    </div>
                  ))}
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