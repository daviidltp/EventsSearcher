interface Props {
    estado?: string;
    estaEnCalle: boolean;
  }
  
  export default function BotonEstado({ estado = 'OK', estaEnCalle }: Props) {
    if (estado === 'Cancelada por lluvia') {
      return (
        <button className="flex items-center gap-3 bg-red-500 text-white font-semibold 
                           px-6 py-3 text-base rounded-full shadow-md 
                           hover:bg-opacity-100 transition cursor-pointer">
          Cancelada por lluvia
        </button>
      );
    }
  
    return (estaEnCalle)? (
      <button className="flex items-center gap-2 bg-white bg-opacity-80 text-black font-semibold 
                         px-4 py-3 text-base rounded-full shadow-md 
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
    );
  }
  