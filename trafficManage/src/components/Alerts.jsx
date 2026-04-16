import React, { useEffect, useState, memo } from 'react'

const Alerts = memo(({ location: search, bbox }) => {
    const [alerts, setAlerts] = useState([]);
    const [locations, setLocations] = useState({});
    const [loading, setLoading] = useState(false);
    const url = "http://localhost:3000/alerts" || "https://trafficmanagementsystem-r31f.onrender.com/alerts";
    const truncateLocation = (location, method = 'characters') => {
        if (!location || location === 'Loading location...') return location;
        
        switch (method) {
            case 'characters':
                return location.length > 50 ? location.substring(0, 50) + '...' : location;
            case 'words':
                const words = location.split(' ');
                return words.length > 8 ? words.slice(0, 8).join(' ') + '...' : location;
            case 'addressParts':
                const parts = location.split(',');
                return parts.length > 3 ? parts.slice(0, 3).join(',') + '...' : location;
            case 'lastParts':
                const lastParts = location.split(',');
                return lastParts.length > 3 ? '...' + lastParts.slice(-3).join(',') : location;
            case 'roadAndArea':
                const roadMatch = location.match(/^([^,]*)/);
                const areaMatch = location.match(/,\s*([^,]*),\s*([^,]*)/);
                if (roadMatch && areaMatch) return `${roadMatch[1]}, ${areaMatch[1]}`;
                return location.split(',').slice(0, 2).join(',');
            default:
                return location;
        }
    };

    // Re-fetch alerts when search location changes
    useEffect(() => {
        if (!bbox) return;
        const fetchAlerts = async () => {
            try {
                
                setLoading(true);
                const res = await fetch(`${url}?minLon=${bbox.minLon}&minLat=${bbox.minLat}&maxLon=${bbox.maxLon}&maxLat=${bbox.maxLat}`);
                const data = await res.json();
                setAlerts(data);
                setLocations({}); // clear old locations when new search happens
            } catch (error) {
                console.log("failed to fetch alerts: ", error);
            } finally {
                setLoading(false);
            }
        }

        fetchAlerts();
        const interval = setInterval(fetchAlerts, 300000);
        return () => clearInterval(interval);
    }, [bbox]); // re-runs when location is searched

    const getLocationForAlert = async (alertId, lat, lng) => {
        if (!lat || !lng) return;
        try {
            const res = await fetch(
                `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`,
                { headers: { "Accept-Language": "en" } }
            );
            const data = await res.json();
            if (data.display_name) {
                setLocations(prev => ({
                    ...prev,
                    [alertId]: data.display_name
                }));
            }
        } catch (error) {
            console.error("Error geocoding:", error);
        }
    };

    useEffect(() => {
        if (alerts.length > 0) {
            alerts.slice(0, 3).forEach((alert, index) => {
                const coordinates = alert.geometry?.coordinates?.[0];
                if (coordinates && coordinates.length >= 2) {
                    const alertId = alert.properties?.id;
                    getLocationForAlert(alertId, coordinates[1], coordinates[0]);
                }
            });
        }
    }, [alerts]);

    return (
        <div>
            <div className='flex flex-col gap-3 justify-center'>
                {loading ? (
                    <div className="p-3 text-white rounded flex items-center justify-center">
                        <div className="flex items-center space-x-2">
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                            <p className="text-sm">Loading alerts...</p>
                        </div>
                    </div>
                ) : alerts.length === 0 ? (
                    <div className="p-3 bg-[#D9D9D9] text-black rounded text-center">
                        <p className="text-sm">No alerts available</p>
                    </div>
                ) : (
                    alerts.slice(0, 3).map((alert, index) => {
                        const alertId = alert.properties?.id || index;
                        const location = locations[alertId] || '';
                        const event = alert.properties?.events?.[0].description || 'No event data';

                        return (
                            <div key={alertId} className="p-3 bg-[#B0B7C8] text-black rounded">
                                <p className='text-sm'>
                                    <strong>
                                        {event}{location ? ` On ${truncateLocation(location, 'words')}` : ''}
                                    </strong>
                                </p>
                            </div>
                        );
                    })
                )}
            </div>
        </div>
    )
});

export default Alerts;