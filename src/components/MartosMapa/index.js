// Exportación de todas las funciones para uso en MartosMapa2D.astro
export { initMap, createCustomIcon, createIglesiaIcon, createPlazaIcon } from './scripts/mapInit.js';
export { 
  toggleAnimation, animateRoute, updatePosition, updateCurrentStreet,
  activateSimulationMode, isEmpty
} from './scripts/mapAnimation.js';
export { handleLocationRequest, isGpsRequestInProgress } from './scripts/mapMarkers.js';
export { trackProcessionLocation } from './scripts/locationTracking.js';