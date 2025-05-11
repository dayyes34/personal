import React from 'react';
import './App.css';
import Sequencer from './Sequencer';
import PlayerMenu from './PlayerMenu';

function App() {
  return (
    <div className="App">
      <div className="App">
  <div className="cover-container">
    <img 
      src="cover.PNG" 
      alt="Обложка" 
      className="cover-image" 
    />
  </div>
</div>

      <div className="sequencer-container">
        <Sequencer />
      </div>

      <div className="player-menu-container">
        <PlayerMenu />
      </div>
    </div>
  );
}

export default App;