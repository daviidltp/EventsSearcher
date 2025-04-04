import { useEffect, useState } from 'react';

export default function ScreenWidth({ onChange }) {
  const [width, setWidth] = useState(window.innerWidth);

  useEffect(() => {
    const handleResize = () => {
      const newWidth = window.innerWidth;
      setWidth(newWidth);
      if (onChange) onChange(newWidth);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return <div style={{ display: 'none' }}>{width}</div>; // o muestra si quieres
}
