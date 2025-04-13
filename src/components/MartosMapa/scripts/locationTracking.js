// Función para seguir la ubicación de la procesión en tiempo real
export function trackProcessionLocation() {
	console.log('Iniciando conexión EventSource...');
	
	try {
	  // Crear una conexión EventSource a la API con manejo de errores
	  const eventSource = new EventSource('https://pl15030.ddns.net/itinero/api2/broadcast/');
	  
	  // Variable para rastrear si hemos recibido datos
	  let receivedData = false;
	  
	  // Definir un temporizador para verificar si llegaron datos
	  const connectionTimer = setTimeout(() => {
		if (!receivedData) {
		  console.warn("No se recibieron datos de la API después de 10 segundos");
		  eventSource.close();
		  activateSimulationMode();
		}
	  }, 10000);
	  
	  // Escuchar los eventos 'postData'
	  eventSource.addEventListener("postData", function(e) {
		try {
		  receivedData = true;
		  clearTimeout(connectionTimer);
		  
		  const mapVars = window.mapVars;
		  const message = JSON.parse(e.data);
		  console.log('Evento recibido:', message);
		  
		  const modem = message.modem;
		  const lat = parseFloat(message.latitud);
		  const lon = parseFloat(message.longitud);
		  
		  // Solo procesar si es el modem 1 y coordenadas son válidas
		  if (modem === "1" && !isEmpty(message.latitud) && !isEmpty(message.longitud) && !isNaN(lat) && !isNaN(lon)) {
			console.log('Posición actualizada del modem 1:', [lat, lon]);
			
			// Guardar la última posición conocida
			mapVars.lastModemPosition[modem] = [lat, lon];
			
			// Actualizar el marcador si ya existe o crear uno nuevo
			if (mapVars.markerMap.has(modem)) {
			  // Actualizar la posición del marcador existente
			  mapVars.animatedMarker.setLatLng([lat, lon]);
			} else {
			  // Si no tenemos un marcador específico para este modem, usamos el principal
			  mapVars.animatedMarker.setLatLng([lat, lon]);
			  mapVars.markerMap.set(modem, mapVars.animatedMarker);
			}
			
			// Encontrar el punto de la ruta más cercano
			let closestPointIndex = 0;
			let minDistance = Infinity;
			
			for (let i = 0; i < mapVars.route.length; i++) {
			  const routePoint = mapVars.route[i];
			  const distance = Math.sqrt(
				Math.pow(routePoint[0] - lat, 2) + 
				Math.pow(routePoint[1] - lon, 2)
			  );
			  
			  if (distance < minDistance) {
				minDistance = distance;
				closestPointIndex = i;
			  }
			}
			
			// Actualizar la ruta completada
			mapVars.currentPosition = closestPointIndex;
			const completedPath = mapVars.route.slice(0, closestPointIndex + 1).concat([[lat, lon]]);
			mapVars.completedRouteLayer.setLatLngs(completedPath);
			
			// Centrar el mapa en la posición actual
			mapVars.map.panTo([lat, lon]);
		  }
		} catch (err) {
		  console.error("Error al procesar datos de localización:", err);
		}
	  });
	  
	  // Escuchar evento de conexión establecida
	  eventSource.addEventListener('open', function() {
		console.log('Conexión SSE establecida correctamente');
	  });
	  
	  // Manejar errores de conexión
	  eventSource.onerror = function(err) {
		console.error("Error en la conexión SSE:", err);
		clearTimeout(connectionTimer);
		eventSource.close();
		
		// Verificar si se trata de un problema de CORS
		if (err instanceof Event && err.target && err.target.readyState === 2) {
		  console.warn("Error de CORS detectado, activando modo de simulación");
		  activateSimulationMode();
		} else {
		  // Reintentar conexión después de un tiempo
		  setTimeout(trackProcessionLocation, 5000);
		}
	  };
	} catch (error) {
	  console.error("Error al crear la conexión EventSource:", error);
	  activateSimulationMode();
	}
  }