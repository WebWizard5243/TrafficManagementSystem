import React from 'react';
import { Routes, Route } from 'react-router-dom';
import HomePage from './HomePage';
import Dashboard from './Dashboard';
import Monitoring from './Monitoring';
import Login from './Login';
import Signup from './Signup';
import ProtectedRoute from './middleware/ProtectedRoute';
export default function App() {
  return (
    <div className='app'>
       <div className={location.pathname === "/monitoring" ? "block" : "hidden"}>
        <video
          id="monitor-player"
          controls
          autoPlay
          muted
          loop
          className="w-[640px] h-[360px] object-cover"
          src="http://127.0.0.1:5000"
        />
      </div>
    
   <Routes>
    <Route path='/Login' element = {<Login />} />
           <Route path='/Signup' element = {<Signup />} />

    <Route path = "/" element ={ <ProtectedRoute><HomePage /></ProtectedRoute> } />
        <Route path = "/Dashboard" element ={ <ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path = "/Monitoring" element ={ <ProtectedRoute><Monitoring /></ProtectedRoute> } />
          
   </Routes>
  </div>
  )
}
