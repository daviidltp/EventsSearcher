---
// components/EstadoProcesionWrapper.astro
import { useState, useEffect } from 'react';
import SeccionDiaActual from './SeccionDiaActual';

interface Props {
  horaSalida: string;
  horaLlegada: string;
  titulo: string;
  imagenNormal: string;
  imagenExtendida: string;
  posicionImagen: string;
  hermandad: string;
  iglesia: string;
  posicionTexto: string;
  colorTexto: string;
}

const {
  horaSalida,
  horaLlegada,
  titulo,
  imagenNormal,
  imagenExtendida,
  posicionImagen,
  hermandad,
  iglesia,
  posicionTexto,
  colorTexto
} = Astro.props;

function calcularMinutos(hora: string): number {
  const [h, m] = hora.split(':').map(Number);
  return h * 60 + m;
}

function procesionEstaEnCalle(salida: string, llegada: string): boolean {
  const ahora = new Date();
  const minutosActuales = ahora.getHours() * 60 + ahora.getMinutes();

  let salidaMin = calcularMinutos(salida) - 30;
  let llegadaMin = calcularMinutos(llegada) + 30;

  if (llegadaMin < salidaMin) llegadaMin += 1440;
  const actual = minutosActuales < salidaMin ? minutosActuales + 1440 : minutosActuales;

  return actual >= salidaMin && actual <= llegadaMin;
}

const [estaEnCalle, setEstaEnCalle] = useState(false);

useEffect(() => {
  setEstaEnCalle(procesionEstaEnCalle(horaSalida, horaLlegada));
  const interval = setInterval(() => {
    setEstaEnCalle(procesionEstaEnCalle(horaSalida, horaLlegada));
  }, 60 * 1000);
  return () => clearInterval(interval);
}, [horaSalida, horaLlegada]);
---

<SeccionDiaActual
  titulo={titulo}
  imagenNormal={imagenNormal}
  imagenExtendida={imagenExtendida}
  posicionImagen={posicionImagen}
  hermandad={hermandad}
  iglesia={iglesia}
  horaSalida={horaSalida}
  horaLlegada={horaLlegada}
  posicionTexto={posicionTexto}
  colorTexto={colorTexto}
  estaEnCalle={estaEnCalle}
/>
