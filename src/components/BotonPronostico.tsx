import React, { useEffect, useState } from 'react';
import diasRaw from '../data/dias.json';

interface Props {
  rutaId: string;
}

export default function BotonPronostico({ rutaId }: Props) {
  const [weatherData, setWeatherData] = useState<{
    codigo: number;
    precipitacion: number;
  } | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchWeatherData() {
      try {
        setIsLoading(true);
        
        // Paso 1: Encontrar la información de la procesión por su rutaId
        let procesion = null;
        let diaProcesion = null;
        
        const dias = diasRaw;
        
        // Buscar la procesión por su ID en todos los días
        for (let i = 0; i < dias.length; i++) {
          for (const p of dias[i].procesiones) {
            const id = p.id;
            if (id === rutaId) {
              diaProcesion = dias[i];
              procesion = p;
              break;
            }
          }
          if (procesion) break;
        }
        
        if (!procesion || !diaProcesion) {
          throw new Error('Procesión no encontrada');
        }
        
        // Paso 2: Calcular la fecha exacta de 2025 para ese día
        const fechasPorDia: Record<string, Date> = {
          "Sábado de Pasión": new Date(2025, 3, 12),
          "Domingo de Ramos": new Date(2025, 3, 13),
          "Lunes Santo": new Date(2025, 3, 14),
          "Martes Santo": new Date(2025, 3, 15),
          "Miércoles Santo": new Date(2025, 3, 16),
          "Jueves Santo": new Date(2025, 3, 17),
          "Viernes Santo": new Date(2025, 3, 18),
          "Sábado Santo": new Date(2025, 3, 19),
          "Domingo de Resurrección": new Date(2025, 3, 20)
        };
        
        const fechaProcesion = fechasPorDia[diaProcesion.titulo];
        
        if (!fechaProcesion) {
          throw new Error('Fecha de procesión no encontrada');
        }
        
        const [horaSalida, minutoSalida] = procesion.horaSalida.split(':').map(Number);
        const [horaLlegada, minutoLlegada] = procesion.horaLlegada.split(':').map(Number);

        // Partimos de la misma fecha para salida y llegada
        const fechaHoraLlegada = new Date(fechaProcesion);
        fechaHoraLlegada.setHours(horaLlegada, minutoLlegada, 0, 0);

        // Si la hora de llegada es anterior a la de salida, asumimos que es madrugada → sumamos 1 día
        if (
          horaLlegada < horaSalida ||
          (horaLlegada === horaSalida && minutoLlegada <= minutoSalida)
        ) {
          fechaHoraLlegada.setDate(fechaHoraLlegada.getDate() + 1);
        }

        // Validamos si ya ha pasado
        const ahora = new Date();
        if (fechaHoraLlegada < ahora) {
          setWeatherData(null);
          setIsLoading(false);
          return;
        }

        // Para usar en la API
        const fechaStr = `${fechaHoraLlegada.getFullYear()}-${String(fechaHoraLlegada.getMonth() + 1).padStart(2, '0')}-${String(fechaHoraLlegada.getDate()).padStart(2, '0')}`;
        const horaStr = String(fechaHoraLlegada.getHours()).padStart(2, '0');

        
        // Paso 4: Consultar el pronóstico para esa fecha y hora
        const response = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=37.72&longitude=-3.97&hourly=temperature_2m,precipitation_probability,weathercode&forecast_days=7&timezone=Europe/Madrid`);
        
        if (!response.ok) {
          throw new Error('Error al obtener datos meteorológicos');
        }
        
        const data = await response.json();
        
        // Buscar el índice del tiempo que coincide con la fecha y hora de la procesión
        const timeIndex = data.hourly.time.findIndex((time: string) =>
          time.includes(fechaStr) && time.includes(`T${horaStr}:`)
        );
        
        if (timeIndex !== -1) {
          setWeatherData({
            codigo: data.hourly.weathercode[timeIndex],
            precipitacion: data.hourly.precipitation_probability[timeIndex]
          });
        } else {
          // Si no se encuentra la hora exacta, usar datos generales del día actual
          const currentHour = new Date().getHours();
          setWeatherData({
            codigo: data.hourly.weathercode[currentHour],
            precipitacion: data.hourly.precipitation_probability[currentHour]
          });
        }
      } catch (error) {
        console.error("Error al cargar datos meteorológicos:", error);
      } finally {
        setIsLoading(false);
      }
    }
    
    fetchWeatherData();
  }, [rutaId]);

  // Función para determinar el icono según el código del tiempo
  function getWeatherIcon(code: number) {
    if (code === 0) return "sun";
    if (code <= 2) return "sun-cloud";
    if (code <= 3) return "cloud";
    if (code <= 48) return "fog";
    if (code <= 55) return "drizzle";
    if (code <= 65) return "rain";
    if (code <= 80) return "showers";
    return "storm";
  }

  // Definir directamente el SVG dentro del componente para no depender de archivos externos
  function getWeatherSvg(iconName: string) {
    switch(iconName) {
      case "sun":
        return (
          <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="12" cy="12" r="5" stroke="currentColor" strokeWidth="2" fill="currentColor"/>
            <path d="M12 2V4" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            <path d="M12 20V22" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            <path d="M4 12L2 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            <path d="M22 12L20 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            <path d="M19.7782 4.2218L17.7573 6.24264" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            <path d="M6.24264 17.7573L4.2218 19.7782" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            <path d="M19.7782 19.7782L17.7573 17.7573" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            <path d="M6.24264 6.24264L4.2218 4.2218" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
          </svg>
        );
      case "cloud":
        return (
          <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M5.5 12.5C3.84315 12.5 2.5 13.8431 2.5 15.5C2.5 17.1569 3.84315 18.5 5.5 18.5H18C20.2091 18.5 22 16.7091 22 14.5C22 12.2909 20.2091 10.5 18 10.5C17.9199 10.5 17.8403 10.5017 17.761 10.5052C17.2474 8.00926 14.9673 6 12 6C8.96243 6 6.5 8.01472 6.5 11C6.5 11.5 6.5 12 6.5 12C6.5 12.1681 6.43815 12.3 6.33515 12.3C5.86852 12.3 5.5 12.3 5.5 12.5Z" stroke="currentColor" strokeWidth="2" fill="currentColor" fillOpacity="0.5"/>
          </svg>
        );
      case "sun-cloud":
        return (
          <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M10.5 1.5V3.1M3.6 8.4H2M6.4515 4.5485L5.247 3.347M14.5485 4.5485L15.753 3.347M19 8.4H17.4M7.05 12.0179C7.55412 10.1473 9.27117 8.7 11.3077 8.7C12.7321 8.7 14 9.35042 14.8356 10.3741M7.66667 14.4C5.45618 14.4 3.66667 16.1895 3.66667 18.4C3.66667 20.6105 5.45618 22.4 7.66667 22.4H16.5C19.0392 22.4 21.1 20.3392 21.1 17.8C21.1 15.2608 19.0392 13.2 16.5 13.2C16.3881 13.2 16.2774 13.2038 16.1679 13.211C15.429 12.064 14.1936 11.3 12.8 11.3C10.1492 11.3 8 13.4492 8 16.1C8 16.2022 8.00236 16.3033 8.007 16.4032C7.8947 16.401 7.7812 16.4 7.66667 16.4" stroke="currentColor" strokeWidth="2" fill="currentColor" fillOpacity="0.5"/>
          </svg>
        );
      case "fog":
        return (
          <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M3 8H17M6 16H18M3 12H21" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"/>
          </svg>
        );
      case "drizzle":
      case "rain":
        return (
          <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M8 19V21M8 13V15M16 19V21M16 13V15M12 17V19M12 11V13M7.5 12C4.6 12 2.25 9.65 2.25 6.75C2.25 3.85 4.6 1.5 7.5 1.5C9.95 1.5 12 3.55 12 6C12 3.55 14.05 1.5 16.5 1.5C19.4 1.5 21.75 3.85 21.75 6.75C21.75 9.65 19.4 12 16.5 12H7.5Z" stroke="currentColor" strokeWidth="2" fill="currentColor" fillOpacity="0.3"/>
          </svg>
        );
      case "showers":
      case "storm":
        return (
          <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 12.5L9 17H12L10 22M18 12.5L15 17H18L16 22" stroke="currentColor" strokeWidth="2" fill="currentColor" fillOpacity="0.3" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M17 7C17 4.23858 14.7614 2 12 2C9.64956 2 7.64408 3.63022 7.13309 5.82541C7.05565 5.81839 6.97736 5.81486 6.89846 5.81486C4.19015 5.81486 2 7.99825 2 10.7C2 12.3049 2.89532 13.7176 4.22838 14.5M17 7C19.7614 7 22 9.23858 22 12C22 14.4504 20.265 16.4845 18 16.9M17 7C17.4872 7.49127 17.8743 8.06979 18.1313 8.71743C18.710 8.25268 19.429 8 20.1946 8C22.2979 8 24 9.68377 24 11.7647C24 13.8456 22.2979 15.5294 20.1946 15.5294C19.5588 15.5294 18.9669 15.3735 18.4547 15.0933" stroke="currentColor" strokeWidth="2" strokeLinecap="round" fill="currentColor" fillOpacity="0.2"/>
          </svg>
        );
      default:
        return (
          <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" fill="none"/>
            <path d="M12 8V12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            <circle cx="12" cy="16" r="1" fill="currentColor"/>
          </svg>
        );
    }
  }

  // Función para determinar el color según la probabilidad de lluvia
  function getPrecipitationColor(probability: number) {
    if (probability <= 20) return "bg-green-500";
    if (probability <= 50) return "bg-yellow-500";
    if (probability <= 70) return "bg-amber-600";
    return "bg-red-500";
  }

  if (!isLoading && weatherData === null) {
    return null; // no renderiza nada
  }
  
  
  return (
    <div className={`px-4 py-3 rounded-full shadow-md flex items-center space-x-1 text-white
		transition-colors duration-200 ease-in-out
		${isLoading 
		  ? 'bg-gray-400 hover:bg-gray-500' 
		  : weatherData?.precipitacion && weatherData.precipitacion > 50 
			? 'bg-yellow-500 hover:bg-yellow-600' 
			: 'bg-blue-500 hover:bg-blue-600'}`}>
      {isLoading ? (
        // Estado de carga
        <div className="animate-pulse flex items-center">
          <div className="w-6 h-6 bg-white/30 rounded-full mr-2"></div>
          <div className="h-4 w-10 bg-white/30 rounded"></div>
        </div>
      ) : (
        <>
          {/* Icono del tiempo incorporado directamente */}
          <div className="w-6 h-6 text-white">
            {weatherData && getWeatherSvg(getWeatherIcon(weatherData.codigo))}
          </div>
          
          {/* Probabilidad de lluvia */}
          {weatherData && (
            <div className="text-white font-medium text-sm flex items-center">
              <span className="mr-1">{weatherData.precipitacion}%</span>
            </div>
          )}
        </>
      )}
    </div>
  );
}