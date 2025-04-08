import { useEffect, useState } from 'react';
import SeccionDiaActual from './SeccionDiaActual';

interface Procesion {
  nombre: string;
  descripcion: string;
  cofradia: string;
  parroquia: string;
  horaSalida: string;
  horaLlegada: string;
  imagenCaratula: string;
  imagenExtendida: string;
  posicionImagen: string;
}

interface Dia {
  titulo: string;
  procesiones: Procesion[];
}

interface DisenoDia {
  nombre: string;
  posicionTexto: string;
  colorTexto: string;
}

interface Props {
  dias: Dia[];
  disenoDias: DisenoDia[];
}

export default function SeccionDiaActualIsla({ dias, disenoDias }: Props) {
  const [procesion, setProcesion] = useState<Procesion | null>(null);
  const [diseno, setDiseno] = useState<DisenoDia | null>(null);
  const [estaEnCalle, setEstaEnCalle] = useState(false);
  const [haTerminado, setHaTerminado] = useState(false);
  // Si quieres usar una fecha de prueba, cambia esto:


 // const FECHA_DEBUG = new Date('2025-04-06T12:30:00'); // Domingo de ramos mañana
  //const FECHA_DEBUG = new Date('2025-04-06T20:30:00'); // Domingo de ramos tarde
  //const FECHA_DEBUG = new Date('2025-04-07T20:30:00'); // Lunes santo
  //const FECHA_DEBUG = new Date('2025-04-08T20:30:00'); // Martes santo
  //const FECHA_DEBUG = new Date('2025-04-09T20:30:00'); // Miercoles santo
  //const FECHA_DEBUG = new Date('2025-04-10T10:30:00'); // Jueves santo mañana
  //const FECHA_DEBUG = new Date('2025-04-10T23:30:00'); // Jueves santo noche
  //const FECHA_DEBUG = new Date('2025-04-11T12:30:00'); // Viernes santo mañana
  //const FECHA_DEBUG = new Date('2025-04-11T22:30:00'); // Viernes santo noche
  //const FECHA_DEBUG = new Date('2025-04-12T02:30:00'); // Soledad
    const FECHA_DEBUG = new Date('2025-04-13T12:30:00'); // Domingo de ramos


  // Si no quieres usar una fecha de debug, ponlo en null:
  const FECHA_DEBUG_ACTIVA = false;

  
  useEffect(() => {
    const fetchHoraEspaña = async () => {
      try {
        let ahora = FECHA_DEBUG_ACTIVA ? FECHA_DEBUG : new Date();
  
        if (!FECHA_DEBUG_ACTIVA) {
          const response = await fetch('https://worldtimeapi.org/api/timezone/Europe/Madrid');
          const data = await response.json();
          ahora = new Date(data.datetime);
        }
  
        if (!ahora) ahora = new Date();
  
        // ... tu lógica actual a partir de aquí (la que usa `ahora`)
        // Copia todo el resto del código tal como está, pero usando `ahora` aquí dentro
  
        let mejorProcesion: Procesion | null = null;
        let mejorDiseno: DisenoDia | null = null;
        let estaEnCalleActual = false;
  
        let proximaProcesion: Procesion | null = null;
        let proximoDiseno: DisenoDia | null = null;
        let menorDiferenciaTiempo = Infinity;
  
        const fechasPorDia: Record<number, Date> = {
          0: new Date(2025, 3, 6),
          1: new Date(2025, 3, 7),
          2: new Date(2025, 3, 8),
          3: new Date(2025, 3, 9),
          4: new Date(2025, 3, 10),
          5: new Date(2025, 3, 11),
          6: new Date(2025, 3, 12),
          7: new Date(2025, 3, 13),
        };
  
        const fechaFinSemanaSanta = new Date(fechasPorDia[7]);
        fechaFinSemanaSanta.setHours(23, 59, 59, 999);
  
        if (ahora > fechaFinSemanaSanta) {
          setHaTerminado(true);
          return;
        }
  
        for (let diaIndex = 0; diaIndex < dias.length; diaIndex++) {
          const dia = dias[diaIndex];
          const diseno = disenoDias[diaIndex];
          const fechaDelDia = fechasPorDia[diaIndex];
          if (!fechaDelDia) continue;
  
          for (const procesion of dia.procesiones) {
            const [hSalida, mSalida] = procesion.horaSalida.split(':').map(Number);
            const [hLlegada, mLlegada] = procesion.horaLlegada.split(':').map(Number);
  
            const fechaSalida = new Date(fechaDelDia);
            fechaSalida.setHours(hSalida, mSalida, 0, 0);
  
            const fechaLlegada = new Date(fechaDelDia);
            fechaLlegada.setHours(hLlegada, mLlegada, 0, 0);
  
            if (fechaLlegada <= fechaSalida) {
              fechaLlegada.setDate(fechaLlegada.getDate() + 1);
            }
  
            const margenAntes = new Date(fechaSalida);
            margenAntes.setMinutes(margenAntes.getMinutes() - 30);
  
            const margenDespues = new Date(fechaLlegada);
            margenDespues.setMinutes(margenDespues.getMinutes() + 30);
  
            if (ahora >= margenAntes && ahora <= margenDespues) {
              mejorProcesion = procesion;
              mejorDiseno = diseno;
              estaEnCalleActual = true;
              break;
            }
  
            if (fechaSalida > ahora) {
              const diferencia = fechaSalida.getTime() - ahora.getTime();
              if (diferencia < menorDiferenciaTiempo) {
                menorDiferenciaTiempo = diferencia;
                proximaProcesion = procesion;
                proximoDiseno = diseno;
              }
            }
          }
  
          if (mejorProcesion) break;
        }
  
        if (!mejorProcesion && proximaProcesion && proximoDiseno) {
          mejorProcesion = proximaProcesion;
          mejorDiseno = proximoDiseno;
          estaEnCalleActual = false;
        }
  
        setProcesion(mejorProcesion);
        setDiseno(mejorDiseno);
        setEstaEnCalle(estaEnCalleActual);
      } catch (error) {
        console.error('Error al obtener la hora de España:', error);
      }
    };
  
    fetchHoraEspaña();
  }, []);
  


  // 👉 Si ha terminado, mostramos el mensaje de despedida
  if (haTerminado) {
    return (
      <section className="relative w-full h-full min-h-screen bg-black flex items-center justify-center">
        <h2 className="text-white text-center font-serif text-4xl md:text-6xl font-bold">
          Hasta el año que viene 👋
        </h2>
      </section>
    );
  }

  


  if (!procesion || !diseno) return null;

  return (
    <SeccionDiaActual
      titulo={diseno.nombre}
      imagenNormal={procesion.imagenCaratula}
      imagenExtendida={procesion.imagenExtendida}
      posicionImagen={procesion.posicionImagen}
      hermandad={procesion.descripcion}
      iglesia={procesion.parroquia}
      horaSalida={procesion.horaSalida}
      horaLlegada={procesion.horaLlegada}
      posicionTexto={diseno.posicionTexto}
      colorTexto={diseno.colorTexto}
      estaEnCalle={estaEnCalle}
      rutaId={procesion.nombre?.toLowerCase().replace(/\s+/g, '-') ?? ''}
    />
  );
}

