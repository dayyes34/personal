import React from 'react';
import './Sequencer.css';

export const BlocksStructure = ({ 
  sequencerStructure, 
  trackNames, 
  getCellState, 
  handleCellClick
}) => (
  <div className="blocks-container">
    {sequencerStructure.map((block, blockIndex) => (
      <div 
        key={block.id || `block-${blockIndex}`} 
        className="block-container"
      >
        <div className="sequencer">
          <div className="sequencer-header">
            <h2>{block.name}</h2>
            <button className="loop-button">LOOP</button>
          </div>

          <div className="grid">
            {trackNames.map(trackName => (
              <div key={trackName} className="track-row">
                {Array.from({ length: block.trackSteps[trackName] }, (_, stepIndex) => {
                  const cellId = `${blockIndex}-${trackName}-${stepIndex}`;
                  const cellState = getCellState(cellId);
                  const isActive = !!cellState.instrumentId;

                  return (
                    <div
                      key={cellId}
                      className={`grid-cell ${isActive ? 'active' : ''}`}
                      onClick={() => handleCellClick(cellId)}
                      data-cell-id={cellId}
                    >
                      {cellState.instrumentId && (
                        <img 
                          src={`./icons/${cellState.instrumentId}.png`}
                          alt={cellState.instrumentId}
                          className="cell-instrument-icon"
                          title={cellState.instrumentId} // Всплывающая подсказка с названием инструмента
                        />
                      )}
                    </div>
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