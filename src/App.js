import { BrowserRouter, Routes, Route } from "react-router-dom";
import Registration from './pages/registration-page/registration';
import './App.css';
import Homepage from "./pages/home-page/homepage";

function App() {
  return (
    <BrowserRouter>
        <div className="App">
          <div className="main-content">
            <Routes>
              <Route path="/" element={<Registration />} />
              <Route path="/home" element={<Homepage />} />
            </Routes>
          </div>
        </div>
      </BrowserRouter>
  );
}

export default App;
