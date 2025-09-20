import React from "react";

export default function Resource() {
  // Hardcoded data
  const resources = {
    patrolCars: 12,
    ambulances: 4,
    officersOnDuty: 45,
    towTrucks: 3,
  };

  return (
    <div className=" text-white rounded-xl  shadow-lg w-full">
      <h2 className="text-lg font-bold mb-3">Resource Availability</h2>
      <div className="space-y-3">
        <div className="flex justify-between bg-blue-600 hover:bg-blue-800 rounded-md px-3 py-2">
          <span>🚓 Patrol Cars</span>
          <span>{resources.patrolCars}</span>
        </div>
        <div className="flex justify-between bg-red-600 hover:bg-red-800 rounded-md px-3 py-2">
          <span>🚑 Ambulances</span>
          <span>{resources.ambulances}</span>
        </div>
        <div className="flex justify-between bg-green-600 hover:bg-green-800 rounded-md px-3 py-2">
          <span>👮 Officers On Duty</span>
          <span>{resources.officersOnDuty}</span>
        </div>
        <div className="flex justify-between bg-yellow-500 hover:bg-yellow-700 rounded-md px-3 py-2">
          <span>🚛 Tow Trucks</span>
          <span>{resources.towTrucks}</span>
        </div>
      </div>
    </div>
  );
}
