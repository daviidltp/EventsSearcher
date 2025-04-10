interface Props {
  titulo: string;
  imagenNormal: string;
  imagenExtendida: string;
  posicionImagen: string;
  hermandad: string;
  iglesia: string;
  horaSalida: string;
  horaLlegada: string;
  posicionTexto: string; // izquierda o derecha
  colorTexto: string;    // blanco, negro, etc.
  estaEnCalle: boolean;
  rutaId: string;
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
  } = props;

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
    <section className="relative w-full h-full overflow-hidden">
      {imagenNormal && imagenExtendida && (
        <picture>
          <source srcSet={imagenExtendida} media="(min-width: 768px)" />
          <img
            src={imagenNormal}
            alt={titulo}
            className={`absolute top-0 left-0 w-full h-full object-cover ${
              posicionImagen === 'top'
                ? 'object-top'
                : posicionImagen === 'bottom'
                ? 'object-bottom'
                : 'object-center'
            }`}
          />
        </picture>
      )}

      <div className="absolute bottom-0 w-full h-2/3 bg-gradient-to-t from-black/90 to-transparent z-0"></div>

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
      >
        {titulo}
      </h2>

      {/* Información */}
      <div className="absolute bottom-6 left-6 z-10 text-white space-y-1 text-lg drop-shadow-[0_1px_6px_rgba(0,0,0,0.8)] max-w-[80%]">
        <p className="text-2xl font-semibold">{hermandad}</p>
        <p className="text-base">{iglesia}</p>
        <p className="text-base">
          {horaSalida} - {horaLlegada}
        </p>

        {/* Botón móvil */}
        <div className="mt-5 md:hidden">
          <a href={`/cofradia/${rutaId}/recorrido`}>
            {estaEnCalle ? (
              <button className="flex items-center gap-3 bg-white bg-opacity-80 text-black font-semibold 
                                 px-5 py-2 text-md rounded-full shadow-md 
                                 hover:bg-opacity-100 transition">
                ¡Síguela en directo!
                <span className="relative flex h-4 w-4">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-600 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-4 w-4 bg-red-600"></span>
                </span>
              </button>
            ) : (
              <button className="flex items-center gap-3 bg-transparent border border-white text-white font-semibold 
                                 px-5 py-2 text-md rounded-full shadow-md 
                                 hover:bg-white hover:text-black transition">
                Recorrido
              </button>
            )}
          </a>
        </div>
      </div>

      {/* Botón escritorio */}
      <div className="hidden md:flex absolute bottom-6 right-6 z-10">
        <a href={`/cofradia/${rutaId}/recorrido`}>
          {estaEnCalle ? (
            <button className="flex items-center gap-3 bg-white bg-opacity-80 text-black font-semibold 
                               px-6 py-3 text-base rounded-full shadow-md 
                               hover:bg-opacity-100 transition cursor-pointer">
              ¡Síguela en directo!
              <span className="relative flex h-4 w-4">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-600 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-4 w-4 bg-red-600"></span>
              </span>
            </button>
          ) : (
            <button className="flex items-center gap-3 bg-transparent border border-white text-white font-semibold 
                               px-6 py-3 text-base rounded-full shadow-md 
                               hover:bg-white hover:text-black transition cursor-pointer">
              Recorrido
            </button>
          )}
        </a>
      </div>
    </section>
  );
}
