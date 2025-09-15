import React from 'react'
import { Navigate, useNavigate } from 'react-router-dom';
// Sidebar.jsx
import { Link } from "react-router-dom";


function Sidebar() {
const navigate = useNavigate();
  const handleLogout = () => {
  localStorage.removeItem("token"); 
   sessionStorage.removeItem("token"); 
  navigate("/login");               
};

  return (
    <div className="h-screen w-20 bg-[#131827] text-white flex flex-col p-4 justify-around items-center ">

     <nav className="flex flex-col gap-8 items-center">
  <Link to="/" className="hover:bg-green-700 p-2 rounded">
    <img src="/assets/home.svg" className="w-8 h-8" alt="" />
  </Link>
  <Link to="/Dashboard" className="hover:bg-green-700 p-2 rounded">
    <img src="/assets/Vector.png" className="w-8 h-8" alt="" />
  </Link>
  <Link to="/Monitoring" className="hover:bg-green-700 p-2 rounded">
    <img src="/assets/traffic.png" className="w-10 h-10" alt="" />
  </Link>
</nav>
<div>
  <button onClick={handleLogout} ><img src="/assets/logout.png" className='hover:bg-red-700 w-10 h-10' alt="" /></button>
</div>
    </div>
  );
}

export default Sidebar;

 