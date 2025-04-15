import { useEffect, useState } from 'react';
import SeccionDiaActual from './SeccionDiaActual';

interface Props {
  procesion: any;
  diseno: any;
  diaIndex: number;
}

export default function SeccionDiaActualSmart({ procesion, diseno, diaIndex }: Props) {
  const [estado, setEstado] = useState<string>('OK');
  const [alerta, setAlerta] = useState<string | undefined>(undefined);
  const [estaEnCalle, setEstaEnCalle] = useState(false);

  useEffect(() => {
    const ahora = new Date();

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

    const fechaBase = fechasPorDia[diaIndex];
    if (!fechaBase) return;

    const [hSalida, mSalida] = procesion.horaSalida.split(':').map(Number);
    const [hLlegada, mLlegada] = procesion.horaLlegada.split(':').map(Number);

    const fechaSalida = new Date(fechaBase);
    const fechaLlegada = new Date(fechaBase);

    if (hSalida === 0 && mSalida === 0) {
      fechaSalida.setDate(fechaSalida.getDate() + 1);
      fechaLlegada.setDate(fechaLlegada.getDate() + 1);
    }

    fechaSalida.setHours(hSalida, mSalida);
    fechaLlegada.setHours(hLlegada, mLlegada);

    const margenAntes = new Date(fechaSalida);
    margenAntes.setMinutes(margenAntes.getMinutes() - 5);
    const margenDespues = new Date(fechaLlegada);
    margenDespues.setMinutes(margenDespues.getMinutes() + 30);

    setEstaEnCalle(ahora >= margenAntes && ahora <= margenDespues);

    // Obtener estado y alerta desde API
    fetch(`https://owntracks-api.semanasantatracker.workers.dev/procesiones?id=${procesion.id}`)
      .then((res) => res.json())
      .then((data) => {
        const p = data.find((d: any) => d.id === procesion.id);
        if (p) {
          setEstado(p.estado);
          setAlerta(p.alerta);
        }
      })
      .catch((err) => console.error('Error al cargar estado:', err));
  }, [procesion, diaIndex]);

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
      rutaId={procesion.id}
      estado={estado}
      alerta={alerta}
    />
  );
}
