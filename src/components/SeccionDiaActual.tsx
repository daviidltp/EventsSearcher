import BotonEstado from "./BotonesEstado";
import BotonPronostico from "./BotonPronostico";

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
          className="absolute bottom-6 left-6 z-10 text-white space-y-1 text-lg drop-shadow-[0_1px_6px_rgba(0,0,0,0.8)] max-w-[80%]"
          data-aos="fade-right"
          data-aos-duration="1000"
          data-aos-delay="200"
          data-aos-anchor-placement="top-bottom"
          data-aos-offset="0"
        >
          <p className="text-2xl font-semibold">{hermandad}</p>
          <p className="text-base">{iglesia}</p>
          <p className="text-base">
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
      {alerta && (
        <div
          className="bg-green-600 text-white px-6 py-4 text-lg font-semibold shadow-md text-center"
          data-aos="fade-up"
          data-aos-duration="800"
          data-aos-delay="100"
          data-aos-once="true"
        >
          🚨 {alerta}
        </div>
      )}
    </>
  );
}
