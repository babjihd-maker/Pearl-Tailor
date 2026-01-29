'use client';

interface GarmentPreviewProps {
  type: 'Shirt' | 'Pant' | 'Suit' | 'Kurta';
  color: string;
  textureUrl?: string | null;
}

export default function GarmentPreview({ type, color, textureUrl }: GarmentPreviewProps) {
  
  const patternId = "realFabricPattern";
  
  // LOGIC CHANGE: If texture exists, show it. Otherwise use color.
  const fillStyle = textureUrl ? `url(#${patternId})` : color;
  const strokeColor = "#333";

  const renderShape = () => {
    switch (type) {
      case 'Pant':
        return (
          <g>
            <rect x="100" y="20" width="100" height="20" fill={fillStyle} stroke={strokeColor} strokeWidth="2" />
            <path d="M100,40 L90,280 L145,280 L150,80 L100,40 Z" fill={fillStyle} stroke={strokeColor} strokeWidth="2" />
            <path d="M200,40 L210,280 L155,280 L150,80 L200,40 Z" fill={fillStyle} stroke={strokeColor} strokeWidth="2" />
            <path d="M150,40 L150,120" stroke={strokeColor} strokeWidth="1" />
          </g>
        );

      case 'Kurta':
        return (
          <g>
            <path d="M80,50 L60,280 L240,280 L220,50 L200,30 L100,30 Z" fill={fillStyle} stroke={strokeColor} strokeWidth="2" />
            <path d="M80,50 L20,180 L50,190 L80,80" fill={fillStyle} stroke={strokeColor} strokeWidth="2" />
            <path d="M220,50 L280,180 L250,190 L220,80" fill={fillStyle} stroke={strokeColor} strokeWidth="2" />
            <path d="M100,30 Q150,60 200,30" fill="none" stroke={strokeColor} strokeWidth="2" />
            <line x1="150" y1="30" x2="150" y2="150" stroke={strokeColor} strokeWidth="1" strokeDasharray="4 2" />
          </g>
        );

      case 'Suit':
        return (
          <g>
             <path d="M110,200 L100,290 L145,290 L145,200 Z" fill={fillStyle} stroke={strokeColor} />
             <path d="M190,200 L200,290 L155,290 L155,200 Z" fill={fillStyle} stroke={strokeColor} />
             <path d="M70,50 L70,220 L150,240 L230,220 L230,50 L190,20 L110,20 Z" fill={fillStyle} stroke={strokeColor} strokeWidth="2" />
             <path d="M70,50 L30,200 L60,210 L80,100" fill={fillStyle} stroke={strokeColor} strokeWidth="2" />
             <path d="M230,50 L270,200 L240,210 L220,100" fill={fillStyle} stroke={strokeColor} strokeWidth="2" />
             <path d="M110,20 L150,150 L190,20 L150,40 Z" fill={color === '#ffffff' ? '#eee' : color} filter="brightness(0.8)" stroke={strokeColor} />
          </g>
        );

      case 'Shirt':
      default:
        return (
          <g>
            <path d="M60,80 L60,280 L240,280 L240,80 L200,50 L100,50 Z" fill={fillStyle} stroke={strokeColor} strokeWidth="2" />
            <path d="M60,80 L10,200 L40,210 L80,100 Z" fill={fillStyle} stroke={strokeColor} strokeWidth="2" />
            <path d="M240,80 L290,200 L260,210 L220,100 Z" fill={fillStyle} stroke={strokeColor} strokeWidth="2" />
            <path d="M100,50 L150,80 L200,50 L220,20 L150,40 L80,20 Z" fill={textureUrl ? fillStyle : '#fff'} stroke={strokeColor} strokeWidth="2" />
          </g>
        );
    }
  };

  return (
    <div className="relative w-full h-[400px] flex items-center justify-center bg-gray-50 rounded-lg border border-gray-200 overflow-hidden">
       {/* Note: viewBox is 300x300 */}
       <svg viewBox="0 0 300 300" className="w-full h-full drop-shadow-xl p-4">
        
        <defs>
            {textureUrl && (
                // UPDATED HERE: 
                // We set width/height to 300 to match the viewBox.
                // This makes the image cover the WHOLE SVG, not just a small tile.
                <pattern id={patternId} patternUnits="userSpaceOnUse" width="300" height="300">
                    <image 
                      href={textureUrl} 
                      x="0" 
                      y="0" 
                      width="300" 
                      height="300" 
                      preserveAspectRatio="xMidYMid slice" 
                    />
                </pattern>
            )}
        </defs>

        {renderShape()}

      </svg>
      
      {textureUrl && <div className="absolute top-2 right-2 text-[10px] bg-black text-white px-2 py-0.5 rounded opacity-50">REAL FABRIC MODE</div>}
      <div className="absolute bottom-2 left-2 text-xs font-bold text-gray-400 uppercase tracking-widest">{type} PREVIEW</div>
    </div>
  );
}