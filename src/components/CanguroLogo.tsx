import React from 'react';

interface CanguroLogoProps {
  className?: string;
  size?: number;
  showText?: boolean;
  theme?: 'dark' | 'light' | 'gold';
}

export function CanguroLogo({ className = '', size = 36, showText = true }: CanguroLogoProps) {
  return (
    <div className={`inline-flex items-center gap-2.5 ${className}`}>
      {/* Logo corporativo con etiqueta img */}
      <img
        src="https://tse2.mm.bing.net/th/id/OIP.UF7bUs4Oi_q7hPtzFxbl_gHaHa?r=0&rs=1&pid=ImgDetMain&o=7&rm=3"
        alt="Logo Gestión del Desempeño"
        className="object-contain rounded-lg shrink-0 transition-transform duration-200 hover:scale-105 shadow-xs"
        style={{ width: `${size}px`, height: `${size}px` }}
      />

      {showText && (
        <div className="flex flex-col leading-tight select-none">
          <span className="font-black text-sm tracking-wide text-[#F1B400] uppercase font-sans">
            Gestión del Desempeño
          </span>
        </div>
      )}
    </div>
  );
}
