# 🌍 Salzburg Interactive Map Project

This project delivers an interactive web map focused on the city of Salzburg, Austria, utilizing the Leaflet JavaScript library. It is designed to be easily consumable and explorable, allowing users to interact with and understand key geographical information about Salzburg within a single-page application (SPA).

---
<img width="1366" height="681" alt="image" src="https://github.com/user-attachments/assets/c60b5d9d-0a07-444f-95de-ee71f3622e19" />

Demo : https://jakirhossaincde.github.io/SalzburgCityExplorer/
## Table of Contents

1. [Target User](#1-target-user)  
2. [Data Sources](#2-data-sources)  
3. [Methodology](#3-methodology)  
4. [Design Choices](#4-design-choices)  
5. [Analysis](#5-analysis)  
6. [Potential Improvements](#6-potential-improvements)  
7. [Critical Reflection](#7-critical-reflection)  
8. [Key Takeaways](#8-key-takeaways)

---

## 1. Target User

The primary target users for this interactive map are:

- **Tourists visiting Salzburg**: Seeking an intuitive tool to discover key attractions, explore predefined points of interest (POIs), and plan basic, optimized sightseeing routes.
- **Local residents and curious explorers**: Interested in understanding the spatial distribution of different POI categories or visualizing specific areas within their city.
- **Students or individuals interested in GIS and web mapping**: Providing a practical example of how Leaflet and GeoJSON can be used to create interactive geospatial applications.

The application provides a user-friendly interface to explore Salzburg's geographical features.

---

## 2. Data Sources

All geospatial data used in this prototype is mock/illustrative data hardcoded directly within the `salzburg-map-script.js` file.

### Base Maps

- **OpenStreetMap**: `https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png`
- **Esri World Imagery (Satellite)**: `https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}`
- **OpenTopoMap (Topographic)**: `https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png`

### GeoJSON Data (Mock)

- **Attractions**: Fictional coordinates for key Salzburg landmarks.
- **POIs**: FeatureCollection of various point-based categories (e.g., cafes, museums).
- **Routes**: LineString representing the "Salzach River Walk."
- **Areas**: Polygon for "Salzburg Old Town (Altstadt)."

### Routing

- **Leaflet Routing Machine**: Used to simulate optimized routing based on selected attractions.

---

## 3. Methodology

### Tech Stack

- **HTML5**: Structure for SPA layout (`index.html`)
- **CSS3 / Tailwind CSS**: Styling and responsiveness
- **JavaScript / Leaflet.js**: Core map functionality and interactivity
- **Leaflet Routing Machine**: Simulates route optimization
- **Font Awesome**: Icons for UI and custom markers
- **Chart.js / Plotly.js**: Included via CDN (not actively used in this version)

### UI Structure

- **Left Panel**: Control panel with attraction list, routing tools, and info display
- **Right Panel**: Map view with layer control and overlayed data

### Interactivity

- Selection of attractions for routing
- Popups for all features
- Hover effects for routes/areas
- Dynamic route info display
- Layer toggling via `L.control.layers`

---

## 4. Design Choices

### Palette

- **Primary**: Shades of blue (`#005A9C`, `#007BFF`)
- **Accent**: Green for routes (`#4CAF50`), amber for areas (`#FFC107`)
- **Backgrounds**: Light neutrals (`#f8f9fa`, `#ffffff`)

### Typography

- Font stack: `'Segoe UI', Tahoma, Geneva, Verdana, sans-serif` for clarity and modern feel.

### Layout

- **Responsive Design** using Tailwind CSS
- **Mobile**: Stacked layout
- **Desktop**: Two-column layout

### Feedback

- **Popups**: On-demand info for markers, routes, areas
- **Hover Effects**: On GeoJSON features
- **Loading Overlay**: Spinner during route calculations
- **Selection Highlights**: Attraction list visual cues

---

## 5. Analysis

This SPA meets and exceeds basic interactive map requirements:

✅ **Leaflet Map** with base and overlay layers  
✅ **Multiple Base Maps** via layer control  
✅ **Mock GeoJSON Data** for Points, Lines, Polygons  
✅ **Layer Control** (`L.control.layers`) for toggling content  
✅ **Popups**, **Hover Effects**, **Selectable Attractions**  
✅ **Route Optimization** with visual feedback  
✅ **Custom Markers** and **Responsive UI Design**

---

## 6. Potential Improvements

- **Real Data Integration** from APIs (OpenStreetMap, Wikipedia, etc.)
- **Advanced Routing Features**: Waypoint reordering, transport modes, turn-by-turn directions
- **Search Functionality**: Add geocoding with Nominatim
- **Animated Tours**: Simulated walkthrough with moving markers
- **POI Filtering**: By sub-type or ratings
- **True Map Export**: Use `leaflet-image` or similar libraries
- **User Accounts**: Save/load routes with Firebase
- **Rich Info Popups**: Include historical data, images, external links

---

## 7. Critical Reflection

This project showcased:

- The power and simplicity of Leaflet's `L.control.layers` for managing complex map views.
- How user-centered design significantly influences UI structure—prioritizing usability over linear content.
- Custom `divIcon` markers and dynamic styling added a layer of personalization.
- Integration of plugins (e.g., Leaflet Routing Machine) can dramatically extend functionality.
- The SPA architecture supports fluid interactivity and clear separation of concerns between controls and visuals.

---

## 8. Key Takeaways

- **User-Centric Mapping Wins**: Design around tasks, not reports.
- **Layer Control is Essential**: Simplicity and clarity for map overlays.
- **Interactivity Needs Feedback**: Use hover effects, popups, and dynamic UI changes.
- **Plugins Empower Features**: Extend Leaflet with modular tools.
- **Personalization = Engagement**: Thoughtful visuals and UX matter.
- **Responsiveness Is Non-Negotiable**: SPA must adapt across screens.

---

## License

This is a prototype and intended for educational purposes only. 

---

## Author

*Md Jakir Hossain*  
*Paris Lodron University, Salzburg, Austria*  
*jakirhossain.urpju45@gmail.com*
