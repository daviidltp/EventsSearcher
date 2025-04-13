export function initMap() {
    // Verificar si hay datos de ruta
    if (!route || route.length < 2) {
      console.error("No se proporcionó una ruta válida");
      return;
    }

    // Registrar información de los datos para depuración
    console.log(`Ruta cargada: ${route.length} puntos`);
    console.log(`Puntos de interés: ${points.length} marcadores`);
    
    try {
      // Crear mapa base con Leaflet
      map = L.map('map', {
        center: MARTOS_CENTER,
        zoom: 16,
        minZoom: 14,
        maxZoom: 19,
        attributionControl: false  // Esto desactiva el panel de atribución
      });
      
      // Capa base de imágenes satelitales
   /*   L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
        attribution: false,
        maxZoom: 19
      }).addTo(map);*/

      // Capa base de mapa "normal" tipo Google Maps
      L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
        attribution: '© OpenStreetMap contributors',
        maxZoom: 19
      }).addTo(map);


      // Capa de etiquetas para nombres de calles con mejor contraste y legibilidad
      L.tileLayer('https://cartodb-basemaps-{s}.global.ssl.fastly.net/light_only_labels/{z}/{x}/{y}{r}.png', {
        attribution: false,
        subdomains: 'abcd',
        maxZoom: 19,
        opacity: 1.0,
        className: 'street-labels-layer'
      }).addTo(map);
      
      // Capa para la ruta completa con efecto "ant path"
      routeLayer = L.polyline.antPath(route, {
        color: '#3388ff',
        weight: 5,
        opacity: 0.8,
        delay: 2500,
        dashArray: [10, 20],
        pulseColor: '#FFFFFF',
        paused: false,
        hardwareAccelerated: true
      }).addTo(map);
      
      // Capa para la parte de la ruta ya recorrida (dorada)
      completedRouteLayer = L.polyline([], {
        color: 'gold',
        weight: 6,
        opacity: 0.9,
        className: 'route-glow'
      }).addTo(map);
      
      // Centrar el mapa en la ruta
      map.fitBounds(routeLayer.getBounds(), { padding: [30, 30] });
      
      // Crear el icono del paso procesional
      const pasoColoridoSVG = `
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 120" width="60" height="72">
          <!-- Base dorada y estructura del trono -->
          <rect x="15" y="90" width="70" height="12" fill="#B8860B" stroke="#8B4513" stroke-width="1"/>
          <rect x="20" y="85" width="60" height="5" fill="#DAA520" stroke="#B8860B" stroke-width="0.5"/>
          
          <!-- Patas ornamentadas -->
          <rect x="20" y="90" width="5" height="12" fill="#8B4513" stroke="#5D2906" stroke-width="0.5" rx="1"/>
          <rect x="75" y="90" width="5" height="12" fill="#8B4513" stroke="#5D2906" stroke-width="0.5" rx="1"/>
          
          <!-- Nivel medio del trono con terciopelo -->
          <rect x="22" y="70" width="56" height="15" fill="#800020" stroke="#4B0010" stroke-width="1"/>
          <!-- Bordes dorados -->
          <rect x="20" y="70" width="60" height="2" fill="#DAA520" stroke="#B8860B" stroke-width="0.5"/>
          <rect x="20" y="83" width="60" height="2" fill="#DAA520" stroke="#B8860B" stroke-width="0.5"/>
          
          <!-- Cruz principal -->
          <rect x="48" y="20" width="4" height="50" fill="#8B4513" stroke="#5D2906" stroke-width="1"/>
          <rect x="35" y="30" width="30" height="4" fill="#8B4513" stroke="#5D2906" stroke-width="1"/>
          
          <!-- Cristo en la cruz (simplificado pero reconocible) -->
          <path d="M50,30 Q48,35 45,40 L50,40 L55,40 Q52,35 50,30" fill="#FFE4C4" stroke="#8B4513" stroke-width="0.5"/>
          <path d="M45,40 L41,55 M55,40 L59,55" stroke="#FFE4C4" stroke-width="2" stroke-linecap="round"/>
          <circle cx="50" cy="27" r="3" fill="#FFE4C4" stroke="#8B4513" stroke-width="0.5"/> <!-- Cabeza -->
          
          <!-- Corona de espinas -->
          <path d="M47,25 Q50,22 53,25" stroke="#8B4513" stroke-width="0.5" fill="none"/>
          
          <!-- Candelabros y velas a los lados -->
          <!-- Izquierdo -->
          <rect x="25" y="60" width="2" height="10" fill="#B8860B" stroke="#8B4513" stroke-width="0.3"/>
          <rect x="24.5" y="50" width="3" height="10" fill="#B8860B" stroke="#8B4513" stroke-width="0.3"/>
          <rect x="25" y="45" width="2" height="5" fill="#FFF8DC" stroke="#DCDCDC" stroke-width="0.2"/>
          <circle cx="26" cy="44" r="1" fill="#FFFF00" class="light-pulse" opacity="0.9"/>
          
          <!-- Derecho -->
          <rect x="73" y="60" width="2" height="10" fill="#B8860B" stroke="#8B4513" stroke-width="0.3"/>
          <rect x="72.5" y="50" width="3" height="10" fill="#B8860B" stroke="#8B4513" stroke-width="0.3"/>
          <rect x="73" y="45" width="2" height="5" fill="#FFF8DC" stroke="#DCDCDC" stroke-width="0.2"/>
          <circle cx="74" cy="44" r="1" fill="#FFFF00" class="light-pulse" opacity="0.9"/>
          
          <!-- Decoraciones florales -->
          <!-- Centro -->
          <ellipse cx="50" cy="65" rx="10" ry="4" fill="#800020" opacity="0.7"/>
          <circle cx="46" cy="64" r="2" fill="#FF0000" opacity="0.9"/>
          <circle cx="50" cy="63" r="2" fill="#FFFFFF" opacity="0.9"/>
          <circle cx="54" cy="64" r="2" fill="#FF0000" opacity="0.9"/>
          
          <!-- Laterales -->
          <!-- Izquierda -->
          <circle cx="32" cy="70" r="3" fill="#A020F0" opacity="0.8"/>
          <circle cx="35" cy="72" r="2.5" fill="#FFFFFF" opacity="0.8"/>
          <circle cx="31" cy="74" r="2" fill="#FF4500" opacity="0.8"/>
          
          <!-- Derecha -->
          <circle cx="68" cy="70" r="3" fill="#A020F0" opacity="0.8"/>
          <circle cx="65" cy="72" r="2.5" fill="#FFFFFF" opacity="0.8"/>
          <circle cx="69" cy="74" r="2" fill="#FF4500" opacity="0.8"/>
          
          <!-- Luces ambientales -->
          <circle cx="25" cy="65" r="2" fill="#FFFF00" opacity="0.3" class="ambient-light"/>
          <circle cx="75" cy="65" r="2" fill="#FFFF00" opacity="0.3" class="ambient-light"/>
          <circle cx="50" cy="58" r="3" fill="#FFFF00" opacity="0.2" class="ambient-light"/>
        </svg>
      `;
      
      // Crear el div icon con el SVG animado
      const tronoIcon = L.divIcon({
        className: 'custom-paso-marker',
        html: `
          <div class="paso-container" aria-label="Paso procesional avanzando por el recorrido">
			${pasoColoridoSVG}
		  <div class="paso-shadow" role="presentation"></div>
		</div>
        `,
        iconSize: [60, 72],
        iconAnchor: [30, 45],
        zIndexOffset: 1000
      });
      
      // Crear el marcador en la posición inicial
      animatedMarker = L.marker(route[0], { 
        icon: tronoIcon,
        zIndexOffset: 1000
      }).addTo(map);
      
      // Añadir marcadores de inicio y fin
      L.marker(route[0], {
        icon: createCustomIcon('green', 'Inicio')
      }).addTo(map).bindPopup('<strong>Punto de Inicio</strong><p>Comienza el recorrido procesional</p>');
      
      L.marker(route[route.length - 1], {
        icon: createCustomIcon('red', 'Fin') 
      }).addTo(map).bindPopup('<strong>Punto Final</strong>');
      
      // Añadir puntos de interés
      if (points && points.length > 0) {
        points.forEach(point => {
          // Determinar si es una plaza u otro punto de interés basado en el título
          const isPlaza = point.title.toLowerCase().includes('plaza');
          
          L.marker(point.position, {
            // Usar el icono adecuado según el tipo
            icon: isPlaza ? createPlazaIcon(point.title) : createIglesiaIcon(point.title)
          }).addTo(map).bindPopup(`
            <strong>${point.title}</strong>
            ${point.description ? `<br>${point.description}` : ''}
          `);
        });
      }
      
      // Configurar eventos para los botones con stopPropagation
	// document.getElementById('location-btn').addEventListener('click', function(e) {
	// 	e.stopPropagation(); // Detiene la propagación
	// 	handleLocationRequest();
	// });

	// document.getElementById('back-btn').addEventListener('click', function(e) {
	// 	e.stopPropagation(); // Detiene la propagación
	// 	window.history.back();
	// });

	// document.getElementById('play-btn').addEventListener('click', function(e) {
	// 	e.stopPropagation(); // Detiene la propagación
	// 	toggleAnimation();
	// });
      
      
      // Inicializar la visualización en la posición inicial
      updatePosition(0);
      updateCurrentStreet(0);
      // Coger ultima ubicacion
      const estaEnCalle = JSON.parse(enCalleJSON);

      if (estaEnCalle) {
        addLastLocationMarker();
      }
      console.log("En calle ", estaEnCalle);

      
    } catch (error) {
      console.error("Error al inicializar el mapa:", error);
    }
	// Añadir al final de initMap() justo antes del } de cierre
	// initBottomSheet();
  }