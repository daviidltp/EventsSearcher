import React, { useState, useRef, useEffect } from 'react';

declare global {
	interface Window {
	  map?: any;
	  MARTOS_CENTER?: any;
	  hasCenteredMap?: boolean;
	  procesionId?: string;
	  handleLocationRequest?: () => void;
	  animatedMarker?: any; // Para acceder a la posición del paso/trono
    userLocationMarker?: any; // Para acceder al marcador de ubicación del usuario
	}
}
declare const L: any;
import { motion, useAnimation } from 'framer-motion';
import type { PanInfo } from 'framer-motion';

export default function MapBottomSheet() {
  const [isOpen, setIsOpen] = useState(false);
  const snapPoints = {
	closed: "100%",  // Cerrado (fuera de la pantalla)
	peek: "12vh",    // Nueva altura mínima (solo título)
	min: "30vh",     // Altura estándar
	mid: "50vh",     // Altura media
  };

  const [currentSnapPoint, setCurrentSnapPoint] = useState<keyof typeof snapPoints>("peek");
  const controls = useAnimation();
  const constraintsRef = useRef(null);
  const [procesionTitle, setProcesionTitle] = useState('');

  // Función para abrir el panel en el punto especificado
  const openPanel = (snapPoint: keyof typeof snapPoints = "min") => {
    setIsOpen(true);
    setCurrentSnapPoint(snapPoint);
    controls.start({ y: 0, height: snapPoints[snapPoint] });
  };

  // Función para cerrar el panel
  const closePanel = () => {
    controls.start({ y: "100%" }).then(() => {
      setIsOpen(false);
    });
  };

  // Función para mostrar cómo llegar al trono
  // Función mejorada para mostrar cómo llegar al trono
const showDirectionsToTrono = () => {
  // Verificar si el navegador soporta geolocalización
  if ("geolocation" in navigator) {
    try {
      // Mostrar un indicador de carga al usuario
      const loadingToast = document.createElement('div');
      loadingToast.className = 'fixed bottom-20 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white px-4 py-2 rounded-md z-50';
      loadingToast.innerText = 'Obteniendo tu ubicación...';
      document.body.appendChild(loadingToast);
      
      // Obtener la ubicación actual del usuario
      navigator.geolocation.getCurrentPosition(
        function(position) {
          // Eliminar el indicador de carga
          document.body.removeChild(loadingToast);
          
          const userLat = position.coords.latitude;
          const userLng = position.coords.longitude;
          
          // Obtener la posición del trono
          if (window.animatedMarker && window.map && typeof window.animatedMarker.getLatLng === 'function') {
            try {
              const tronoPosition = window.animatedMarker.getLatLng();
              
              if (tronoPosition && tronoPosition.lat && tronoPosition.lng) {
                // Crear un marcador temporal para la ubicación del usuario si no existe
                if (!window.userLocationMarker) {
                  const userIcon = L.divIcon({
                    className: 'user-location-marker',
                    html: `
                      <div style="position: relative;">
                        <div style="width: 18px; height: 18px; background-color: #3b82f6; border-radius: 50%; border: 3px solid white; box-shadow: 0 0 10px rgba(0,0,0,0.5);"></div>
                        <div style="position: absolute; top: 0; left: 0; width: 34px; height: 34px; border-radius: 50%; background: rgba(59, 130, 246, 0.3); animation: pulse 2s infinite; transform: translate(-8px, -8px);"></div>
                      </div>
                    `,
                    iconSize: [24, 24],
                    iconAnchor: [12, 12]
                  });
                  
                  window.userLocationMarker = L.marker([userLat, userLng], {
                    icon: userIcon,
                    zIndexOffset: 1000
                  }).addTo(window.map);
                }
                
                // Abrir Google Maps con la ruta desde la ubicación del usuario hasta el trono
                const url = `https://www.google.com/maps/dir/?api=1&origin=${userLat},${userLng}&destination=${tronoPosition.lat},${tronoPosition.lng}&travelmode=walking`;
                window.open(url, '_blank');
              } else {
                alert("No se pudo obtener la posición exacta del paso procesional.");
              }
            } catch (error) {
              console.error("Error al obtener la posición del trono:", error);
              alert("No se pudo obtener la posición del trono. Por favor, inténtalo más tarde.");
            }
          } else {
            alert("El paso procesional no está disponible en este momento o no hay datos de su posición.");
          }
        },
        function(error) {
          // Eliminar el indicador de carga
          document.body.removeChild(loadingToast);
          
          let errorMsg;
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
        },
        {
          enableHighAccuracy: true,
          timeout: 8000, // Aumentado para mayor precisión
          maximumAge: 0
        }
      );
    } catch (error) {
      console.error("Error al procesar la solicitud:", error);
      alert("Ocurrió un error al procesar tu solicitud. Por favor, inténtalo de nuevo.");
    }
  } else {
    alert("Tu navegador no soporta geolocalización");
  }
};

  // Función para obtener 'mi ubicación'
const showMyLocation = () => {
	if ("geolocation" in navigator) {
	  navigator.geolocation.getCurrentPosition(
		function(position) {
		  const userLat = position.coords.latitude;
		  const userLng = position.coords.longitude;
		  
		  if (window.map) {
			// Crear un marcador personalizado para la ubicación del usuario si no existe
			let userMarker;
			
			// Eliminar marcador anterior si existe
			if (window.userLocationMarker) {
			  window.map.removeLayer(window.userLocationMarker);
			}
			
			// Crear un icono personalizado para una mejor visualización
			const userIcon = L.divIcon({
			  className: 'user-location-marker',
			  html: `
				<div style="position: relative;">
				  <div style="width: 18px; height: 18px; background-color: #3b82f6; border-radius: 50%; border: 3px solid white; box-shadow: 0 0 10px rgba(0,0,0,0.5);"></div>
				  <div style="position: absolute; top: 0; left: 0; width: 34px; height: 34px; border-radius: 50%; background: rgba(59, 130, 246, 0.3); animation: pulse 2s infinite; transform: translate(-8px, -8px);"></div>
				</div>
			  `,
			  iconSize: [24, 24],
			  iconAnchor: [12, 12]
			});
			
			// Crear el marcador y añadirlo al mapa
			userMarker = L.marker([userLat, userLng], {
			  icon: userIcon,
			  zIndexOffset: 1000
			}).addTo(window.map);
			
			// Almacenar referencia al marcador
			window.userLocationMarker = userMarker;
			
			// Mostrar el popup "Estás aquí"
			userMarker.bindPopup('<strong>¡Estás aquí!</strong>').openPopup();
			
			// Centrar el mapa en la ubicación
			window.map.flyTo([userLat, userLng], 18);
		  } else {
			alert("No se puede mostrar tu ubicación en este momento.");
		  }
		},
		function(error) {
		  let errorMsg;
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
		},
		{
		  enableHighAccuracy: true,
		  timeout: 5000,
		  maximumAge: 0
		}
	  );
	} else {
	  alert("Tu navegador no soporta geolocalización");
	}
  };

  // Función que se ejecuta cuando termina un gesto de arrastre
  const handleDragEnd = (event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    const threshold = 50; // umbral en píxeles para decidir la acción
    const velocity = info.velocity.y;

    // Si el usuario arrastró hacia abajo rápidamente, cerrar el panel
    if (velocity > 500) {
      closePanel();
      return;
    }

    // Si el arrastre fue significativo, calcular el punto de anclaje más cercano
    if (Math.abs(info.offset.y) > threshold) {
      // Arrastre hacia abajo (positivo en Y)
      if (info.offset.y > 0) {
		if (currentSnapPoint === "mid") {
		  setCurrentSnapPoint("min");
		  controls.start({ height: snapPoints.min, y: 0 });
		} else if (currentSnapPoint === "min") {
		  setCurrentSnapPoint("peek");
		  controls.start({ height: snapPoints.peek, y: 0 });
		} else if (currentSnapPoint === "peek") {
		  closePanel();
		}
	  } 
      // Arrastre hacia arriba (negativo en Y)
      else {
		if (currentSnapPoint === "peek") {
		  setCurrentSnapPoint("min");
		  controls.start({ height: snapPoints.min, y: 0 });
		} else if (currentSnapPoint === "min") {
		  setCurrentSnapPoint("mid");
		  controls.start({ height: snapPoints.mid, y: 0 });
		}
	  }
    } else {
      // Si el arrastre no fue significativo, volver al punto actual
      controls.start({ height: snapPoints[currentSnapPoint], y: 0 });
    }
  };
  // Añade esta nueva función en tu componente
const updateStreetName = () => {
	if (window.animatedMarker && typeof window.animatedMarker.getLatLng === 'function') {
	  try {
		const position = window.animatedMarker.getLatLng();
		if (!position || !position.lat || !position.lng) return;
		
		// Usar la API de geocodificación inversa de Nominatim (OpenStreetMap)
		fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${position.lat}&lon=${position.lng}&zoom=18&addressdetails=1`)
		  .then(response => response.json())
		  .then(data => {
			// Obtener el nombre de la calle de la respuesta
			let streetName = 'Recorrido procesional';
			
			if (data.address) {
			  if (data.address.road) {
				streetName = data.address.road;
			  } else if (data.address.pedestrian) {
				streetName = data.address.pedestrian;
			  } else if (data.address.square) {
				streetName = `Plaza ${data.address.square}`;
			  }
			}
			
			// Actualizar el elemento de la calle en el UI
			const streetElement = document.getElementById('current-street');
			if (streetElement) {
			  streetElement.textContent = streetName;
			}
		  })
		  .catch(error => {
			console.error('Error al obtener nombre de la calle:', error);
		  });
	  } catch (error) {
		console.error('Error al acceder a la posición del trono:', error);
	  }
	}
  };
  
  // Añade un efecto para actualizar la calle periódicamente
  useEffect(() => {
	if (isOpen) {
	  // Actualizar la calle inmediatamente al abrir el panel
	  updateStreetName();
	  
	  // Configurar un intervalo para actualizar la calle cada 10 segundos
	  const intervalId = setInterval(updateStreetName, 10000);
	  
	  // Limpiar el intervalo al cerrar el panel
	  return () => clearInterval(intervalId);
	}
  }, [isOpen]);

  // Obtener el título formateado del ID de procesión
useEffect(() => {
	if (typeof window !== 'undefined' && window.procesionId) {
	  // Convertir "-" a espacios y poner en mayúscula la primera letra de cada palabra
	  const title = window.procesionId
		.split('-')
		.map(word => word.charAt(0).toUpperCase() + word.slice(1))
		.join(' ');
	  
	  setProcesionTitle(title);
	}
  }, []);

  return (
    <>
      {/* Botón flotante para abrir el panel */}
      <button 
        onClick={() => isOpen ? closePanel() : openPanel("min")} 
        className="fixed z-50 bottom-5 right-5 bg-blue-600 hover:bg-blue-700 text-white w-12 h-12 rounded-full shadow-lg flex items-center justify-center transition-transform active:scale-95"
        aria-label="Abrir panel de controles"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 20 20" fill="currentColor">
          {isOpen ? 
            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" /> :
            <path d="M10 5a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h5zM15 15a2 2 0 100-4 2 2 0 000 4z" />
          }
        </svg>
      </button>

      <motion.div 
        ref={constraintsRef}
		initial={{ y: "100%" }}
		animate={controls}
		exit={{ y: "100%" }}
		transition={{ type: "spring", bounce: 0.1, duration: 0.5 }}
		className="fixed bottom-0 left-0 right-0 bg-white z-40 rounded-t-2xl overflow-hidden
				   border-t-4 
				   shadow-[0_-10px_30px_rgba(0,0,0,0.25)] "
		style={{ height: snapPoints.min }}
		drag="y"
		dragConstraints={{ top: 0, bottom: 0 }}
		dragElastic={0.2}
		dragMomentum={true}
		onDragEnd={handleDragEnd}
      >
        {/* Manejador para arrastrar - visual más prominente */}
        <div className="w-full h-8 flex justify-center items-center cursor-grab active:cursor-grabbing">
          <div className="w-12 h-1.5 bg-gray-300 rounded-full"></div>
        </div>

        {/* Contenido del BottomSheet */}
		<div className="px-4 pb-8 overflow-y-auto" style={{ height: "calc(100% - 32px)" }}>
		{/* Título de la procesión con estilo destacado */}
		<h2 className="text-center text-2xl font-serif font-bold text-gray-800 mb-3 pb-2 border-b border-gray-200">
			{procesionTitle}
		</h2>
		
		{/* Calle actual - Colocado justo debajo del título */}
		<div className="text-center mb-5">
			<p className="text-gray-700 text-lg">
			<span id="current-street" className="font-medium">Recorrido procesional</span>
			</p>
		</div>
		
		{/* Botones de control - Rediseñados como ovales más pequeños */}
		<div className="flex justify-center space-x-4 mb-6">
			<button 
			onClick={(e) => {
				e.stopPropagation();
				showMyLocation();
			}} 
			className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-full flex items-center shadow-md transition-transform active:scale-95"
			>
			<svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
				<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
			</svg>
			<span className="text-sm">Mi ubicación</span>
			</button>
			
			<button 
			className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-full flex items-center shadow-md transition-transform active:scale-95"
			onClick={(e) => {
				e.stopPropagation();
				if (window.map && window.animatedMarker) {
				try {
					const tronoPosition = window.animatedMarker.getLatLng();
					window.map.setView(tronoPosition, 18);
					window.hasCenteredMap = true;
				} catch (error) {
					console.error("No se pudo centrar en el trono:", error);
					if (window.MARTOS_CENTER) {
					window.map.setView(window.MARTOS_CENTER, 16);
					}
				}
				} else {
				alert("No se puede centrar en el trono en este momento.");
				}
			}}
			>
			<svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
				<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M4 19h16M12 3v10m-5 6V9m10 10V9m-5-6l-5 6h10l-5-6z" />
			</svg>
			<span className="text-sm">Ver trono</span>
			</button>

			<button 
			className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-full flex items-center shadow-md transition-transform active:scale-95"
			onClick={(e) => {
				e.stopPropagation();
				showDirectionsToTrono();
			}}
			>
			<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
					<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
					<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
			</svg>
			<span className="text-sm">Cómo llegar</span>
			</button>
		</div>

		{/* Información detallada sobre la procesión - Se mantiene igual */}
		<div className="bg-gray-100 p-4 rounded-lg mb-6">
			<h4 className="font-bold mb-2 text-gray-800">Información del recorrido</h4>
			<div className="mt-2 h-1.5 bg-blue-200 rounded-full overflow-hidden">
			<div id="progress-bar" className="bg-blue-600 h-1.5 rounded-full transition-all duration-700" style={{ width: "0%" }}></div>
			</div>
			<p className="text-sm text-gray-600 mt-1">Progreso: <span id="progress-percent">0%</span> del recorrido completado</p>
		</div>
		</div>
      </motion.div>
    </>
  );
}