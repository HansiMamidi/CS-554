import logo from './img/logo.png';
import './App.css';
import ShowList from './components/ShowList';
import Show from './components/Show';
import Home from './components/Home';
import Error from './components/Error';
import Error1 from './components/Error1';
import {Route, Link, Routes} from 'react-router-dom';

const App = () => {
  return (
    <div className='App'>
      <header className='App-header'>
        <img src={logo} className='App-logo' alt='logo' />
        <h1 className='App-title'>Welcome to the Metropolitan Museum of Art API</h1>
      </header>
      <br />
      <br />
      <Routes>
        <Route path='/' element={<Home />} />
        {/* <Route path='/collection/page/:page/*' element={<Error1 />} /> */}
        <Route path='/collection/page/:page' element={<ShowList />} />
        <Route path='/collection/:id' element={<Show />} />
        <Route path='*' element={<h2>404: Page Not Found</h2>} /> 
        
        <Route path='/Error' element={<Error />} />  
        <Route path='/Error1' element={<Error1 />} />       
      </Routes>
    </div>
  );
};

export default App;
