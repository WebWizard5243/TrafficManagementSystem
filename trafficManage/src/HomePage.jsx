import React from 'react'
import Header from './components/Header'
import Sidebar from './components/SideBar'
import Alerts from './components/Alerts'
import Resource from './components/Resource'
export default function HomePage() {
  const userName = localStorage.getItem("name") || "Guest";

  
  return (
    <div className='flex items-center h-screen gap-20 pr-10'>
      <div>
        <Sidebar/>
      </div> 
      <div className=' flex-1 text-white bg-[#131827] flex flex-col gap-6 px-10  py-6'>
          <div>
            <Header name = {userName} />
          </div>

        {/* Dashboard Grid */}
        <div className="grid grid-cols-12  gap-6">
          {/* Congestion Statistics */}
          <div className="col-span-5 bg-[#0B1E56] rounded-lg p-6">
           <Resource />
          </div>

          {/* Alerts */}
          <div className="col-span-7 bg-[#0B1E56] rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-6">ALERTS</h2>
            <div className="space-y-3">
              <Alerts />
            </div>
          </div>
          {/* Contact Details */}
          <div className="col-span-4 bg-[#0B1E56] rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-6">Contact Details</h2>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-blue-600 hover:bg-blue-700 rounded-lg p-4 flex flex-col items-center text-center">
                
                <span className="text-sm font-medium">ACP</span>
                <span className="text-xs">Bhubaneshwar</span>
              </div>
              
              <div className="bg-blue-600 hover:bg-blue-700 rounded-lg p-4 flex flex-col items-center text-center">
                
                <span className="text-sm font-medium">SP</span>
                <span className="text-xs">Bhubaneshwar</span>
              </div>
              
              <div className="bg-blue-600 hover:bg-blue-700 rounded-lg p-4 flex flex-col items-center text-center">
                
                <span className="text-sm font-medium">IG</span>
                <span className="text-xs">Bhubaneshwar</span>
              </div>
              
              <div className="bg-blue-600 hover:bg-blue-700 rounded-lg p-4 flex flex-col items-center text-center">
                <div className="w-8 h-8 mb-2 flex items-center justify-center">
                  <div className="w-6 h-6 bg-white rounded flex items-center justify-center">
                    <div className="w-4 h-4 bg-red-500 rounded"></div>
                  </div>
                </div>
                <span className="text-sm font-medium">Ambulance</span>
              </div>
            </div>
          </div>   {/* closing tag */}
          

          {/* Notifications */}
          <div className="col-span-4 bg-[#0B1E56] rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-6">NOTIFICATIONS</h2>
            <div className="space-y-3">
              <div className="bg-[#D9D9D9] text-black rounded-lg p-3">
                <span className="text-sm">IG,Traffic Press Conference at 15:00</span>
              </div>
              <div className="bg-[#D9D9D9] text-black rounded-lg p-3">
                <span className="text-sm">Clear MG Road for CM Convoy</span>
              </div>
            </div>
            
            <div className="flex space-x-3 mt-6">
              <button className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-3 px-4 rounded-lg">
                Challan
              </button>
              <button className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-3 px-4 rounded-lg">
                Complaints
              </button>
              <button className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-3 px-4 rounded-lg">
                Map
              </button>
            </div>
          </div>

          
          {/* Direct Links */}
          <div className="col-span-4 bg-[#0B1E56] rounded-lg p-6  ">
            <h2 className="text-xl font-semibold mb-6">Direct Links</h2>
            <div className="space-y-4">
              <button className="w-full bg-green-600 hover:bg-green-700 text-white py-3 px-4 rounded-lg flex items-center justify-center space-x-2">
                <div className="w-6 h-6 border-2 border-white rounded flex items-center justify-center">
                  <div className="w-3 h-3 bg-white rounded-full"></div>
                </div>
                <span>Adjust Signals</span>
              </button>
              
              <button className="w-full bg-yellow-500 hover:bg-yellow-600 text-white py-3 px-4 rounded-lg flex items-center justify-center space-x-2">
                <span>Vehicle Details</span>
              </button>
              
              <button className="w-full bg-red-600 hover:bg-red-700 text-white py-3 px-4 rounded-lg flex items-center justify-center space-x-2">
  
                <span>Accident</span>
              </button>
            </div>
          </div>
        </div>
      </div>
      </div>
  )
}
