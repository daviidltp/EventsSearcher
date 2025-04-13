// Variables para la geolocalización
let isGpsRequestInProgress = false;

// Función para mostrar la ubicación del usuario
function handleLocationRequest() {
	if (!map || isGpsRequestInProgress) return; // Prevenir múltiples clics
    
    if (!isLocationActive) {
      // Activar
      if ("geolocation" in navigator) {
		isGpsRequestInProgress = true;
        // Cambiar estilo del botón para indicar activación
        document.getElementById('location-btn').classList.add('active-btn');
        
        // Intentar obtener ubicación
        navigator.geolocation.getCurrentPosition(
          // Éxito
          function(position) {
            const userLat = position.coords.latitude;
            const userLng = position.coords.longitude;
            isGpsRequestInProgress = false;
            // Crear icono de ubicación si no existe
            if (!userLocationMarker) {
              // Crear icono personalizado para la ubicación
              const userIcon = L.divIcon({
                className: 'user-location-marker',
                html: `
                  <div class="user-dot">
                    <div class="user-pulse"></div>
                  </div>
                `,
                iconSize: [24, 24],
                iconAnchor: [12, 12]
              });
              
              userLocationMarker = L.marker([userLat, userLng], {
                icon: userIcon,
                zIndexOffset: 2000
              }).addTo(map);
              
              // Añadir popup
              userLocationMarker.bindPopup('¡Estás aquí!').openPopup();
            } else {
              // Actualizar posición
              userLocationMarker.setLatLng([userLat, userLng]);
              userLocationMarker.openPopup();
            }
            
            // Centrar mapa en la ubicación
            map.flyTo([userLat, userLng], 17);
            isLocationActive = true;
          },
          // Error
          function(error) {
            let errorMsg;
			isGpsRequestInProgress = false;
            switch(error.code) {
              case error.PERMISSION_DENIED:
                errorMsg = "Necesitas permitir el acceso a tu ubicación para usar esta función.";
                break;
              case error.POSITION_UNAVAILABLE:
                errorMsg = "No se puede determinar tu ubicación actual.";
                break;
              case error.TIMEOUT:
                errorMsg = "Se agotó el tiempo para obtener tu ubicación.";
                break;
              default:
                errorMsg = "Ocurrió un error al intentar obtener tu ubicación.";
            }
            
            alert(errorMsg);
            
            // Restaurar estilo del botón
            document.getElementById('location-btn').classList.remove('active-btn');
          },
          // Opciones
          {
            enableHighAccuracy: true,
            timeout: 5000,
            maximumAge: 0
          }
        );
      } else {
        alert("Tu navegador no soporta geolocalización");
		isGpsRequestInProgress = false;
      }
    } else {
      // Desactivar
      if (userLocationMarker) {
        userLocationMarker.closePopup();
        map.removeLayer(userLocationMarker);
        userLocationMarker = null;
		isGpsRequestInProgress = false;
      }
      
      document.getElementById('location-btn').classList.remove('active-btn');
      isLocationActive = false;
    }
  }