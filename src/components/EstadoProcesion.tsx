// components/EstadoProcesion.tsx
import { useEffect, useState } from 'react';

interface Props {
  horaSalida: string;
  horaLlegada: string;
}

const EstadoProcesion = ({ horaSalida, horaLlegada }: Props) => {
  const [enCalle, setEnCalle] = useState(false);

  const calcularMinutos = (hora: string) => {
    const [h, m] = hora.split(':').map(Number);
    return h * 60 + m;
  };

  useEffect(() => {
    const ahora = new Date();
    const minutosActuales = ahora.getHours() * 60 + ahora.getMinutes();

    const salida = calcularMinutos(horaSalida) - 30;
    let llegada = calcularMinutos(horaLlegada) + 30;

    if (llegada < salida) llegada += 1440;
    const actual = minutosActuales < salida ? minutosActuales + 1440 : minutosActuales;

    setEnCalle(actual >= salida && actual <= llegada);
  }, [horaSalida, horaLlegada]);

  return (
    <div className="mt-4 text-white text-xl font-semibold">
      Estado: {enCalle ? 'En la calle 🚶' : 'No está en la calle 🏠'}
    </div>
  );
};

export default EstadoProcesion;
