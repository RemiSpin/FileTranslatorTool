import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import SignIn from './SignIn.js';
import SignUp from './SignUp.js';
import Translate from './Translate.js';
import Statistics from './Statistics.js';
import './styles/teamP.css'; 

function App() {
  return (
    <Router>
      <Routes>
        <Route exact path='/' element={<SignIn/>} />
        <Route exact path='/SignUp' element={<SignUp/>} />
        <Route exact path='/Translate' element={<Translate/>} />
        <Route exact path='/Statistics' element={<Statistics/>} />
      </Routes>
    </Router>
  );
}

export default App;