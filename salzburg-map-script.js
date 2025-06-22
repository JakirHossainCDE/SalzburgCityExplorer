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
    landmark: { icon: "landmark", color: "#005A9C" }, // Deep Blue
    museum: { icon: "university", color: "#6A057F" },  // Royal Purple
    historic: { icon: "building", color: "#8B4513" },  // Saddle Brown
    park: { icon: "tree", color: "#2E8B57" },        // Sea Green
    cafe: { icon: "coffee", color: "#A0522D" },      // Sienna
    restaurant: { icon: "utensils", color: "#D2691E" }, // Chocolate
    shop: { icon: "shopping-bag", color: "#800080" }, // Purple
    religious: { icon: "place-of-worship", color: "#B8860B" },// Dark Goldenrod
    info: { icon: "info-circle", color: "#777777" }    // Grey
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
            { id: 6, name: "Getreidegasse", lat: 47.8006, lng: 13.0457, category: "Shopping Street", icon: "shop" },
            { id: 7, name: "Hellbrunn Palace and Trick Fountains", lat: 47.7667, lng: 13.0400, category: "Historic Site", icon: "historic" },
            { id: 8, name: "Haus der Natur (Natural History Museum)", lat: 47.8020, lng: 13.0400, category: "Museum", icon: "museum" },
            { id: 9, name: "St. Peter's Abbey", lat: 47.7989, lng: 13.0466, category: "Religious Site", icon: "religious" },
            { id: 10, name: "Nonnberg Abbey", lat: 47.7940, lng: 13.0480, category: "Religious Site", icon: "religious" },
            { id: 11, name: "Kapuzinerberg", lat: 47.8040, lng: 13.0510, category: "Park", icon: "park" },
            { id: 12, name: "Mozart Residence", lat: 47.8023, lng: 13.0460, category: "Museum", icon: "museum" },
            { id: 13, name: "Museum der Moderne Mönchsberg", lat: 47.7995, lng: 13.0375, category: "Museum", icon: "museum" },
            { id: 14, name: "Linzergasse", lat: 47.8040, lng: 13.0470, category: "Shopping Street", icon: "shop" },
            { id: 15, name: "Residenzplatz", lat: 47.8000, lng: 13.0470, category: "Landmark", icon: "landmark" },
            { id: 16, name: "DomQuartier Salzburg", lat: 47.7997, lng: 13.0478, category: "Historic Site", icon: "historic" }, // Part of Cathedral/Residenz
            { id: 17, name: "Toy Museum (Spielzeug Museum)", lat: 47.8015, lng: 13.0405, category: "Museum", icon: "museum" },
            { id: 18, name: "Salzburg Marionette Theatre", lat: 47.8030, lng: 13.0450, category: "Entertainment", icon: "info" },
            { id: 19, name: "Hangar-7", lat: 47.7930, lng: 13.0030, category: "Museum", icon: "museum" },
            { id: 20, name: "Festival Hall (Festspielhaus)", lat: 47.8000, lng: 13.0430, category: "Landmark", icon: "landmark" },
            { id: 21, name: "Makartsteg (Love Lock Bridge)", lat: 47.8055, lng: 13.0440, category: "Landmark", icon: "landmark" },
            { id: 22, name: "Salzburg Museum", lat: 47.8000, lng: 13.0470, category: "Museum", icon: "museum" }
        ]
    }
};

// --- GeoJSON Data for Overlays (Points of Interest, Route, Area) ---
// Note: POIs are separate from the main attractions list, providing additional points of interest
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
            "properties": { "name": "Stiegl-Keller", "description": "Traditional Austrian restaurant with beer garden.", "type": "restaurant" },
            "geometry": { "type": "Point", "coordinates": [13.0435, 47.7981] }
        },
        {
            "type": "Feature",
            "properties": { "name": "Linzergasse Shops", "description": "Pedestrian shopping street on the right bank of the Salzach.", "type": "shop" },
            "geometry": { "type": "Point", "coordinates": [13.0470, 47.8040] }
        },
        {
            "type": "Feature",
            "properties": { "name": "Mozartplatz", "description": "Square with a statue of Mozart.", "type": "park" },
            "geometry": { "type": "Point", "coordinates": [13.0468, 47.8005] }
        },
        {
            "type": "Feature",
            "properties": { "name": "Alter Markt", "description": "Historic market square with traditional shops and cafes.", "type": "shop" },
            "geometry": { "type": "Point", "coordinates": [13.0460, 47.8010] }
        },
        {
            "type": "Feature",
            "properties": { "name": "Museum der Moderne Rupertinum", "description": "Contemporary art museum in the city center.", "type": "museum" },
            "geometry": { "type": "Point", "coordinates": [13.0445, 47.8010] }
        },
        {
            "type": "Feature",
            "properties": { "name": "Augustiner Bräustübl", "description": "Largest beer hall in Salzburg, monastery brewery.", "type": "restaurant" },
            "geometry": { "type": "Point", "coordinates": [13.0330, 47.8060] }
        },
        {
            "type": "Feature",
            "properties": { "name": "Getreidegasse Shops", "description": "Famous shopping street known for its unique signs.", "type": "shop" },
            "geometry": { "type": "Point", "coordinates": [13.0457, 47.8006] } // Coordinates similar to Getreidegasse attraction, but as a POI
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
                "description": "A pleasant walk along the Salzach river with views of the Old Town. Perfect for a leisurely stroll or a jog.",
                "length_km": "Approx. 3.0",
                "activity": "Walking, Jogging, Cycling"
            },
            "geometry": {
                "type": "LineString",
                "coordinates": [
                    [13.0480, 47.8060], // Near Staatsbrücke
                    [13.0460, 47.8040],
                    [13.0450, 47.8020], // Near Mozartsteg
                    [13.0440, 47.8000], // Near Makartsteg
                    [13.0430, 47.7980], // Near Müllnersteg
                    [13.0450, 47.7960]  // South of Old Town
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
                "description": "UNESCO World Heritage site known for its Baroque architecture, historic alleyways, the birthplace of Mozart, and vibrant cultural life. A must-visit!",
                "designation": "UNESCO World Heritage Site"
            },
            "geometry": {
                "type": "Polygon",
                "coordinates": [[
                    [13.0440, 47.8025], // North-West corner
                    [13.0490, 47.8025], // North-East corner
                    [13.0490, 47.7970], // South-East corner
                    [13.0440, 47.7970], // South-West corner
                    [13.0440, 47.8025]  // Close the polygon
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
        color: "#fff", // White border for POIs
        weight: 1,
        opacity: 1,
        fillOpacity: 0.8
    };
}

function styleRoutes(feature) {
    return {
        color: "#4CAF50", // Green for routes
        weight: 5,
        opacity: 0.7
    };
}

const routeHighlightStyle = {
    color: "#388E3C", // Darker green on hover
    weight: 7,
    opacity: 1
};

function styleAreas(feature) {
    return {
        fillColor: "#FFC107", // Amber for areas
        color: "#FFA000", // Darker amber border
        weight: 2,
        opacity: 1,
        fillOpacity: 0.4
    };
}

const areaHighlightStyle = {
    fillColor: "#FFB300", // Brighter amber on hover
    color: "#FF8F00",
    weight: 3,
    fillOpacity: 0.6
};

// --- GeoJSON Layers for Leaflet Layer Control ---
const poisLayer = L.geoJson(poisGeoJSONData, {
    pointToLayer: function (feature, latlng) {
        // Determine icon and color based on feature type
        const type = feature.properties.type || 'info';
        const poiIcon = iconProperties[type] ? iconProperties[type].icon : "info-circle";
        const poiColor = iconProperties[type] ? iconProperties[type].color : "#777";

        // Create a custom div icon with Font Awesome
        return L.marker(latlng, {
            icon: L.divIcon({
                html: `<div style="background-color: ${poiColor};"
                            class="poi-marker">
                            <i class="fas fa-${poiIcon}"></i>
                          </div>`,
                className: 'poi-marker-container', // Custom class for container styling
                iconSize: [28, 28], // Size of the icon
                iconAnchor: [14, 28] // Anchor point for the icon
            })
        });
    },
    onEachFeature: function (feature, layer) {
        // Bind popup with feature properties
        let popupContent = `<strong>${feature.properties.name}</strong><br>` +
                           `<em>Type:</em> ${feature.properties.type ? feature.properties.type.charAt(0).toUpperCase() + feature.properties.type.slice(1) : 'General Point'}<br>` +
                           `<em>Description:</em> ${feature.properties.description || 'No description available.'}`;
        layer.bindPopup(popupContent);
    }
});

const salzachRiverWalkLayer = L.geoJson(salzachRiverWalkGeoJSONData, {
    style: styleRoutes, // Apply default route style
    onEachFeature: function (feature, layer) {
        // Bind popup for river walk
        let popupContent = `<strong>${feature.properties.name}</strong><br>` +
                           `<em>Description:</em> ${feature.properties.description || 'No description available.'}<br>` +
                           `<em>Length:</em> ${feature.properties.length_km || 'N/A'} km` +
                           `<em>Activity:</em> ${feature.properties.activity || 'N/A'}`;
        layer.bindPopup(popupContent);

        // Add mouseover and mouseout effects for highlighting
        layer.on({
            mouseover: function (e) { layer.setStyle(routeHighlightStyle); },
            mouseout: function (e) { layer.setStyle(styleRoutes(feature)); }
        });
    }
});

const oldTownAreaLayer = L.geoJson(oldTownAreaGeoJSONData, {
    style: styleAreas, // Apply default area style
    onEachFeature: function (feature, layer) {
        // Bind popup for old town area
        let popupContent = `<strong>${feature.properties.name}</strong><br>` +
                           `<em>Description:</em> ${feature.properties.description || 'No description available.'}<br>` +
                           `<em>Designation:</em> ${feature.properties.designation || 'N/A'}`;
        layer.bindPopup(popupContent);

        // Add mouseover and mouseout effects for highlighting
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

// Add layer control to the map, not collapsed by default
L.control.layers(baseLayers, overlayLayers, { collapsed: false }).addTo(map);

// --- Core Application Functions ---
/**
 * Loads city data based on the provided city key and populates the map and attraction list.
 * @param {string} cityKey - The key for the city data in the cityDatabase.
 */
function loadCityData(cityKey) {
    showLoading("Loading city data...");
    clearMapAttractions(); // Clear existing markers and route
    selectedAttractions = []; // Reset selected attractions
    updateRouteInfo(); // Reset route info display
    
    currentCityData = cityDatabase[cityKey];
    if (!currentCityData) {
        hideLoading();
        // Use a custom modal or message box instead of alert()
        console.error("City not found in our database. Please try 'Salzburg'.");
        // Example: displayMessage("City not found in our database. Please try 'Salzburg'.");
        return;
    }
    
    map.setView(currentCityData.center, currentCityData.zoom);
    
    const attractionsListDiv = document.getElementById('attractions-list');
    attractionsListDiv.innerHTML = ''; // Clear previous list items
    
    // Iterate through attractions and add markers to map and list items to panel
    currentCityData.attractions.forEach(attraction => {
        // Create Leaflet marker with custom icon
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
        marker.attractionData = attraction; // Store attraction data on the marker
        attractionMarkers.push(marker); // Add to global list of attraction markers
        
        // Create attraction item for the control panel list
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
        
        // Add click listener to toggle selection
        attractionItem.addEventListener('click', function() {
            toggleAttractionSelection(attraction.id, attractionItem);
        });
        
        attractionsListDiv.appendChild(attractionItem);
    });
    
    document.getElementById('route-name').textContent = `${currentCityData.name} Highlights`;
    
    hideLoading();
}

/**
 * Toggles the selection state of an attraction for route planning.
 * @param {number} attractionId - The ID of the attraction.
 * @param {HTMLElement} element - The DOM element representing the attraction in the list.
 */
function toggleAttractionSelection(attractionId, element) {
    const index = selectedAttractions.indexOf(attractionId);
    const icon = element.querySelector('.fa-plus, .fa-check');
    
    if (index === -1) {
        selectedAttractions.push(attractionId);
        icon.classList.remove('fa-plus');
        icon.classList.add('fa-check');
        element.classList.add('selected'); // Add visual selected class
    } else {
        selectedAttractions.splice(index, 1);
        icon.classList.remove('fa-check');
        icon.classList.add('fa-plus');
        element.classList.remove('selected'); // Remove visual selected class
    }
    
    updateRouteInfo(); // Update the displayed route information
}

/**
 * Updates the route information display in the control panel.
 * Resets distance and time, only shows number of selected stops.
 */
function updateRouteInfo() {
    document.getElementById('route-stops').textContent = selectedAttractions.length;
    document.getElementById('route-distance').textContent = '0 km';
    document.getElementById('route-time').textContent = '0 mins';
}

/**
 * Clears all attraction markers from the map and resets the control panel.
 */
function clearMapAttractions() {
    // Remove all existing attraction markers from the map
    attractionMarkers.forEach(marker => map.removeLayer(marker));
    attractionMarkers = []; // Clear the array
    
    // Remove existing route control if any
    if (routeControl) {
        map.removeControl(routeControl);
        routeControl = null;
    }
    
    // Clear the attraction list in the control panel
    document.getElementById('attractions-list').innerHTML = '';
    
    // Deselect any previously selected attraction items
    document.querySelectorAll('.attraction-item.selected').forEach(item => {
        item.classList.remove('selected');
        const icon = item.querySelector('.fa-check');
        if (icon) {
            icon.classList.remove('fa-check');
            icon.classList.add('fa-plus');
        }
    });

    // Reset route information display
    document.getElementById('route-distance').textContent = '0 km';
    document.getElementById('route-time').textContent = '0 mins';
    document.getElementById('route-stops').textContent = '0';
    document.getElementById('route-name').textContent = 'Selected Highlights';
}

/**
 * Calculates and displays an optimized route based on selected attractions using Leaflet Routing Machine.
 */
function showOptimizedRoute() {
    if (selectedAttractions.length < 2) {
        // Use a custom modal or message box instead of alert()
        console.warn("Please select at least 2 attractions to optimize a route.");
        // Example: displayMessage("Please select at least 2 attractions to optimize a route.");
        return;
    }
    
    showLoading("Calculating optimal route...");
    
    // Simulate network delay for routing calculation
    setTimeout(() => {
        if (routeControl) {
            map.removeControl(routeControl); // Remove existing route if any
        }
        
        // Prepare waypoints from selected attractions
        const waypoints = selectedAttractions.map(id => {
            const attraction = currentCityData.attractions.find(a => a.id === id);
            return L.latLng(attraction.lat, attraction.lng);
        });
        
        // Initialize and add Leaflet Routing Machine control
        routeControl = L.Routing.control({
            waypoints: waypoints,
            show: true, // Show itinerary
            addWaypoints: false, // Prevent adding new waypoints via map clicks
            draggableWaypoints: false, // Prevent dragging existing waypoints
            fitSelectedRoutes: true, // Adjust map view to fit the route
            lineOptions: {
                styles: [{ color: '#007BFF', opacity: 0.8, weight: 6, className: 'optimized-route-line' }] // Style the route line
            },
            createMarker: function() { return null; } // Don't create default markers for waypoints
        }).addTo(map);
        
        // Event listener for successful route calculation
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
        
        // Event listener for routing errors
        routeControl.on('routingerror', function(e) {
            hideLoading();
            console.error("Routing error:", e.error.message);
            // Use a custom modal or message box instead of alert()
            // Example: displayMessage("Could not calculate route. Please try again or select different attractions.");
        });
        
    }, 1000); // Simulate 1 second loading time
}

/**
 * Displays a loading overlay with a given message.
 * @param {string} message - The message to display in the loading overlay.
 */
function showLoading(message) {
    document.getElementById('loading-overlay').style.display = 'flex';
    document.getElementById('loading-text').textContent = message;
}

/**
 * Hides the loading overlay.
 */
function hideLoading() {
    document.getElementById('loading-overlay').style.display = 'none';
}

// --- Event Listeners ---
document.addEventListener('DOMContentLoaded', function() {
    // Event listener for the city search button (currently disabled/fixed to Salzburg)
    document.getElementById('search-btn').addEventListener('click', function() {
        const cityInput = document.getElementById('city-input').value.trim().toLowerCase();
        if (cityInput) {
            loadCityData(cityInput);
        } else {
            // Use a custom modal or message box instead of alert()
            console.warn("Please enter a city name.");
            // Example: displayMessage("Please enter a city name.");
        }
    });
    
    // Allow pressing Enter in the city input field to trigger search
    document.getElementById('city-input').addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            document.getElementById('search-btn').click();
        }
    });
    
    // Event listener for the Optimize Route button
    document.getElementById('optimize-btn').addEventListener('click', showOptimizedRoute);
    
    // Event listener for the Export Map button (simulated functionality)
    document.getElementById('export-btn').addEventListener('click', function() {
        if (routeControl) {
            // Use a custom modal or message box instead of alert()
            console.info("Map export simulated. This would typically generate a PNG or a shareable link of the map with the route.");
            // Example: displayMessage("Map export simulated. This would typically generate a PNG or a shareable link of the map with the route.");
        } else {
            // Use a custom modal or message box instead of alert()
            console.warn("Please optimize a route first before attempting to export.");
            // Example: displayMessage("Please optimize a route first before attempting to export.");
        }
    });

    // Initial load of Salzburg data when the page content is fully loaded
    loadCityData('salzburg');
});
