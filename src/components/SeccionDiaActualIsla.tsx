import { useEffect, useState } from 'react';
import SeccionDiaActual from './SeccionDiaActual';

interface Procesion {
  nombre: string;
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

  useEffect(() => {
    const ahora = new Date();
    const diaActualIndex = 0;
    const horas = ahora.getHours();
    const minutos = ahora.getMinutes();
    const minutosActuales = horas * 60 + minutos;

    let procesionesCandidatas: (Procesion & { index: number })[] = [];

    const diaActual = dias[diaActualIndex];
    procesionesCandidatas.push(...diaActual.procesiones.map(p => ({ ...p, index: diaActualIndex })));

    if (diaActualIndex > 0) {
      const diaAnterior = dias[diaActualIndex - 1];
      const procesionesEnCurso = diaAnterior.procesiones.filter(p => {
        const [horaLlegada, minLlegada] = p.horaLlegada.split(":").map(Number);
        const llegadaMin = horaLlegada * 60 + minLlegada;
        return llegadaMin < 6 * 60 && minutosActuales <= llegadaMin;
      }).map(p => ({ ...p, index: diaActualIndex - 1 }));

      procesionesCandidatas.push(...procesionesEnCurso);
    }

    let indexProcesion = 0;
    let minDiferencia = Infinity;
    let diaIndexFinal = diaActualIndex;

    procesionesCandidatas.forEach((p, i) => {
      const [hora, min] = p.horaSalida.split(":").map(Number);
      const salidaMin = hora * 60 + min;
      const diferencia = Math.abs(salidaMin - minutosActuales);

      if (diferencia < minDiferencia) {
        minDiferencia = diferencia;
        indexProcesion = i;
        diaIndexFinal = p.index;
      }
    });

    const primera = procesionesCandidatas[indexProcesion];
    let enCalle = false;

    if (primera) {
      const [horaSalida, minSalida] = primera.horaSalida.split(":").map(Number);
      const [horaLlegada, minLlegada] = primera.horaLlegada.split(":").map(Number);
      const salidaMin = horaSalida * 60 + minSalida - 30;
      const llegadaMin = horaLlegada * 60 + minLlegada + 30;
      const llegadaAjustada = llegadaMin < salidaMin ? llegadaMin + 1440 : llegadaMin;
      const minutosActualesAjustados = minutosActuales < salidaMin ? minutosActuales + 1440 : minutosActuales;

      enCalle = minutosActualesAjustados >= salidaMin && minutosActualesAjustados <= llegadaAjustada;
    }

    setProcesion(primera ?? null);
    setDiseno(disenoDias[diaIndexFinal] ?? null);
    setEstaEnCalle(enCalle);
  }, []);

  if (!procesion || !diseno) return null;

  return (
    <SeccionDiaActual
      titulo={diseno.nombre}
      imagenNormal={procesion.imagenCaratula}
      imagenExtendida={procesion.imagenExtendida}
      posicionImagen={procesion.posicionImagen}
      hermandad={procesion.nombre}
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
