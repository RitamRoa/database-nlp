import React from 'react';
import './App.css';
import QueryInterface from './components/QueryInterface';

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <h1>nlp-database </h1>
      </header>
      
      <main className="App-main">
        <QueryInterface />
      </main>
    </div>
  );
}

export default App;
