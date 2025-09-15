import React, { useEffect, useState, memo } from 'react'

 const Alerts = memo(() => {
    const [alerts, setAlerts] = useState([]);
    const [locations, setLocations] = useState({}); // Store locations by alert id
    const [loading, setLoading] = useState(false);

    const truncateLocation = (location, method = 'characters') => {
        if (!location || location === 'Loading location...') return location;
        
        switch (method) {
            case 'characters':
                // Method 1: Limit by character count
                return location.length > 50 ? location.substring(0, 50) + '...' : location;
            
            case 'words':
                // Method 2: Limit by word count
                const words = location.split(' ');
                return words.length > 8 ? words.slice(0, 8).join(' ') + '...' : location;
            
            case 'addressParts':
                // Method 3: Show only first few address parts (most specific)
                const parts = location.split(',');
                return parts.length > 3 ? parts.slice(0, 3).join(',') + '...' : location;
            
            case 'lastParts':
                // Method 4: Show only last few parts (area, city, state)
                const lastParts = location.split(',');
                return lastParts.length > 3 ? 
                    '...' + lastParts.slice(-3).join(',') : location;
            
            case 'roadAndArea':
                // Method 5: Extract road name and area only
                const roadMatch = location.match(/^([^,]*)/);
                const areaMatch = location.match(/,\s*([^,]*),\s*([^,]*)/);
                if (roadMatch && areaMatch) {
                    return `${roadMatch[1]}, ${areaMatch[1]}`;
                }
                return location.split(',').slice(0, 2).join(',');
            
            default:
                return location;
        }
    };

    
    useEffect(() => {
        const fetchAlerts = async(e) => {
            try {
                 setLoading(true);
                const res = await fetch("http://localhost:3000/alerts");
                const data = await res.json();
                setAlerts(data);
            } catch (error) {
                console.log("failed to fetch alerts: ", error);
            } finally {
                setLoading(false);
            }
        }
        
        fetchAlerts();
        const interval = setInterval(fetchAlerts, 300000); // refresh every  5 minute

        return () => clearInterval(interval);
    }, [])

    const getLocationForAlert = async (alertId, lat, lng) => {
        if (!window.google || !lat || !lng) return;
        
        const geocoder = new window.google.maps.Geocoder();
        const latlng = { lat: parseFloat(lat), lng: parseFloat(lng) };

        try {
            geocoder.geocode({ location: latlng }, (results, status) => {
                if (status === "OK") {
                    if (results[0]) {
                        setLocations(prev => ({
                            ...prev,
                            [alertId]: results[0].formatted_address
                        }));
                    } else {
                        console.log("No results found for alert:", alertId);
                    }
                } else {
                    console.error("Geocoder failed due to:", status);
                }
            });
        } catch (error) {
            console.error("Error geocoding:", error);
        }
    }

    // Trigger geocoding when alerts change
    useEffect(() => {
        if (alerts.length > 0) {
            alerts.slice(0, 3).forEach((alert, index) => {
                const coordinates = alert.geometry?.coordinates?.[0];
                if (coordinates && coordinates.length >= 2) {
                    const alertId = alert.properties?.id;
                    getLocationForAlert(alertId, coordinates[1], coordinates[0]); // Note: [lng, lat] -> lat, lng
                }
            });
        }
    }, [alerts]);

    return (
        <div>
            <div className='flex flex-col gap-3 justify-center'>
                  {loading ? (
                    // Loading state - show loading message
                    <div className="p-3  text-white rounded flex items-center justify-center">
                        <div className="flex items-center space-x-2">
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                            <p className="text-sm">Loading alerts...</p>
                        </div>
                    </div>
                ) : alerts.length === 0 ? (
                    // No alerts state
                    <div className="p-3 bg-[#D9D9D9] text-black rounded text-center">
                        <p className="text-sm">No alerts available</p>
                    </div>
                ) : (
                    // Display alerts
                    alerts.slice(0, 3).map((alert, index) => {
                        const alertId = alert.properties?.id || index;
                        const location = locations[alertId] || 'Loading location...';
                        const event = alert.properties?.events?.[0].description || 'No event data';
                        const minDelay = alert.properties?.magnitudeOfDelay || 'N/A';
                        
                        return (
                            <div key={alertId} className="p-3 bg-[#B0B7C8] text-black rounded">
                                <p className='text-sm'><strong>{event} On {truncateLocation(location,'words')}</strong></p>
                            </div>
                        );
                    })
                )}
            </div>
        </div>
    )
});

export default Alerts;