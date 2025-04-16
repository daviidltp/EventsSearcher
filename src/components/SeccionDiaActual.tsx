import BotonEstado from "./BotonesEstado";
import BotonPronostico from "./BotonPronostico";
import { parseAlertaConEnlaces } from '../utils/parseAlertaConEnlaces';

interface Props {
  titulo: string;
  imagenNormal: string;
  imagenExtendida: string;
  posicionImagen: string;
  hermandad: string;
  iglesia: string;
  horaSalida: string;
  horaLlegada: string;
  posicionTexto: string;
  colorTexto: string;
  estaEnCalle: boolean;
  rutaId: string;
  estado?: string;
  alerta?: string;
}

const colorClaseMap: Record<string, string> = {
  blanco: 'text-white',
  negro: 'text-black',
  rojo: 'text-red-500',
};

const posicionClaseMap: Record<string, string> = {
  izquierda: 'left-6',
  derecha: 'right-6 text-right',
};

import { useState } from "react";

export default function SeccionDiaActual(props: Props) {
  const {
    titulo,
    imagenNormal,
    imagenExtendida,
    posicionImagen,
    hermandad,
    iglesia,
    horaSalida,
    horaLlegada,
    posicionTexto,
    colorTexto,
    estaEnCalle,
    rutaId,
    estado,
    alerta = '',
  } = props;

  const [loaded, setLoaded] = useState(false);

  const claseColorTexto = colorClaseMap[colorTexto] ?? 'text-white';
  const clasePosicionTexto = posicionClaseMap[posicionTexto] ?? 'left-6';

  const partes = titulo.split(' ');
  let linea1 = '';
  let linea2 = '';

  if (partes.length === 2) {
    [linea1, linea2] = partes;
  } else if (partes.length >= 3) {
    linea1 = `${partes[0]} ${partes[1]} `;
    linea2 = partes.slice(2).join(' ');
  }

  const getAlertaEstilo = (mensaje: string) => {
    const lower = mensaje.toLowerCase();
  
    if (lower.includes("aviso") || lower.includes("atención")) {
      return {
        bg: 'bg-yellow-50',
        text: 'text-yellow-600 text-md',
        borderColor: 'border-yellow-700',
        icon: (
          <svg xmlns="http://www.w3.org/2000/svg" className="w-full h-full text-yellow-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path stroke="none" d="M0 0h24v24H0z" fill="none" />
            <path d="M12 9v4" />
            <path d="M10.363 3.591l-8.106 13.534a1.914 1.914 0 0 0 1.636 2.871h16.214a1.914 1.914 0 0 0 1.636 -2.87l-8.106 -13.536a1.914 1.914 0 0 0 -3.274 0z" />
            <path d="M12 16h.01" />
          </svg>
        )
        
        
      };
    }
  
    return {
      bg: 'bg-blue-100',
      text: 'text-blue-600 text-md',
      borderColor: 'border-blue-500',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="w-full h-full text-blue-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path stroke="none" d="M0 0h24v24H0z" fill="none" />
          <path d="M3 12a9 9 0 1 0 18 0a9 9 0 0 0 -18 0" />
          <path d="M12 9h.01" />
          <path d="M11 12h1v4h1" />
        </svg>
      )
    };
  };

  return (
    <>
      <section className="relative w-full h-full overflow-hidden">
        {imagenNormal && imagenExtendida && (
          <picture
            data-aos="zoom-out"
            data-aos-duration="1500"
            data-aos-delay="200"
            className={`${loaded ? 'opacity-100' : 'opacity-0'} transition-opacity duration-1000`}
          >
            <source srcSet={imagenExtendida} media="(min-width: 768px)" />
            <img
              src={imagenNormal}
              alt={titulo}
              className={`absolute top-0 left-0 w-full h-full object-cover transition-all duration-500 ${
                posicionImagen === 'top'
                  ? 'object-top'
                  : posicionImagen === 'bottom'
                  ? 'object-bottom'
                  : 'object-center'
              } ${estado === 'Cancelada por lluvia' ? 'grayscale' : ''}`}
            />
          </picture>
        )}

        <div className="absolute bottom-0 w-full h-2/3 bg-gradient-to-t from-black/90 to-transparent z-10"></div>

        {/* Título móvil */}
        <h2
          className={`absolute top-6 ${clasePosicionTexto} ${claseColorTexto} titulo-dinamico 
                      font-serif tracking-wide uppercase drop-shadow-[0_2px_6px_rgba(0,0,0,0.5)] 
                      z-10 max-w-[90%] leading-tight font-bold md:hidden`}
          style={{
            fontSize: 'clamp(2.6rem, 8vw, 10rem)',
            lineHeight: '1.1',
            whiteSpace: 'normal',
          }}
          data-aos="fade-right"
          data-aos-duration="1200"
          data-aos-delay="200"
        >
          <span className="block">{linea1}</span>
          <span className="block">{linea2}</span>
        </h2>

        {/* Título escritorio */}
        <h2
          className={`absolute top-6 ${clasePosicionTexto} ${claseColorTexto} titulo-dinamico 
                      font-serif tracking-wide uppercase drop-shadow-[0_2px_6px_rgba(0,0,0,0.5)] 
                      z-10 max-w-[90%] leading-tight font-bold hidden md:block`}
          style={{
            fontSize: 'clamp(2.6rem, 8vw, 10rem)',
            lineHeight: '1.1',
            whiteSpace: 'normal',
          }}
          data-aos="fade-down"
          data-aos-duration="1000"
          data-aos-delay="200"
        >
          {titulo}
        </h2>

        {/* Información */}
        <div
          className="absolute bottom-6 left-6 z-10 text-white space-y-1 drop-shadow-[0_1px_6px_rgba(0,0,0,0.8)] max-w-[80%]"
          data-aos="fade-right"
          data-aos-duration="1000"
          data-aos-delay="200"
          data-aos-anchor-placement="top-bottom"
          data-aos-offset="0"
        >
          <p className="text-2xl md:text-3xl font-semibold">{hermandad}</p>
          <p className="text-lg md:text-xl">{iglesia}</p>
          <p className="text-lg md:text-xl">
            {horaSalida} - {horaLlegada}
          </p>



          {/* Botón de recorrido en móvil */}
          <div className="mt-5 md:hidden">
            <a href={`/cofradia/${rutaId}/recorrido`}>
              <BotonEstado estado={estado} estaEnCalle={estaEnCalle} />
            </a>
          </div>
        </div>

        {/* Botones en escritorio */}
        <div
          className="hidden md:flex absolute bottom-6 right-6 z-10 space-x-3"
          data-aos="fade-left"
          data-aos-duration="1000"
          data-aos-delay="200"
          data-aos-anchor-placement="top-bottom"
          data-aos-offset="0"
        >
          <a href={`/cofradia/${rutaId}/pronostico`}>
            <BotonPronostico rutaId={rutaId} />
          </a>
          <a href={`/cofradia/${rutaId}/recorrido`}>
            <BotonEstado estado={estado} estaEnCalle={estaEnCalle} />
          </a>
        </div>

        {/* Botón pronóstico en móvil */}
        <div
          className="flex md:hidden absolute bottom-6 right-6 z-10"
          data-aos="fade-up"
          data-aos-duration="1000"
          data-aos-delay="200"
          data-aos-anchor-placement="top-bottom"
          data-aos-offset="0"
        >
          <a href={`/cofradia/${rutaId}/pronostico`}>
            <BotonPronostico rutaId={rutaId} />
          </a>
        </div>
      </section>

      {/* Alerta debajo de la imagen */}
      {alerta && (() => {
        const { bg, text, icon } = getAlertaEstilo(alerta);
        return (
          <div
            className={`mt-6 mx-4 ${bg} ${text} px-5 py-4 shadow-md flex items-center gap-5 border-l-5`}
            data-aos="fade-up"
            data-aos-duration="800"
            data-aos-delay="100"
            data-aos-once="true"
          >
            <div className="flex-shrink-0 flex items-center justify-center w-9 h-9">
              {icon}
            </div>
            <p className="text-md leading-snug break-words overflow-hidden max-w-full">{parseAlertaConEnlaces(alerta)}</p>
          </div>
        );
      })()}




    </>
  );
}
