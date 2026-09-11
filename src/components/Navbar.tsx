import { useState } from 'react';
import { Search } from 'lucide-react';
import { OricciaLogo } from './OricciaLogo';

interface NavbarProps {
  searchQuery: string;
  onSearchChange: (q: string) => void;
  whatsappNumber: string;
  logoUrl?: string;
}

export function Navbar({
  searchQuery,
  onSearchChange,
  whatsappNumber,
  logoUrl,
}: NavbarProps) {
  const [imgLoadError, setImgLoadError] = useState(false);
  const cleanPhone = whatsappNumber.replace(/[^0-9]/g, '');

  // Priority: custom uploaded logoUrl, or direct public asset image, otherwise vector SVG
  const displayImageSrc = !imgLoadError && (logoUrl || '/assets/images/logo.png' || '/logo.png');

  return (
    <header className="sticky top-0 z-40 bg-[#FAF7F2]/95 backdrop-blur-md border-b border-[#EBE4DA] transition-all">
      {/* Top micro-bar with promotional banner for free items */}
      <div className="bg-[#FAF4F2] border-b border-[#EEDCDC]/70 px-4 py-1.5 text-center">
        <p className="text-[11px] sm:text-xs font-medium text-[#6B4646] tracking-wide flex items-center justify-center gap-2">
          <span>¡Es tu momento! Aprovecha y descarga los artículos gratuitos antes de que desaparezcan 😉</span>
        </p>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20 gap-4">
          {/* Brand Logo - Displays exact user image if provided, with seamless vector fallback */}
          <div className="flex flex-col">
            <a href="#" className="group flex items-center py-0.5 transition-transform duration-200 hover:scale-[1.02]">
              {displayImageSrc ? (
                <img
                  src={displayImageSrc}
                  alt="Oriccia"
                  className="h-8 sm:h-10 w-auto max-w-[220px] object-contain"
                  onError={() => setImgLoadError(true)}
                  referrerPolicy="no-referrer"
                />
              ) : (
                <OricciaLogo className="h-8 sm:h-9 w-auto" />
              )}
            </a>
            <span className="text-[10px] uppercase tracking-[0.2em] text-[#8C948D] -mt-0.5 font-medium">
              Atelier & Papeterie Digitale
            </span>
          </div>

          {/* Search bar */}
          <div className="hidden md:flex items-center flex-1 max-w-xs relative">
            <Search className="w-3.5 h-3.5 absolute left-3 text-[#8C948D] pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Buscar agendas, plantillas, planners..."
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-white/80 border border-[#E8E1D7] rounded-full focus:outline-none focus:border-[#C48B8B] focus:bg-white text-[#242926] placeholder-[#8C948D] transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => onSearchChange('')}
                className="absolute right-3 text-[10px] text-[#8C948D] hover:text-[#C48B8B]"
              >
                Limpiar
              </button>
            )}
          </div>

          {/* Right action: WhatsApp contact */}
          <div className="flex items-center gap-3">
            <a
              href={`https://wa.me/${cleanPhone}?text=${encodeURIComponent('¡Hola Oriccia! Quisiera hacer una consulta sobre el catálogo digital.')}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-medium text-[#1C3B2B] bg-white border border-[#E2DAD0] hover:bg-[#FAF4F2] hover:border-[#C48B8B]/40 transition-all shadow-2xs"
            >
              <svg className="w-3.5 h-3.5 fill-current text-[#1C3B2B]" viewBox="0 0 24 24">
                <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z" />
              </svg>
              <span>Consultar WhatsApp</span>
            </a>
          </div>
        </div>

        {/* Mobile search bar */}
        <div className="pb-3 md:hidden">
          <div className="relative w-full">
            <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-[#8C948D] pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Buscar en el catálogo de Oriccia..."
              className="w-full pl-9 pr-3 py-2 text-xs bg-white border border-[#E8E1D7] rounded-lg focus:outline-none focus:border-[#1C3B2B] text-[#242926] placeholder-[#8C948D]"
            />
          </div>
        </div>
      </div>
    </header>
  );
}
