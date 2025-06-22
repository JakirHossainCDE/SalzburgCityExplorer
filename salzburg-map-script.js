// Initialize map centered on Salzburg, Austria
let map = L.map('map').setView([47.8095, 13.0550], 13);

// --- Base Map Layers ---
const osm = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    maxZoom: 19
});

const satellite = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
    attribution: 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'
});

const topo = L.tileLayer('https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', {
    attribution: 'Map data: &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, <a href="http://viewfinderpanoramas.org">SRTM</a> | Map style: &copy; <a href="https://opentopomap.org">OpenTopoMap</a> (CC-BY-SA)'
});

osm.addTo(map);

// --- Icon Definitions for Markers ---
const iconProperties = {
    landmark: { icon: "landmark", color: "#005A9C" },
    museum: { icon: "university", color: "#6A057F" },
    historic: { icon: "building", color: "#8B4513" },
    park: { icon: "tree", color: "#2E8B57" },
    cafe: { icon: "coffee", color: "#A0522D" },
    restaurant: { icon: "utensils", color: "#D2691E" },
    shop: { icon: "shopping-bag", color: "#800080" },
    religious: { icon: "place-of-worship", color: "#B8860B" },
    info: { icon: "info-circle", color: "#777777" }
};

// --- Global Variables to Store Map Elements and State ---
let attractionMarkers = [];
let routeControl = null;
let selectedAttractions = [];
let currentCityData = null;

// --- Mock City Data for Salzburg ---
const cityDatabase = {
    "salzburg": {
        name: "Salzburg, Austria",
        center: [47.8095, 13.0550],
        zoom: 13,
        attractions: [
            { id: 1, name: "Hohensalzburg Fortress", lat: 47.7975, lng: 13.0475, category: "Landmark", icon: "landmark" },
            { id: 2, name: "Mirabell Palace and Gardens", lat: 47.8090, lng: 13.0450, category: "Historic Site", icon: "historic" },
            { id: 3, name: "Mozart's Birthplace", lat: 47.8009, lng: 13.0468, category: "Museum", icon: "museum" },
            { id: 4, name: "Salzburg Cathedral", lat: 47.7997, lng: 13.0478, category: "Religious Site", icon: "religious" },
            { id: 5, name: "Mönchsberg", lat: 47.7990, lng: 13.0400, category: "Park", icon: "park" },
            { id: 6, name: "Getreidegasse", lat: 47.8006, lng: 13.0457, category: "Shopping Street", icon: "shop" }
        ]
    }
};

// --- GeoJSON Data for Overlays (Points of Interest, Route, Area) ---
const poisGeoJSONData = {
    "type": "FeatureCollection",
    "features": [
        {
            "type": "Feature",
            "properties": { "name": "Cafe Tomaselli", "description": "Historic café in the heart of Salzburg.", "type": "cafe" },
            "geometry": { "type": "Point", "coordinates": [13.0466, 47.8007] }
        },
        {
            "type": "Feature",
            "properties": { "name": "Residenzplatz", "description": "Large baroque square in Salzburg's Old Town.", "type": "park" },
            "geometry": { "type": "Point", "coordinates": [13.0470, 47.8000] }
        },
        {
            "type": "Feature",
            "properties": { "name": "Stiegl-Keller", "description": "Traditional Austrian restaurant with beer garden.", "type": "restaurant" },
            "geometry": { "type": "Point", "coordinates": [13.0435, 47.7981] }
        },
        {
            "type": "Feature",
            "properties": { "name": "Museum der Moderne", "description": "Modern art museum on Mönchsberg hill.", "type": "museum" },
            "geometry": { "type": "Point", "coordinates": [13.0375, 47.7995] }
        },
        {
            "type": "Feature",
            "properties": { "name": "Linzergasse Shops", "description": "Pedestrian shopping street on the right bank of the Salzach.", "type": "shop" },
            "geometry": { "type": "Point", "coordinates": [13.0470, 47.8040] }
        }
    ]
};

const salzachRiverWalkGeoJSONData = {
    "type": "FeatureCollection",
    "features": [
        {
            "type": "Feature",
            "properties": {
                "name": "Salzach River Walk",
                "description": "A pleasant walk along the Salzach river with views of the Old Town.",
                "length_km": "Approx. 3.0",
                "activity": "Walking"
            },
            "geometry": {
                "type": "LineString",
                "coordinates": [
                    [13.0480, 47.8060],
                    [13.0460, 47.8040],
                    [13.0450, 47.8020],
                    [13.0440, 47.8000],
                    [13.0430, 47.7980],
                    [13.0450, 47.7960]
                ]
            }
        }
    ]
};

const oldTownAreaGeoJSONData = {
    "type": "FeatureCollection",
    "features": [
        {
            "type": "Feature",
            "properties": {
                "name": "Salzburg Old Town (Altstadt)",
                "description": "UNESCO World Heritage site known for its Baroque architecture, historic alleyways, and the birthplace of Mozart.",
                "designation": "UNESCO World Heritage Site"
            },
            "geometry": {
                "type": "Polygon",
                "coordinates": [[
                    [13.0440, 47.8025],
                    [13.0490, 47.8025],
                    [13.0490, 47.7970],
                    [13.0440, 47.7970],
                    [13.0440, 47.8025]
                ]]
            }
        }
    ]
};

// --- Styling Functions for GeoJSON Layers ---
function stylePois(feature) {
    const type = feature.properties.type || 'info';
    const color = iconProperties[type] ? iconProperties[type].color : iconProperties.info.color;
    return {
        radius: 8,
        fillColor: color,
        color: "#fff",
        weight: 1,
        opacity: 1,
        fillOpacity: 0.8
    };
}

function styleRoutes(feature) {
    return {
        color: "#4CAF50",
        weight: 5,
        opacity: 0.7
    };
}

const routeHighlightStyle = {
    color: "#388E3C",
    weight: 7,
    opacity: 1
};

function styleAreas(feature) {
    return {
        fillColor: "#FFC107",
        color: "#FFA000",
        weight: 2,
        opacity: 1,
        fillOpacity: 0.4
    };
}

const areaHighlightStyle = {
    fillColor: "#FFB300",
    color: "#FF8F00",
    weight: 3,
    fillOpacity: 0.6
};

// --- GeoJSON Layers for Leaflet Layer Control ---
const poisLayer = L.geoJson(poisGeoJSONData, {
    pointToLayer: function (feature, latlng) {
        const type = feature.properties.type || 'info';
        const poiIcon = iconProperties[type] ? iconProperties[type].icon : "info-circle";
        const poiColor = iconProperties[type] ? iconProperties[type].color : "#777";

        return L.marker(latlng, {
            icon: L.divIcon({
                html: `<div style="background-color: ${poiColor};"
                            class="poi-marker">
                            <i class="fas fa-${poiIcon}"></i>
                          </div>`,
                className: 'poi-marker-container',
                iconSize: [28, 28],
                iconAnchor: [14, 28]
            })
        });
    },
    onEachFeature: function (feature, layer) {
        let popupContent = `<strong>${feature.properties.name}</strong><br>` +
                           `<em>Type:</em> ${feature.properties.type ? feature.properties.type.charAt(0).toUpperCase() + feature.properties.type.slice(1) : 'General Point'}<br>` +
                           `<em>Description:</em> ${feature.properties.description || 'No description available.'}`;
        layer.bindPopup(popupContent);
    }
});

const salzachRiverWalkLayer = L.geoJson(salzachRiverWalkGeoJSONData, {
    style: styleRoutes,
    onEachFeature: function (feature, layer) {
        let popupContent = `<strong>${feature.properties.name}</strong><br>` +
                           `<em>Description:</em> ${feature.properties.description || 'No description available.'}<br>` +
                           `<em>Length:</em> ${feature.properties.length_km || 'N/A'} km`;
        layer.bindPopup(popupContent);

        layer.on({
            mouseover: function (e) { layer.setStyle(routeHighlightStyle); },
            mouseout: function (e) { layer.setStyle(styleRoutes(feature)); }
        });
    }
});

const oldTownAreaLayer = L.geoJson(oldTownAreaGeoJSONData, {
    style: styleAreas,
    onEachFeature: function (feature, layer) {
        let popupContent = `<strong>${feature.properties.name}</strong><br>` +
                           `<em>Description:</em> ${feature.properties.description || 'No description available.'}<br>` +
                           `<em>Designation:</em> ${feature.properties.designation || 'N/A'}`;
        layer.bindPopup(popupContent);

        layer.on({
            mouseover: function (e) { layer.setStyle(areaHighlightStyle); },
            mouseout: function (e) { layer.setStyle(styleAreas(feature)); }
        });
    }
});

// --- Leaflet Layer Control Setup ---
const baseLayers = {
    "OpenStreetMap": osm,
    "Satellite": satellite,
    "Topographic": topo
};

const overlayLayers = {
    "Points of Interest": poisLayer,
    "Salzach River Walk": salzachRiverWalkLayer,
    "Salzburg Old Town Area": oldTownAreaLayer
};

L.control.layers(baseLayers, overlayLayers, { collapsed: false }).addTo(map);

// --- Core Application Functions ---
function loadCityData(cityKey) {
    showLoading("Loading city data...");
    clearMapAttractions();
    selectedAttractions = [];
    updateRouteInfo();
    
    currentCityData = cityDatabase[cityKey];
    if (!currentCityData) {
        hideLoading();
        alert("City not found in our database. Please try 'Salzburg'.");
        return;
    }
    
    map.setView(currentCityData.center, currentCityData.zoom);
    
    const attractionsListDiv = document.getElementById('attractions-list');
    currentCityData.attractions.forEach(attraction => {
        const marker = L.marker([attraction.lat, attraction.lng], {
            icon: L.divIcon({
                html: `<div style="background-color: ${iconProperties[attraction.icon].color};"
                            class="attraction-marker">
                            <i class="fas fa-${iconProperties[attraction.icon].icon}"></i>
                          </div>`,
                className: 'attraction-marker-container',
                iconSize: [36, 36],
                iconAnchor: [18, 36]
            })
        }).addTo(map);
        
        marker.bindPopup(`<b>${attraction.name}</b><br>${attraction.category}`);
        marker.attractionData = attraction;
        attractionMarkers.push(marker);
        
        const attractionItem = document.createElement('div');
        attractionItem.className = 'attraction-item';
        attractionItem.innerHTML = `
            <div class="attraction-icon"><i class="fas fa-${iconProperties[attraction.icon].icon}"></i></div>
            <div class="attraction-details">
                <div class="attraction-name">${attraction.name}</div>
                <div class="attraction-category">${attraction.category}</div>
            </div>
            <div><i class="fas fa-plus"></i></div>
        `;
        
        attractionItem.addEventListener('click', function() {
            toggleAttractionSelection(attraction.id, attractionItem);
        });
        
        attractionsListDiv.appendChild(attractionItem);
    });
    
    document.getElementById('route-name').textContent = `${currentCityData.name} Highlights`;
    
    hideLoading();
}

function toggleAttractionSelection(attractionId, element) {
    const index = selectedAttractions.indexOf(attractionId);
    const icon = element.querySelector('.fa-plus, .fa-check');
    
    if (index === -1) {
        selectedAttractions.push(attractionId);
        icon.classList.remove('fa-plus');
        icon.classList.add('fa-check');
        element.classList.add('selected');
    } else {
        selectedAttractions.splice(index, 1);
        icon.classList.remove('fa-check');
        icon.classList.add('fa-plus');
        element.classList.remove('selected');
    }
    
    updateRouteInfo();
}

function updateRouteInfo() {
    document.getElementById('route-stops').textContent = selectedAttractions.length;
    document.getElementById('route-distance').textContent = '0 km';
    document.getElementById('route-time').textContent = '0 mins';
}

function clearMapAttractions() {
    attractionMarkers.forEach(marker => map.removeLayer(marker));
    attractionMarkers = [];
    
    if (routeControl) {
        map.removeControl(routeControl);
        routeControl = null;
    }
    
    document.getElementById('attractions-list').innerHTML = '';
    
    document.querySelectorAll('.attraction-item.selected').forEach(item => {
        item.classList.remove('selected');
        const icon = item.querySelector('.fa-check');
        if (icon) {
            icon.classList.remove('fa-check');
            icon.classList.add('fa-plus');
        }
    });

    document.getElementById('route-distance').textContent = '0 km';
    document.getElementById('route-time').textContent = '0 mins';
    document.getElementById('route-stops').textContent = '0';
    document.getElementById('route-name').textContent = 'Selected Highlights';
}

function showOptimizedRoute() {
    if (selectedAttractions.length < 2) {
        alert("Please select at least 2 attractions to optimize a route.");
        return;
    }
    
    showLoading("Calculating optimal route...");
    
    setTimeout(() => {
        if (routeControl) {
            map.removeControl(routeControl);
        }
        
        const waypoints = selectedAttractions.map(id => {
            const attraction = currentCityData.attractions.find(a => a.id === id);
            return L.latLng(attraction.lat, attraction.lng);
        });
        
        routeControl = L.Routing.control({
            waypoints: waypoints,
            show: true,
            addWaypoints: false,
            draggableWaypoints: false,
            fitSelectedRoutes: true,
            lineOptions: {
                styles: [{ color: '#007BFF', opacity: 0.8, weight: 6, className: 'optimized-route-line' }]
            },
            createMarker: function() { return null; }
        }).addTo(map);
        
        routeControl.on('routesfound', function(e) {
            const routes = e.routes;
            if (routes && routes.length > 0) {
                const route = routes[0];
                document.getElementById('route-distance').textContent = 
                    `${(route.summary.totalDistance / 1000).toFixed(1)} km`;
                document.getElementById('route-time').textContent = 
                    `${Math.round(route.summary.totalTime / 60)} mins`;
            }
            hideLoading();
        });
        
        routeControl.on('routingerror', function(e) {
            hideLoading();
            console.error("Routing error:", e.error.message);
            alert("Could not calculate route. Please try again or select different attractions.");
        });
        
    }, 1000);
}

function showLoading(message) {
    document.getElementById('loading-overlay').style.display = 'flex';
    document.getElementById('loading-text').textContent = message;
}

function hideLoading() {
    document.getElementById('loading-overlay').style.display = 'none';
}

// --- Event Listeners ---
document.addEventListener('DOMContentLoaded', function() {
    document.getElementById('search-btn').addEventListener('click', function() {
        const cityInput = document.getElementById('city-input').value.trim().toLowerCase();
        if (cityInput) {
            loadCityData(cityInput);
        } else {
            alert("Please enter a city name.");
        }
    });
    
    document.getElementById('city-input').addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            document.getElementById('search-btn').click();
        }
    });
    
    document.getElementById('optimize-btn').addEventListener('click', showOptimizedRoute);
    
    document.getElementById('export-btn').addEventListener('click', function() {
        if (routeControl) {
            alert("Map export simulated. This would typically generate a PNG or a shareable link of the map with the route.");
        } else {
            alert("Please optimize a route first before attempting to export.");
        }
    });

    loadCityData('salzburg');
});
