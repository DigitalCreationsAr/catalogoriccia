import React, { useState } from 'react';
import { Product } from '../types';
import { X, Check, Tag, Calendar, Eye, Sparkles, Download, Gift } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface ProductDetailModalProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
  onOrderWhatsApp: (product: Product) => void;
  onOpenDemo: (product: Product) => void;
}

export function ProductDetailModal({
  product,
  isOpen,
  onClose,
  onOrderWhatsApp,
  onOpenDemo,
}: ProductDetailModalProps) {
  const [selectedImage, setSelectedImage] = useState<string>('');

  if (!isOpen || !product) return null;

  const isFreeItem = product.isFree || product.price === 0;
  const currentImage = selectedImage || product.photoUrl;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto bg-black/45 backdrop-blur-xs">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          transition={{ duration: 0.22, ease: 'easeOut' }}
          className="relative w-full max-w-3xl bg-[#FAF7F2] rounded-2xl shadow-2xl border border-[#E8E1D7] overflow-hidden flex flex-col max-h-[92vh]"
        >
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 z-10 p-2 bg-[#FAF7F2]/80 hover:bg-white text-[#2C332D] rounded-full shadow-xs border border-[#E8E1D7] transition-all"
            aria-label="Cerrar ventana"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="overflow-y-auto p-6 sm:p-8 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 items-start">
              {/* Product Visuals */}
              <div className="space-y-3">
                <div className="relative aspect-4/3 sm:aspect-square w-full rounded-xl overflow-hidden bg-[#F5EFEB] border border-[#E8E1D7]">
                  <img
                    src={currentImage}
                    alt={product.name}
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
                    <span className="px-2.5 py-1 rounded-full text-[10px] font-medium tracking-wide uppercase bg-[#FAF7F2]/95 text-[#664646] border border-[#EEDCDC] shadow-xs flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#C48B8B]" />
                      {product.category}
                    </span>
                    {isFreeItem && (
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-bold tracking-wide uppercase bg-[#FAF4F4] text-[#7A5050] border border-[#EEDCDC] shadow-xs flex items-center gap-1">
                        <Gift className="w-3 h-3 text-[#7A5050]" />
                        Gratis
                      </span>
                    )}
                  </div>
                </div>

                {/* Thumbnails if gallery exists */}
                {product.gallery && product.gallery.length > 1 && (
                  <div className="flex gap-2 overflow-x-auto pb-1">
                    {product.gallery.map((img, idx) => (
                      <button
                        key={idx}
                        onClick={() => setSelectedImage(img)}
                        className={`relative w-14 h-14 rounded-lg overflow-hidden border shrink-0 transition-all ${
                          currentImage === img
                            ? 'border-[#1C3B2B] ring-1 ring-[#1C3B2B]'
                            : 'border-[#E8E1D7] opacity-70 hover:opacity-100'
                        }`}
                      >
                        <img
                          src={img}
                          alt={`${product.name} miniatura ${idx + 1}`}
                          className="w-full h-full object-cover"
                          referrerPolicy="no-referrer"
                        />
                      </button>
                    ))}
                  </div>
                )}

                {/* Interactive Demo Button */}
                {product.demoUrl && (
                  <button
                    onClick={() => onOpenDemo(product)}
                    className="w-full py-2.5 px-4 rounded-xl border border-[#1C3B2B]/20 bg-white hover:bg-[#F5EFEB] text-[#1C3B2B] text-xs font-semibold flex items-center justify-center gap-2 transition-all shadow-2xs"
                  >
                    <Eye className="w-4 h-4 text-[#1C3B2B]" />
                    Probar Navegación y Demo Interactivo
                  </button>
                )}
              </div>

              {/* Product Info */}
              <div className="space-y-5">
                <div>
                  {product.category?.trim().toLowerCase() === 'invitaciones digitales' && product.eventType && (
                    <div className="flex items-center gap-2 text-xs text-[#6B726C] mb-1.5">
                      <Calendar className="w-3.5 h-3.5 text-[#C48B8B]" />
                      <span>Tipo de evento:</span>
                      <strong className="text-[#7A5050] font-medium bg-[#FAF4F4] px-2 py-0.5 rounded-full border border-[#EEDCDC]">
                        {product.eventType}
                      </strong>
                    </div>
                  )}
                  <h2 className="text-2xl sm:text-3xl font-normal text-[#1C3B2B] font-romantic tracking-tight">
                    {product.name}
                  </h2>
                  <div className="mt-2 flex items-baseline gap-2">
                    {isFreeItem ? (
                      <>
                        <span className="text-2xl font-bold text-[#1C3B2B] uppercase tracking-wider">
                          Gratis
                        </span>
                        <span className="text-xs font-semibold tracking-wider text-[#7A5050] uppercase bg-[#FAF4F4] px-2 py-0.5 rounded border border-[#EEDCDC]">
                          Freebie
                        </span>
                        <span className="text-[11px] text-[#8C948D] ml-1 italic font-serif">
                          · Sin costo / Descarga directa
                        </span>
                      </>
                    ) : (
                      <>
                        <span className="text-2xl font-bold text-[#1C3B2B]">
                          {product.price.toFixed(2)}
                        </span>
                        <span className="text-xs font-semibold tracking-wider text-[#7A5050] uppercase">
                          {product.currency}
                        </span>
                        <span className="text-[11px] text-[#8C948D] ml-1 italic font-serif">
                          · Descarga inmediata digital
                        </span>
                      </>
                    )}
                  </div>
                </div>

                {/* Description */}
                <div className="space-y-1.5 text-xs sm:text-sm text-[#4A524C] leading-relaxed">
                  <p>{product.description}</p>
                </div>

                {/* Features (Funciones) */}
                {product.features && product.features.length > 0 && (
                  <div className="space-y-2 pt-2 border-t border-[#E8E1D7]">
                    <h3 className="text-xs font-semibold text-[#1C3B2B] uppercase tracking-wider flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-[#C48B8B]" />
                      Funciones y Especificaciones:
                    </h3>
                    <ul className="space-y-1.5 text-xs text-[#3E4540]">
                      {product.features.map((feat, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <span className="w-4 h-4 rounded-full bg-[#FAF4F4] text-[#B87D7D] border border-[#EEDCDC] flex items-center justify-center shrink-0 mt-0.5">
                            <Check className="w-2.5 h-2.5 stroke-[3]" />
                          </span>
                          <span>{feat}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Tags (Etiquetas) */}
                {product.tags && product.tags.length > 0 && (
                  <div className="space-y-2 pt-2 border-t border-[#E8E1D7]">
                    <span className="text-[11px] text-[#6B726C] font-medium flex items-center gap-1">
                      <Tag className="w-3 h-3 text-[#C48B8B]" />
                      Etiquetas del producto:
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {product.tags.map((tag, i) => (
                        <span
                          key={i}
                          className="px-2 py-0.5 rounded-md text-[11px] bg-[#FAF6F6] border border-[#EEDCDC] text-[#664646] hover:border-[#C48B8B] transition-colors"
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Action: WhatsApp Button or Direct Download */}
                <div className="pt-4 border-t border-[#E8E1D7] space-y-2">
                  {isFreeItem ? (
                    <>
                      {product.downloadUrl ? (
                        <a
                          href={product.downloadUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="w-full py-3.5 px-6 rounded-xl bg-[#2B523E] text-[#FAF7F2] hover:bg-[#1C3B2B] transition-all duration-150 font-medium text-sm shadow-md hover:shadow-lg flex items-center justify-center gap-2.5 group"
                        >
                          <Download className="w-5 h-5 text-[#FAF7F2]" />
                          <span>Descargar Recurso Gratis Ahora</span>
                        </a>
                      ) : (
                        <button
                          onClick={() => onOrderWhatsApp(product)}
                          className="w-full py-3.5 px-6 rounded-xl bg-[#2B523E] text-[#FAF7F2] hover:bg-[#1C3B2B] transition-all duration-150 font-medium text-sm shadow-md hover:shadow-lg flex items-center justify-center gap-2.5 group"
                        >
                          <Download className="w-5 h-5 text-[#FAF7F2]" />
                          <span>Solicitar Descarga Gratuita</span>
                        </button>
                      )}
                      <p className="text-[11px] text-center text-[#8C948D]">
                        Recurso digital 100% gratuito cortesía de Oriccia
                      </p>
                    </>
                  ) : (
                    <>
                      <button
                        onClick={() => onOrderWhatsApp(product)}
                        className="w-full py-3.5 px-6 rounded-xl bg-[#1C3B2B] text-[#FAF7F2] hover:bg-[#152D1F] transition-all duration-150 font-medium text-sm shadow-md hover:shadow-lg flex items-center justify-center gap-2.5 group"
                      >
                        <svg className="w-5 h-5 fill-current text-[#FAF7F2]" viewBox="0 0 24 24">
                          <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z" />
                        </svg>
                        <span>Comprar directo vía WhatsApp</span>
                      </button>
                      <p className="text-[11px] text-center text-[#8C948D]">
                        Se abrirá WhatsApp con el mensaje del pedido listo para enviar a Oriccia
                      </p>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
