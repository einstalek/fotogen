import './App.css'
import PortraitGenerator from "./components/PortraitGenerator";
import { LanguageProvider } from './LanguageContext';

function App() {
  return (
    <LanguageProvider>
      <div className="App">
        <PortraitGenerator />
      </div>
    </LanguageProvider>
  );
}

export default App;