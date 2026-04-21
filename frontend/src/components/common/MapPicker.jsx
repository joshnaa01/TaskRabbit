import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix Leaflet marker icons
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
    iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

const defaultIcon = new L.Icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
});

// Click handler for map
const MapEvents = ({ onPick }) => {
    useMapEvents({
        click(e) {
            onPick(e.latlng.lat, e.latlng.lng);
        },
    });
    return null;
};

// Re-centers the map when coordinates change (e.g. after "Get My Location")
const RecenterMap = ({ lat, lng }) => {
    const map = useMap();
    useEffect(() => {
        if (lat && lng) {
            map.flyTo([lat, lng], 15, { duration: 1.5 });
        }
    }, [lat, lng]);
    return null;
};

const MapPicker = ({ lat, lng, onPick, height = "300px" }) => {
    const position = [lat || 27.717, lng || 85.324];

    return (
        <div style={{ height }} className="w-full rounded-2xl overflow-hidden border border-slate-200 shadow-inner relative z-[10]">
            <MapContainer center={position} zoom={14} scrollWheelZoom={true} className="h-full w-full" style={{ cursor: 'crosshair' }}>
                <TileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    attribution='&copy; OpenStreetMap contributors'
                />
                <Marker position={position} icon={defaultIcon} />
                <MapEvents onPick={onPick} />
                <RecenterMap lat={lat} lng={lng} />
            </MapContainer>
        </div>
    );
};

export default MapPicker;
