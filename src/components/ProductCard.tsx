import React from 'react';
import { Product } from '../types';
import { Eye, Download } from 'lucide-react';
import { motion } from 'motion/react';

interface ProductCardProps {
  key?: React.Key;
  product: Product;
  onSelect: (product: Product) => void;
  onOrderWhatsApp: (product: Product, e: React.MouseEvent) => void;
}

export function ProductCard({ product, onSelect, onOrderWhatsApp }: ProductCardProps) {
  const isFreeItem = product.isFree || product.price === 0;

  return (
    <motion.article
      layout
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      whileHover={{ y: -3 }}
      transition={{ duration: 0.2 }}
      onClick={() => onSelect(product)}
      className="group cursor-pointer bg-white rounded-xl border border-[#EBE4DA] hover:border-[#C48B8B]/50 transition-all duration-200 shadow-2xs hover:shadow-md flex flex-col overflow-hidden max-w-[260px] mx-auto w-full"
    >
      {/* Small delicate image container */}
      <div className="relative aspect-4/3 w-full bg-[#F5EFEB] overflow-hidden">
        <img
          src={product.photoUrl}
          alt={product.name}
          className="w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-105"
          referrerPolicy="no-referrer"
          loading="lazy"
        />

        {/* Category delicate tag with subtle dusty rose detail */}
        <div className="absolute top-2 left-2 flex flex-col gap-1">
          <span className="px-2 py-0.5 rounded-full text-[9px] font-medium uppercase tracking-wider bg-[#FAF7F2]/95 text-[#664646] backdrop-blur-xs border border-[#EEDCDC] shadow-2xs flex items-center gap-1">
            <span className="w-1 h-1 rounded-full bg-[#C48B8B]" />
            {product.category}
          </span>
          {isFreeItem && (
            <span className="px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider bg-[#FAF4F4] text-[#7A5050] border border-[#EEDCDC] shadow-2xs">
              Gratis
            </span>
          )}
        </div>

        {/* Hover quick preview pill */}
        <div className="absolute inset-0 bg-[#1C3B2B]/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
          <span className="px-2.5 py-1 bg-[#FAF7F2] text-[#664646] rounded-full text-[10px] font-semibold flex items-center gap-1 shadow-sm border border-[#EEDCDC]">
            <Eye className="w-3 h-3 text-[#C48B8B]" /> Ver detalles
          </span>
        </div>
      </div>

      {/* Product Content (compact & delicate) */}
      <div className="p-3 flex flex-col flex-1 justify-between gap-2.5 bg-white">
        <div>
          <h3 className="text-xs font-semibold text-[#1C3B2B] line-clamp-2 leading-tight tracking-tight group-hover:text-[#2B523E] transition-colors">
            {product.name}
          </h3>

          <p className="text-[11px] text-[#6B726C] line-clamp-2 mt-1 leading-snug">
            {product.description}
          </p>
        </div>

        {/* Price & Action Button */}
        <div className="pt-2 border-t border-[#F5EFEB] flex items-center justify-between">
          {isFreeItem ? (
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-bold text-[#1C3B2B] uppercase tracking-wider">
                Gratis
              </span>
              <span className="text-[9px] font-medium text-[#7A5050] bg-[#FAF4F4] px-1.5 py-0.5 rounded border border-[#EEDCDC]">
                Freebie
              </span>
            </div>
          ) : (
            <div className="text-xs font-bold text-[#1C3B2B]">
              {product.price.toFixed(2)}{' '}
              <span className="text-[10px] font-normal text-[#6B726C]">{product.currency}</span>
            </div>
          )}

          {isFreeItem ? (
            <button
              onClick={(e) => {
                e.stopPropagation();
                if (product.downloadUrl) {
                  window.open(product.downloadUrl, '_blank', 'noopener,noreferrer');
                } else {
                  onSelect(product);
                }
              }}
              className="px-2.5 py-1.5 rounded-lg bg-[#2B523E] hover:bg-[#1C3B2B] text-[#FAF7F2] text-[11px] font-medium flex items-center gap-1.5 transition-colors shadow-2xs"
              title="Descargar gratis"
            >
              <Download className="w-3 h-3 text-[#FAF7F2]" />
              Descargar
            </button>
          ) : (
            <button
              onClick={(e) => onOrderWhatsApp(product, e)}
              className="px-2.5 py-1.5 rounded-lg bg-[#1C3B2B] hover:bg-[#152D1F] text-[#FAF7F2] text-[11px] font-medium flex items-center gap-1.5 transition-colors shadow-2xs"
              title="Consultar y comprar por WhatsApp"
            >
              <svg className="w-3 h-3 fill-current text-[#FAF7F2]" viewBox="0 0 24 24">
                <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z" />
              </svg>
              Comprar
            </button>
          )}
        </div>
      </div>
    </motion.article>
  );
}
