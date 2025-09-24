import React,{ useState} from 'react';
import Sidebar from './components/sideBar';
import Header from './components/Header';
import { useEffect } from 'react';
const Monitoring = () => {
  
const[counts, setCounts] = useState([])
const latest16 = [...counts].reverse().find(item => item.second % 1 === 0);


  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const res = await fetch("http://localhost:3000/detect");
        const data = await res.json();
        setCounts(data);
      } catch (error) {
        console.error("Error fetching vehicle Counts :",error);
      }
    },2000);
    return () => clearInterval(interval);
  },[])
  return (
    <div className='flex items-center h-screen  pr-10' >
        <div>
            <Sidebar />
        </div>
         <div className="ml-16 px-10 py-6 mt-20 mr-4 bg-[#131827]  rounded text-white flex-1">
        {/* Header */}
        <div className='mb-6' >
            <Header />
        </div>

        <div className="grid grid-cols-3 gap-6">
          {/* Map Section */}
          <div className="col-span-2 row-span-1 rounded-xl p-4">
              <div className="bg-slate-300 rounded-lg aspect-video flex items-center justify-center">
                <span className="text-4xl font-bold text-slate-800"><img  className='w-full h-full object-contain' src="http:localhost:3000/video_stream"></img></span>
              </div>
            </div>

          {/* Signal Control */}
           <div className="bg-[#0B1E56] rounded-xl p-6">
              <h3 className="text-2xl font-bold mb-6 text-center">SIGNAL</h3>
              <div className="grid grid-cols-1 gap-8">
                <button className="bg-red-500 hover:bg-red-600 px-6 py-4 rounded-lg font-bold transition-all transform hover:scale-105">
                  RED
                </button>
                <button className="bg-yellow-400 hover:bg-yellow-500 px-6 py-4 rounded-lg font-bold transition-all transform hover:scale-105">
                  YELLOW
                </button>
                <button className="bg-green-500 hover:bg-green-600 px-6 py-4 rounded-lg font-bold transition-all transform hover:scale-105">
                  GREEN
                </button>
                <button className="bg-blue-500 hover:bg-blue-600 px-6 py-4 rounded-lg font-bold transition-all transform hover:scale-105">
                  AI MODE
                </button>
              </div>
            </div>

            {/* Wait Time Chart */}
           

          {/* Statistics */}
          <div className='col-span-2 bg-[#0B1E56] grid grid-cols-2 gap-8 rounded-lg p-10' >
           <div className="bg-blue-600  rounded-xl p-6 flex flex-col items-center justify-center space-y-4">
                <h3 className="text-xl font-bold text-center">CONGESTION INDEX</h3>
                {latest16 ? (
                  
                  <div className="text-xl mt-2 font-bold bg-purple-700 px-8 py-3 rounded-lg" >
                  {latest16.congestion_index}%
                </div>
      
                ) : (
                  <p></p>
                )}
              </div>
              <div className="bg-[#0D98BA]  rounded-xl p-6 flex flex-col items-center justify-center space-y-4" >
                <h3 className="text-xl font-bold text-center">VEHICLE COUNT</h3>
                {latest16 ? (
                  
                  <div className="text-xl mt-2 font-bold bg-purple-700 px-8 py-3 rounded-lg" >
                  {latest16.vehicle_count}
                </div>
      
                ) : (
                  <p></p>
                )}
                 
              </div>
              </div>

          {/* Recent Alerts */}
           <div className="bg-[#0B1E56] rounded-xl p-6">
              <h3 className="text-2xl font-bold mb-6 ">AI Suggestion :</h3>
              <div className="space-y-3">
                {latest16 ? (
                  <p className='text-2xl' ><strong> {latest16.suggestion}</strong>
                </p>
      
                ) : (
                  <p></p>
                )}
                 
              </div>
            </div>
        </div>
      </div>
      </div>
  );
};

export default Monitoring;