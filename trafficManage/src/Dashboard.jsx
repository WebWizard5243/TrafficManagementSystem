import React, { useState } from 'react'
import Header from './components/Header'
import Sidebar from './components/SideBar'
import Map from './components/Map';
import Alerts from './components/Alerts';
export default function Dashboard() {

    const [header, setHeader] = useState("Traffic Management System");
    const [search, setSearch] = useState("");

    function handleSearch(data) {
      setSearch(data);
      console.log( " this is the dashboard one :" , search);
    }
  return (
    <div className='flex items-center h-screen pr-10' >
        <div>
            <Sidebar />
        </div>
         <div className="ml-16 p-6 mr-4 bg-[#131827] rounded text-white flex-1">
        {/* Header */}
        <div className='mb-6' >
            <Header 
            onSearch = {handleSearch}
            header = {header} />
        </div>

        <div className="grid grid-cols-3 gap-6">
          {/* Map Section */}
          <div className="col-span-2 row-span-3">
            <Map data = {search} /> 
            </div>

          {/* Signal Control */}
          <div className="bg-[#0B1E56] rounded-lg p-4">
            <h3 className="text-xl font-bold mb-4 text-center">SIGNAL CONTROL</h3>
            
            <div className="space-y-3 mb-4">
            </div>

            {/* Wait Time Chart */}
            <div className="bg-gray-800 p-3 rounded mb-4">
              <div className="flex items-end justify-center space-x-2 h-16">
                <div className="bg-white w-6 h-8"></div>
                <div className="bg-white w-6 h-4"></div>
                <div className="bg-white w-6 h-12"></div>
              </div>
              <div className="text-center text-sm mt-2">Average Wait Time</div>
            </div>

            <div className="flex gap-2">
              <button>
                AI Mode
              </button>
              <button>            
                Manual
              </button>
            </div>
          </div>

          {/* Statistics */}
          <div className="col-span-2 bg-[#0B1E56] rounded-lg p-4">
            <h3 className="text-2xl font-bold mb-4 text-center">Real Time Statistics</h3>
            <div className="grid items-center justify-center mt-16 text-center grid-cols-4 gap-8">
                    <div className='bg-[#B0B7C8] text-black p-4 text-lg rounded-3xl'>16 mins</div>
                    <div className='bg-[#B0B7C8] text-black p-4 text-lg rounded-3xl'> 55% </div>
                    <div className='bg-[#B0B7C8] text-black p-4 text-lg rounded-3xl'>12</div>
                    <div className='bg-[#B0B7C8] text-black p-4 text-lg rounded-3xl'>6.5mt</div>
                     <h3 className='mt-2 text-lg font-bold'>Average Travel  Time</h3>
                      <h3 className='mt-2 text-lg font-bold'>Traffic <br /> Congestion</h3>
                       <h3 className='mt-2 text-lg font-bold'>Signal <br /> Automated   </h3>
                        <h3 className='mt-2 text-lg font-bold'> CO2 Reduction Estimate</h3>
            </div>
          </div>

          {/* Recent Alerts */}
          <div className="bg-[#0B1E56]   rounded-lg p-4">
            <h3 className="text-xl text-center font-bold mb-4">Recent Alerts</h3>
            <Alerts />
            <div className="space-y-2">
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
