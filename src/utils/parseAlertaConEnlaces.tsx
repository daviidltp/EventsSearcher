import React from "react";

export function parseAlertaConEnlaces(texto: string): React.ReactNode[] {
  const partes = texto.split(/(https?:\/\/[^\s]+)/g);

  return partes.map((parte, i) => {
    if (parte.match(/^https?:\/\/[^\s]+$/)) {
      return (
        <a
          key={i}
          href={parte}
          target="_blank"
          rel="noopener noreferrer"
          className="underline font-semibold hover:text-blue-700 transition"
        >
          {parte}
        </a>
      );
    }
    return parte;
  });
}
