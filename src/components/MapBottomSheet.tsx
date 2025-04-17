import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

declare global {
  interface Window {
    map?: any;
    MARTOS_CENTER?: any;
    hasCenteredMap?: boolean;
    procesionId?: string;
    animatedMarker?: any;        // Para acceder a la posición del paso/trono
    userLocationMarker?: any;     // Para acceder al marcador de ubicación del usuario
  }
}

declare const L: any;

export default function MapBottomSheet({ procesionId }: { procesionId?: string }) {
  // Estado del panel
  const [panelVisible, setPanelVisible] = useState(true);
  const [procesionTitle, setProcesionTitle] = useState('');
  const [mostrarTexto, setMostrarTexto] = useState('Recorrido procesional');

  // Detección de Safari (iOS/macOS)
  const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);

  // Función manejadora de la petición de ubicación
  const handleLocationRequest = () => {
    if (!('geolocation' in navigator)) {
      alert('Tu navegador no soporta geolocalización');
      return;
    }
    showMyLocation();
  };

  // Muestra la ubicación del usuario en el mapa
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
            if (isSafari) {
              errorMsg =
                'Parece que has bloqueado el acceso a la ubicación.\n' +
                'Ve a Ajustes > Navegador > Privacidad > Ubicación y permite el acceso para este sitio.';
            } else {
              errorMsg =
                'Parece que has bloqueado el acceso a la ubicación.\n' +
                'Revisa los permisos de ubicación en la configuración de tu navegador.';
            }
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

  // Monta Google Maps con ruta hacia el trono
  const showDirectionsToTrono = () => {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const userLat = position.coords.latitude;
          const userLng = position.coords.longitude;
          if (window.animatedMarker && typeof window.animatedMarker.getLatLng === 'function') {
            try {
              const { lat, lng } = window.animatedMarker.getLatLng();
              const url = `https://www.google.com/maps/dir/?api=1&origin=${userLat},${userLng}&destination=${lat},${lng}&travelmode=walking`;
              window.open(url, '_blank');
            } catch {
              alert('No se pudo obtener la posición del trono.');
            }
          } else {
            alert('El paso procesional no está disponible en este momento.');
          }
        },
        (error) => {
          let errorMsg;
          switch (error.code) {
            case error.PERMISSION_DENIED:
              errorMsg = 'Necesitas permitir el acceso a tu ubicación para usar esta función.';
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

  // Centrar el mapa
  const centerMap = () => {
    if (window.map) {
      try {
        if (window.animatedMarker && typeof window.animatedMarker.getLatLng === 'function') {
          window.map.setView(window.animatedMarker.getLatLng(), 18);
        } else if (window.MARTOS_CENTER) {
          window.map.setView(window.MARTOS_CENTER, 16);
        } else {
          alert('No se puede centrar el mapa ahora.');
        }
      } catch {
        alert('No se puede centrar el mapa ahora.');
      }
    }
  };

  // Geocodificación inversa para nombre de calle
  const updateStreetName = async () => {
    const el = document.getElementById('current-street');
    if (!el || !procesionId) return;
    try {
      const infoRes = await fetch(
        `https://owntracks-api.semanasantatracker.workers.dev/procesiones?id=${procesionId}`
      );
      const [{ estado, parroquia }] = await infoRes.json();
      if (estado === 'Directo' || estado === 'Finalizada') {
        const streetRes = await fetch('https://owntracks-api.semanasantatracker.workers.dev/streetName');
        const { streetName } = await streetRes.json();
        const nombre = streetName?.trim() || 'Recorrido procesional';
        el.textContent = nombre;
        setMostrarTexto(nombre);
      } else {
        el.textContent = parroquia || 'Parroquia';
        setMostrarTexto(parroquia || 'Parroquia');
      }
    } catch {
      console.error('Error al actualizar calle');
    }
  };

  // Formatear título y actualizar calle
  useEffect(() => {
    if (procesionId) {
      updateStreetName();
      const title = procesionId
        .split('-')
        .map(w => w.charAt(0).toUpperCase() + w.slice(1))
        .join(' ');
      setProcesionTitle(title);
    }
  }, [procesionId]);

  // Intervalo para actualizar calle
  useEffect(() => {
    if (panelVisible) {
      const id = setInterval(updateStreetName, 10000);
      return () => clearInterval(id);
    }
  }, [panelVisible]);

  return (
    <>
      <button
        onClick={() => setPanelVisible(v => !v)}
        className="fixed bottom-5 right-5 z-50 bg-blue-600 hover:bg-blue-700 text-white w-12 h-12 rounded-full shadow-lg flex items-center justify-center transition-transform active:scale-95"
        aria-label="Alternar panel"
      >
        <motion.svg
          initial={false}
          animate={{ rotate: panelVisible ? 90 : 0 }}
          transition={{ duration: 0.5 }}
          className="h-8 w-8"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
        >
          {!panelVisible ? (
            <>
              <path stroke="none" d="M0 0h24v24H0z" fill="none" />
              <path d="M11 18l-2 -1l-6 3v-13l6 -3l6 3l6 -3v7.5" />
            </>
          ) : (
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 6l12 12M6 18L18 6" />
          )}
        </motion.svg>
      </button>
      <AnimatePresence>
        {panelVisible && (
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            transition={{ type: 'spring', damping: 20, stiffness: 100 }}
            className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-40 w-11/12 max-w-sm space-y-2"
          >
            <div className="bg-[#222222] text-white rounded-xl shadow-2xl p-4 px-6">
              <h2 className="text-xl font-bold mb-1 text-start">{procesionTitle}</h2>
              <p className="text-start">
                Pasando por: <span id="current-street" className="font-medium">{mostrarTexto}</span>
              </p>
            </div>
            <div className="flex space-x-2">
              <button
                onClick={e => { e.stopPropagation(); handleLocationRequest(); }}
                className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-full shadow-md transition-transform active:scale-95 flex items-center"
                aria-label="Mostrar mi ubicación"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="icon-tabler icon-tabler-map-pin">
                  <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                  <circle cx={12} cy={11} r={3} />
                  <path d="M17.657 16.657l-4.243 4.243a2 2 0 0 1-2.827 0l-4.243-4.243a8 8 0 1 1 11.314 0z" />
                </svg>
                <span className="ml-1 text-lg">Mi ubicación</span>
              </button>
              <button
                onClick={e => { e.stopPropagation(); showDirectionsToTrono(); }}
                className="bg-purple-600 hover:bg-purple-700 text-white px-3 py-2 rounded-full shadow-md transition-transform active:scale-95 flex items-center"
                aria-label="Cómo llegar al trono"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="icon-tabler icon-tabler-location">
                  <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                  <path d="M21 3l-6.5 18a.55.55 0 0 1-1 0l-3.5-7l-7-3.5a.55.55 0 0 1 0-1l18-6.5" />
                </svg>
                <span className="ml-1 text-lg">Llévame</span>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
