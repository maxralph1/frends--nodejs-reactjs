import Header from './components/Header.jsx';
import { Outlet } from 'react-router-dom';

const App = () => {
  return (
    <>
      <Header />
      <div className='my-2'>
        <Outlet />
      </div>
    </>
  );
};

export default App;
