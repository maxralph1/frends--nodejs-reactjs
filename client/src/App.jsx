// import Header from './components/Header.jsx';
import { Outlet } from 'react-router-dom';

const App = () => {
  return (
    <>
      {/* <Header /> */}
      <div className=''>
        <Outlet />
      </div>
    </>
  );
};

export default App;
