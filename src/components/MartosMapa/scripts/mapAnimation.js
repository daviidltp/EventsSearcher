// Función para iniciar/pausar la animación
export function toggleAnimation() {
	const mapVars = window.mapVars;
	const playIcon = document.getElementById('play-icon');
	const pauseIcon = document.getElementById('pause-icon');
	
	mapVars.isPaused = !mapVars.isPaused;
	
	if (mapVars.isPaused) {
	  // Detener animación
	  playIcon.classList.remove('hidden');
	  pauseIcon.classList.add('hidden');
	  cancelAnimationFrame(mapVars.animationId);
	} else {
	  // Iniciar animación
	  playIcon.classList.add('hidden');
	  pauseIcon.classList.remove('hidden');
	  
	  // Si ya llegó al final, reiniciar
	  if (mapVars.currentPosition >= mapVars.route.length - 1) {
		mapVars.currentPosition = 0;
		mapVars.completedRouteLayer.setLatLngs([]);
	  }
	  
	  animateRoute();
	}
  }
  
  // Función para animar la ruta
  export function animateRoute() {
	const mapVars = window.mapVars;
	
	if (mapVars.isPaused) return;
	
	mapVars.currentPosition += mapVars.animationSpeed;
	
	if (mapVars.currentPosition >= mapVars.route.length - 1) {
	  mapVars.currentPosition = mapVars.route.length - 1;
	  mapVars.isPaused = true;
	  document.getElementById('play-icon').classList.remove('hidden');
	  document.getElementById('pause-icon').classList.add('hidden');
	} else {
	  mapVars.animationId = requestAnimationFrame(animateRoute);
	}
	
	updatePosition(mapVars.currentPosition);
	updateCurrentStreet(mapVars.currentPosition);
  }
  
  // Función para actualizar la posición en la ruta
  export function updatePosition(position) {
	const mapVars = window.mapVars;
	
	// Verificar si hay datos válidos
	if (!mapVars.map || !mapVars.route || mapVars.route.length < 2 || 
		!mapVars.completedRouteLayer || !mapVars.animatedMarker) return;
	
	const currentIndex = Math.floor(position);
	const nextIndex = Math.min(currentIndex + 1, mapVars.route.length - 1);
	const fraction = position - currentIndex;
	
	// Interpolar entre los dos puntos
	const lat = mapVars.route[currentIndex][0] + fraction * (mapVars.route[nextIndex][0] - mapVars.route[currentIndex][0]);
	const lng = mapVars.route[currentIndex][1] + fraction * (mapVars.route[nextIndex][1] - mapVars.route[currentIndex][1]);
	
	// Actualizar posición del marcador
	mapVars.animatedMarker.setLatLng([lat, lng]);
	
	// Actualizar la línea recorrida
	const completedPath = mapVars.route.slice(0, currentIndex + 1).concat([[lat, lng]]);
	mapVars.completedRouteLayer.setLatLngs(completedPath);
	
	// Centrar en la posición actual
	mapVars.map.panTo([lat, lng]);
  }
  
  // Función para actualizar el nombre de la calle actual
  export function updateCurrentStreet(position) {
	const currentIndex = Math.floor(position);
	let streetName = "Recorrido procesional";
	
	// Buscar en qué segmento de calle estamos
	// Descomentado para cuando haya datos específicos de calles
	/*
	for (const segment of streetSegments) {
	  if (currentIndex >= segment.startIndex && currentIndex <= segment.endIndex) {
		streetName = segment.name;
		break;
	  }
	}
	*/
	
	// Actualizar el texto de la calle actual cuando esté activo el bottom sheet
	// document.getElementById('current-street').textContent = streetName;
  }
  
  // Función para activar modo de demostración cuando la conexión SSE falla
  export function activateSimulationMode() {
	const mapVars = window.mapVars;
	
	// Mostrar notificación al usuario
	const notificationDiv = document.createElement('div');
	notificationDiv.className = 'demo-notification';
	notificationDiv.innerHTML = 'Usando modo de demostración - Datos en tiempo real no disponibles';
	document.body.appendChild(notificationDiv);
	
	// Iniciar animación automática después de 2 segundos
	setTimeout(() => {
	  mapVars.isPaused = false;
	  animateRoute();
	  
	  // Ocultar notificación después de 5 segundos
	  setTimeout(() => {
		notificationDiv.style.opacity = 0;
		setTimeout(() => notificationDiv.remove(), 1000);
	  }, 5000);
	}, 2000);
  }
  
  // Función auxiliar para verificar cadenas vacías
  export function isEmpty(str) {
	return (!str || str.length === 0 || str === "0" || str === "0.0");
  }