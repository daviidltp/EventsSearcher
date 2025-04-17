import React, { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { PanInfo } from 'framer-motion';

declare global {
  interface Window {
    map?: any;
    MARTOS_CENTER?: any;
    hasCenteredMap?: boolean;
    procesionId?: string;
    handleLocationRequest?: () => void;
    animatedMarker?: any;        // Para acceder a la posición del paso/trono
    userLocationMarker?: any;     // Para acceder al marcador de ubicación del usuario
  }
}

declare const L: any;

export default function MapBottomSheet({ procesionId }: { procesionId?: string }) {
  // Por defecto el panel está abierto
  const [panelVisible, setPanelVisible] = useState(true);
  const [procesionTitle, setProcesionTitle] = useState('');
  const [mostrarTexto, setMostrarTexto] = useState('Recorrido procesional');
  
  //Controlador alteraciones texto/anuncio
  const [showImage, setShowImage] = useState(false);
  // Referencia para el carrusel
  const carouselRef = useRef<HTMLDivElement>(null);
  // Estado para la posición del carrusel (0: texto, 1: imagen 1, 2: imagen 2)
  const [carouselIndex, setCarouselIndex] = useState(0);
  // Estado para el arrastre
  const [isDragging, setIsDragging] = useState(false);

  // Función para manejar el final del arrastre
  const handleDragEnd = (event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    const threshold = 50; // umbral en píxeles para decidir la acción
    
    if (Math.abs(info.offset.x) > threshold) {
      if (info.offset.x > 0) {
        setCarouselIndex(prevIndex => Math.max(0, prevIndex - 1));
      } else {
        setCarouselIndex(prevIndex => Math.min(2, prevIndex + 1));
      }
      setShowImage(carouselIndex !== 0);
    }
    setIsDragging(false);
  };

  // Función para alternar contenido manualmente
  const toggleContent = () => {
    setCarouselIndex(prevIndex => {
      const newIndex = (prevIndex + 1) % 3;
      setShowImage(newIndex !== 0);
      return newIndex;
    });
  };

  // Función que envuelve la petición de ubicación y comprueba permisos
  const handleLocationRequest = () => {
    if (!('geolocation' in navigator)) {
      alert('Tu navegador no soporta geolocalización');
      return;
    }
    if (navigator.permissions && navigator.permissions.query) {
      navigator.permissions.query({ name: 'geolocation' as PermissionName }).then(result => {
        if (result.state === 'denied') {
          alert(
            'Parece que has bloqueado el acceso a la ubicación.\n' +
            'Por favor, ve a Ajustes > Safari > Privacidad > Ubicación y permite el acceso para este sitio.'
          );
        } else {
          showMyLocation();
        }
      }).catch(() => {
        showMyLocation();
      });
    } else {
      showMyLocation();
    }
  };

  // Función para mostrar la ubicación del usuario en el mapa
  const showMyLocation = () => {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        if (window.map) {
          if (window.userLocationMarker) {
            window.map.removeLayer(window.userLocationMarker);
          }
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
          window.userLocationMarker = L.marker([latitude, longitude], { icon: userIcon, zIndexOffset: 1000 }).addTo(window.map);
          window.userLocationMarker.bindPopup('<strong>¡Estás aquí!</strong>').openPopup();
          window.map.flyTo([latitude, longitude], 18);
        }
      },
      (error) => {
        let errorMsg;
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMsg = 'Necesitas permitir el acceso a tu ubicación para usar esta función.';
            break;
          case error.POSITION_UNAVAILABLE:
            errorMsg = 'No se puede determinar tu ubicación actual.';
            break;
          case error.TIMEOUT:
            errorMsg = 'Se agotó el tiempo para obtener tu ubicación.';
            break;
          default:
            errorMsg = 'Ocurrió un error al intentar obtener tu ubicación.';
        }
        alert(errorMsg);
      },
      { enableHighAccuracy: false, timeout: 10000, maximumAge: 10000 }
    );
  };

  // Función para abrir Google Maps con la ruta hacia el trono
  const showDirectionsToTrono = () => {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const userLat = position.coords.latitude;
          const userLng = position.coords.longitude;
          if (window.animatedMarker && typeof window.animatedMarker.getLatLng === 'function') {
            try {
              const tronoPosition = window.animatedMarker.getLatLng();
              if (tronoPosition?.lat && tronoPosition?.lng) {
                const url = `https://www.google.com/maps/dir/?api=1&origin=${userLat},${userLng}&destination=${tronoPosition.lat},${tronoPosition.lng}&travelmode=walking`;
                window.open(url, '_blank');
              } else {
                alert('No se pudo obtener la posición exacta del paso procesional.');
              }
            } catch (error) {
              console.error('Error al obtener la posición del trono:', error);
              alert('No se pudo obtener la posición del trono. Por favor, inténtalo más tarde.');
            }
          } else {
            alert('El paso procesional no está disponible en este momento o no hay datos de su posición.');
          }
        },
        (error) => {
          let errorMsg;
          switch (error.code) {
            case error.PERMISSION_DENIED:
              errorMsg = 'Necesitas permitir el acceso a tu ubicación para usar esta función.';
              break;
            case error.POSITION_UNAVAILABLE:
              errorMsg = 'No se puede determinar tu ubicación actual.';
              break;
            case error.TIMEOUT:
              errorMsg = 'Se agotó el tiempo para obtener tu ubicación.';
              break;
            default:
              errorMsg = 'Ocurrió un error al intentar obtener tu ubicación.';
          }
          alert(errorMsg);
        },
        { enableHighAccuracy: true, timeout: 8000, maximumAge: 0 }
      );
    } else {
      alert('Tu navegador no soporta geolocalización');
    }
  };

  // Función para centrar el mapa (tercer botón)
  const centerMap = () => {
    if (window.map) {
      try {
        if (window.animatedMarker && typeof window.animatedMarker.getLatLng === 'function') {
          window.map.setView(window.animatedMarker.getLatLng(), 18);
        } else if (window.MARTOS_CENTER) {
          window.map.setView(window.MARTOS_CENTER, 16);
        } else {
          alert('No se puede centrar el mapa en este momento.');
        }
      } catch (error) {
        console.error('Error al centrar el mapa:', error);
        alert('No se puede centrar el mapa en este momento.');
      }
    } else {
      alert('No se puede centrar el mapa en este momento.');
    }
  };

  // Función para actualizar el nombre de la calle mediante geocodificación inversa,
  // y elegir endpoint según el valor de gps en la respuesta
  const updateStreetName = async () => {
    const el = document.getElementById('current-street');
    if (!el || !procesionId) return;

    try {
      // Obtener datos de la procesión (estado, parroquia y gps)
      const infoRes = await fetch(
        `https://owntracks-api.semanasantatracker.workers.dev/procesiones?id=${procesionId}`
      );
      const infoData = await infoRes.json();
      const procesion = infoData?.[0];
      if (!procesion) {
        el.textContent = 'Recorrido procesional';
        setMostrarTexto('Recorrido procesional');
        return;
      }

      const { estado, parroquia, gps } = procesion;

      // Si la procesión está en directo o finalizada, hacemos fetch de la calle
      if (estado === 'Directo' || estado === 'Finalizada') {
        // Determinar URL según gps
        let streetUrl = 'https://owntracks-api.semanasantatracker.workers.dev/streetName';
        if (gps === 'gps-2') {
          streetUrl = 'https://owntracks-api.semanasantatracker.workers.dev/streetName-2';
        } // si gps es 'gps-1' o cualquier otro, dejamos streetName

        const streetRes = await fetch(streetUrl);
        if (!streetRes.ok) throw new Error('No se pudo obtener calle');
        const streetData = await streetRes.json();
        const nombreCalle = streetData.streetName?.trim();
        el.textContent = nombreCalle || 'Recorrido procesional';
        setMostrarTexto(nombreCalle || 'Recorrido procesional');
      } else {
        // Si no está en directo, mostramos la parroquia
        el.textContent = parroquia || 'Parroquia';
        setMostrarTexto(parroquia || 'Parroquia');
      }
    } catch (error) {
      console.error('Error al actualizar el texto del mapa:', error);
    }
  };

  // Efecto para alternar automáticamente cada 5 segundos
  useEffect(() => {
    if (panelVisible && !isDragging) {
      const toggleInterval = setInterval(() => {
        toggleContent();
      }, 5000);
      return () => clearInterval(toggleInterval);
    }
  }, [panelVisible, isDragging]);

  // Formatear el título de la procesión a partir del ID
  useEffect(() => {
    if (procesionId) {
      updateStreetName();
      const title = procesionId
        .split('-')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
      setProcesionTitle(title);
    }
  }, [procesionId]);

  // Actualiza el nombre de la calle cada 10 segundos cuando el panel está visible
  useEffect(() => {
    if (panelVisible) {
      updateStreetName();
      const interval = setInterval(updateStreetName, 10000);
      return () => clearInterval(interval);
    }
  }, [panelVisible]);

  return (
    <>
      {/* Botón de abrir/cerrar, ubicado en la esquina inferior derecha */}
      <button
        onClick={() => setPanelVisible(v => !v)}
        className="fixed bottom-6 right-5 z-50 bg-blue-600 hover:bg-blue-700 text-white w-10 h-10 rounded-full shadow-lg flex items-center justify-center transition-transform active:scale-95"
        aria-label="Alternar panel de información"
      >
        <motion.svg
          initial={false}
          animate={{ rotate: panelVisible ? 90 : 0 }}
          transition={{ duration: 0.5 }}
          className="h-7 w-7"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          {!panelVisible ? (
            <>
              <path stroke="none" d="M0 0h24v24H0z" fill="none" />
              <path d="M11 18l-2 -1l-6 3v-13l6 -3l6 3l6 -3v7.5" />
              <path d="M9 4v13" />
              <path d="M15 7v5" />
              <path d="M18 18m-3 0a3 3 0 1 0 6 0a3 3 0 0 0 -6 0" />
              <path d="M20.2 20.2l1.8 1.8" />
            </>
          ) : (
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 6l12 12M6 18L18 6" />
          )}
        </motion.svg>
      </button>
  
      <AnimatePresence>
        {panelVisible && (
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            transition={{ type: "spring", damping: 20, stiffness: 100 }}
            className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-40 w-11/12 max-w-sm space-y-2"
          >
            {/* Contenedor del carrusel deslizable */}
            <div className="overflow-hidden rounded-xl relative h-[100px]" ref={carouselRef}>
              {/* Contenedor deslizable */}
              <motion.div
                drag="x"
                dragConstraints={carouselRef}
                dragElastic={0.2}
                dragTransition={{ bounceStiffness: 600, bounceDamping: 10 }}
                onDragStart={() => setIsDragging(true)}
                onDragEnd={handleDragEnd}
                animate={{ 
                  x: carouselIndex === 0 
                    ? 0 
                    : carouselIndex === 1 
                      ? '-33.33%' 
                      : '-66.66%' 
                }}
                transition={{ 
                  type: "spring", 
                  damping: 30, 
                  stiffness: 300
                }}
                className="flex w-[300%] h-full"
              >
                {/* Panel de texto */}
                <div className="bg-[#222222] text-white rounded-xl shadow-2xl p-4 px-6 w-1/3 h-full">
                  <h2 className="text-xl font-bold mb-1 text-start">
                    {procesionTitle}
                  </h2>
                  <p className="text-start">
                    Pasando por:{' '}
                    <span id="current-street" className="font-medium">
                      {mostrarTexto}
                    </span>
                  </p>
                </div>
                
                {/* Panel de primera imagen */}
                <div className="bg-[#222222] w-1/3 h-full rounded-xl shadow-2xl flex items-center justify-center">
                  <img 
                    src="/assets/patrocinadores/Cartel_optica_Martos.png" 
                    alt={`Información ${procesionTitle}`} 
                    className="w-full h-full object-cover"
                  />
                </div>
                
                {/* Panel de segunda imagen */}
                <div className="bg-[#222222] w-1/3 h-full rounded-xl shadow-2xl flex items-center justify-center">
                  <img 
                    src="/assets/patrocinadores/peluqueria_ismael.jpg" 
                    alt="Patrocinador adicional" 
                    className="w-full h-full object-cover"
                  />
                </div>
              </motion.div>
              
              {/* Indicadores de página (pequeños puntos) */}
              <div className="absolute bottom-2 left-0 right-0 flex justify-center space-x-2">
                <button 
                  className={`w-2 h-2 rounded-full transition-colors ${carouselIndex === 0 ? 'bg-white' : 'bg-gray-400'}`}
                  onClick={() => {
                    setCarouselIndex(0);
                    setShowImage(false);
                  }}
                  aria-label="Mostrar información"
                />
                <button 
                  className={`w-2 h-2 rounded-full transition-colors ${carouselIndex === 1 ? 'bg-white' : 'bg-gray-400'}`}
                  onClick={() => {
                    setCarouselIndex(1);
                    setShowImage(true);
                  }}
                  aria-label="Mostrar primera imagen"
                />
                <button 
                  className={`w-2 h-2 rounded-full transition-colors ${carouselIndex === 2 ? 'bg-white' : 'bg-gray-400'}`}
                  onClick={() => {
                    setCarouselIndex(2);
                    setShowImage(true);
                  }}
                  aria-label="Mostrar segunda imagen"
                />
              </div>
            </div>
  
            {/* Botones de acción */}
            <div className="flex justify-start space-x-2">
              <button 
                onClick={(e) => { e.stopPropagation(); handleLocationRequest(); }}
                className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-full shadow-md transition-transform active:scale-95 flex items-center"
                aria-label="Mostrar mi ubicación"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="icon icon-tabler icons-tabler-outline icon-tabler-map-pin">
                  <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                  <path d="M9 11a3 3 0 1 0 6 0a3 3 0 0 0 -6 0" />
                  <path d="M17.657 16.657l-4.243 4.243a2 2 0 0 1 -2.827 0l-4.244 -4.243a8 8 0 1 1 11.314 0z" />
                </svg>
                <span className="ml-1 text-md">Mi ubicación</span>
              </button>
              <button 
                onClick={(e) => { e.stopPropagation(); showDirectionsToTrono(); }}
                className="bg-purple-600 hover:bg-purple-700 text-white px-3 py-2 rounded-full shadow-md transition-transform active:scale-95 flex items-center"
                aria-label="Cómo llegar al trono"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="icon icon-tabler icons-tabler-outline icon-tabler-location">
                  <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                  <path d="M21 3l-6.5 18a.55 .55 0 0 1 -1 0l-3.5 -7l-7 -3.5a.55 .55 0 0 1 0 -1l18 -6.5" />
                </svg>
                <span className="ml-1 text-md">Llévame</span>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
};
