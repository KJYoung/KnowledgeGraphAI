import React, { useState } from 'react';
import axios from 'axios';
import { HashRouter, Route, Routes } from 'react-router-dom';
import Header from './Components/Header';
import './styles/color.css';
import AddNewKnowledge from './Pages/Add';
import GraphVisualization from './Pages/Graph';

export const NAV_MAIN_PAGE = '/'; // :Public/Public
export const NAV_NEW_PAGE = '/new';
export const NAV_SUM_PAGE = '/graph';

const App: React.FC = () => {
  const [number, setNumber] = useState<number>(0);
  const [result, setResult] = useState<number | null>(null);

  const handleIncrement = async () => {
    try {
      const response = await axios.post('http://localhost:8000/api/increment/', { number });
      setResult(response.data.result);
    } catch (error) {
      console.error('There was an error!', error);
    }
  };

  return (
    <>
      <HashRouter>
        <Header />
        <Routes>
          <Route path={NAV_MAIN_PAGE} element={
            <div>
              <input type="number" value={number} onChange={(e) => setNumber(Number(e.target.value))} />
              <button onClick={handleIncrement}>Increment</button>
              {result !== null && <span>Result: {result}</span>}
            </div>
          }/>
          <Route path={NAV_NEW_PAGE} element={<AddNewKnowledge />} />
          <Route path={NAV_SUM_PAGE} element={<GraphVisualization />} />
          <Route path="*" element={
            <div>
              NOT FOUND
            </div>
          }/>
        </Routes>
        
      </HashRouter>
    </>
  );
}

export default App;
