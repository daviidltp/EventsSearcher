import { useEffect, useState, useRef } from 'react';
import SeccionDiaActual from './SeccionDiaActual';

interface Procesion {
  id: string;
  nombre: string;
  descripcion: string;
  cofradia: string;
  parroquia: string;
  horaSalida: string;
  horaLlegada: string;
  imagenCaratula: string;
  imagenExtendida: string;
  posicionImagen: string;
  alerta?: string;
  estado?: string;
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
  const [procesionesEnCalle, setProcesionesEnCalle] = useState<Procesion[]>([]);
  const [proximaProcesion, setProximaProcesion] = useState<Procesion | null>(null);
  const [diseno, setDiseno] = useState<DisenoDia | null>(null);
  const [haTerminado, setHaTerminado] = useState(false);

  const carruselRef = useRef<HTMLDivElement>(null);
  const [puedeScrollIzq, setPuedeScrollIzq] = useState(false);
  const [puedeScrollDer, setPuedeScrollDer] = useState(false);

  const FECHA_DEBUG = new Date('2025-04-13T14:29:00');
  const FECHA_DEBUG_ACTIVA = false; 

  const preloadImage = (src: string) =>
    new Promise((resolve) => {
      const img = new Image();
      img.src = src;
      img.onload = resolve;
      img.onerror = resolve;
    });

  // ...

  useEffect(() => {
    const inicio = performance.now();

    const fetchHoraEspaña = async () => {
      try {
        let ahora = FECHA_DEBUG_ACTIVA ? FECHA_DEBUG : new Date();

        const enCalle: Procesion[] = [];
        let proxima: Procesion | null = null;
        let disenoElegido: DisenoDia | null = null;
        let menorDiferenciaTiempo = Infinity;

        const fechasPorDia: Record<number, Date> = {
          0: new Date(2025, 3, 12),
          1: new Date(2025, 3, 13),
          2: new Date(2025, 3, 14),
          3: new Date(2025, 3, 15),
          4: new Date(2025, 3, 16),
          5: new Date(2025, 3, 17),
          6: new Date(2025, 3, 18),
          7: new Date(2025, 3, 19),
          8: new Date(2025, 3, 20),
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

            const esMadrugada = hSalida === 0 && mSalida === 0;
            const fechaSalida = new Date(fechaDelDia);
            const fechaLlegada = new Date(fechaDelDia);

            if (esMadrugada) {
              fechaSalida.setDate(fechaSalida.getDate() + 1);
              fechaLlegada.setDate(fechaLlegada.getDate() + 1);
            }

            fechaSalida.setHours(hSalida, mSalida, 0, 0);
            fechaLlegada.setHours(hLlegada, mLlegada, 0, 0);

            if (fechaLlegada <= fechaSalida) {
              fechaLlegada.setDate(fechaLlegada.getDate() + 1);
            }

            const margenAntes = new Date(fechaSalida);
            margenAntes.setMinutes(margenAntes.getMinutes() - 5);
            const margenDespues = new Date(fechaLlegada);
            margenDespues.setMinutes(margenDespues.getMinutes() + 30);

            if (ahora >= margenAntes && ahora <= margenDespues) {
              enCalle.push(procesion);
              if (enCalle.length === 1) disenoElegido = diseno;
            }

            if (enCalle.length === 0 && fechaSalida > ahora) {
              const diferencia = fechaSalida.getTime() - ahora.getTime();
              if (diferencia < menorDiferenciaTiempo) {
                menorDiferenciaTiempo = diferencia;
                proxima = procesion;
                disenoElegido = diseno;
              }
            }
          }
        }

        const procesionesMostradas = enCalle.length > 0 ? enCalle : proxima ? [proxima] : [];

        // Primero setear estado para mostrar la procesión, aunque sea sin datos extra
        setProcesionesEnCalle(enCalle);
        setProximaProcesion(enCalle.length === 0 && proxima ? proxima : null);
        setDiseno(disenoElegido);

        // Luego intentar traer estado y alerta — si falla, no rompe nada.
        try {
          if (procesionesMostradas.length > 0) {
            const ids = procesionesMostradas.map((p) => `id=${p.id}`).join('&');
            const urlFetch = `https://owntracks-api.semanasantatracker.workers.dev/procesiones?${ids}`;

            let datosApi: { id: string; estado: string; alerta: string }[] = [];
            const cacheKey = `procesiones_estado_${ids}`;
            const cache = sessionStorage.getItem(cacheKey);
            if (cache) {
              datosApi = JSON.parse(cache);
            } else {
              const response = await fetch(urlFetch);
              if (!response.ok) throw new Error(`API error: ${response.status}`);
              datosApi = await response.json();
              sessionStorage.setItem(cacheKey, JSON.stringify(datosApi));
            }

            for (const p of procesionesMostradas) {
              const data = datosApi.find((d) => d.id === p.id);
              if (data) {
                p.estado = data.estado;
                p.alerta = data.alerta;
              }
            }

            if (enCalle.length > 0) {
              setProcesionesEnCalle([...enCalle]); // crea una nueva copia
            } else if (proxima) {
              setProximaProcesion({ ...proxima }); // fuerza rerender
            }
            
          }
        } catch (err) {
          console.error('Error al obtener estado y alerta:', err);
        }

        // Preload imágenes para optimizar la carga visual
        await Promise.all(procesionesMostradas.map((p) => preloadImage(p.imagenCaratula)));

        requestAnimationFrame(() => {
          const fin = performance.now();
        });

      } catch (err) {
        console.error('Error general en fetchHoraEspaña:', err);
      }
    };

    fetchHoraEspaña();
  }, []);


  useEffect(() => {
    const handleScroll = () => {
      const el = carruselRef.current;
      if (!el) return;
      setPuedeScrollIzq(el.scrollLeft > 0);
      setPuedeScrollDer(el.scrollLeft + el.clientWidth < el.scrollWidth);
    };

    handleScroll();

    const el = carruselRef.current;
    if (el) {
      el.addEventListener('scroll', handleScroll);
      window.addEventListener('resize', handleScroll);
    }

    return () => {
      if (el) el.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleScroll);
    };
  }, [procesionesEnCalle]);

  const scrollCarrusel = (direccion: 'left' | 'right') => {
    const el = carruselRef.current;
    if (!el) return;
    const ancho = el.clientWidth;
    el.scrollBy({ left: direccion === 'left' ? -ancho : ancho, behavior: 'smooth' });
  };

  if (haTerminado) {
    return (
      <section className="relative w-full h-full bg-black flex items-center justify-center">
        <h2 className="text-white text-center font-serif text-4xl md:text-6xl font-bold">
          Hasta el año que viene 👋
        </h2>
      </section>
    );
  }

  if (procesionesEnCalle.length > 1) {
    return (
      <div className="relative w-full h-full overflow-hidden">
        {puedeScrollIzq && (
          <button
            onClick={() => scrollCarrusel('left')}
            className="absolute left-4 top-1/2 -translate-y-1/2 z-10 bg-white/60 rounded-full p-2 shadow-lg hover:scale-105 transition"
          >
            <img src="/assets/icons/chevron-left.svg" alt="Izquierda" className="w-6 h-6 pr-0.5" />
          </button>
        )}

        <div
          ref={carruselRef}
          className="flex snap-x snap-mandatory overflow-x-auto scroll-smooth w-full h-full"
        >
          {procesionesEnCalle.map((p, i) => (
            <div key={i} className="snap-center flex-shrink-0 w-full h-auto">
              <SeccionDiaActual
                titulo={diseno?.nombre ?? ''}
                imagenNormal={p.imagenCaratula}
                imagenExtendida={p.imagenExtendida}
                posicionImagen={p.posicionImagen}
                hermandad={p.descripcion}
                iglesia={p.parroquia}
                horaSalida={p.horaSalida}
                horaLlegada={p.horaLlegada}
                posicionTexto={diseno?.posicionTexto ?? 'bottom'}
                colorTexto={diseno?.colorTexto ?? '#fff'}
                estaEnCalle={true}
                rutaId={p.id}
                estado={p.estado}
                alerta={p.alerta}
              />
            </div>
          ))}
        </div>

        {puedeScrollDer && (
          <button
            onClick={() => scrollCarrusel('right')}
            className="absolute right-4 top-1/2 -translate-y-1/2 z-10 bg-white/60 rounded-full p-2 shadow-lg hover:scale-105 transition"
          >
            <img src="/assets/icons/chevron-right.svg" alt="Derecha" className="w-6 h-6" />
          </button>
        )}
      </div>
    );
  }

  const procesionMostrada = procesionesEnCalle[0] ?? proximaProcesion;

  if (!procesionMostrada)
    return (
      <SeccionDiaActual
        titulo=""
        imagenNormal=""
        imagenExtendida=""
        posicionImagen="center"
        hermandad=""
        iglesia=""
        horaSalida=""
        horaLlegada=""
        posicionTexto="izquierda"
        colorTexto="blanco"
        estaEnCalle={false}
        rutaId=""
      />
    );

  return (
    <SeccionDiaActual
      titulo={diseno?.nombre ?? ''}
      imagenNormal={procesionMostrada.imagenCaratula}
      imagenExtendida={procesionMostrada.imagenExtendida}
      posicionImagen={procesionMostrada.posicionImagen}
      hermandad={procesionMostrada.descripcion}
      iglesia={procesionMostrada.parroquia}
      horaSalida={procesionMostrada.horaSalida}
      horaLlegada={procesionMostrada.horaLlegada}
      posicionTexto={diseno?.posicionTexto ?? 'bottom'}
      colorTexto={diseno?.colorTexto ?? '#fff'}
      estaEnCalle={procesionesEnCalle.length > 0}
      rutaId={procesionMostrada.id}
      alerta={procesionMostrada.alerta}
      estado={procesionMostrada.estado}
    />
  );
}
