import React from 'react';
import { Outlet } from 'react-router-dom';
import CustomNavbar from './components/CustomNavbar';

function App() {
  return (
    <>
      <CustomNavbar />
      <div className="container mt-4">
        {/* Outlet will render child routes */}
        <Outlet />
      </div>
    </>
  );
}

export default App;
