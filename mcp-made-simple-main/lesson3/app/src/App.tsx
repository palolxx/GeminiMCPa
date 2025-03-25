import { Inventory } from './components/Inventory';
import { AuthorCredit } from './components/AuthorCredit';
import './App.css';

function App() {
  return (
    <div className="app">
      <header className="header">
        <h1>Ye Olde Shoppe</h1>
        <p className="subtitle">~ Finest Wares in All of Vibetopia ~</p>
      </header>
      <Inventory />
      <AuthorCredit />
    </div>
  );
}

export default App;
