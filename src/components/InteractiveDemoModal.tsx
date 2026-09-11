import { useState } from 'react';
import { Product } from '../types';
import { X, ExternalLink, Calendar, CheckSquare, Sparkles, BookOpen, Layers } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface InteractiveDemoModalProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
  onOrderWhatsApp: (product: Product) => void;
}

export function InteractiveDemoModal({
  product,
  isOpen,
  onClose,
  onOrderWhatsApp,
}: InteractiveDemoModalProps) {
  const [activeTab, setActiveTab] = useState<'vista-mes' | 'vista-semana' | 'habitos' | 'stickers'>('vista-mes');

  if (!isOpen || !product) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto bg-black/40 backdrop-blur-xs">
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.96 }}
          transition={{ duration: 0.2 }}
          className="relative w-full max-w-4xl bg-[#FAF7F2] rounded-2xl shadow-2xl border border-[#E8E1D7] overflow-hidden flex flex-col max-h-[90vh]"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-[#E8E1D7] bg-[#F5EFEB]">
            <div className="flex items-center gap-3">
              <span className="p-2 rounded-lg bg-[#1C3B2B] text-[#FAF7F2]">
                <BookOpen className="w-4 h-4" />
              </span>
              <div>
                <h3 className="text-lg font-semibold text-[#1C3B2B] font-romantic">
                  Vista Previa Interactiva: {product.name}
                </h3>
                <p className="text-xs text-[#6B726C]">
                  Experimenta la navegación de la papelería digital antes de adquirirla
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-[#6B726C] hover:text-[#1C3B2B] hover:bg-[#E8E1D7]/50 rounded-full transition-colors"
              aria-label="Cerrar modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Interactive Planner Simulation Body */}
          <div className="p-6 overflow-y-auto flex-1 space-y-6">
            {/* Planner simulated device frame */}
            <div className="bg-white rounded-xl border border-[#E2DAD0] shadow-sm p-4 sm:p-6 relative">
              {/* Simulated Binder / Tabs header */}
              <div className="flex flex-wrap items-center justify-between gap-2 pb-4 mb-4 border-b border-[#F0EBE3]">
                <div className="flex items-center gap-1 sm:gap-2">
                  <button
                    onClick={() => setActiveTab('vista-mes')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                      activeTab === 'vista-mes'
                        ? 'bg-[#1C3B2B] text-[#FAF7F2]'
                        : 'bg-[#F5EFEB] text-[#4A524C] hover:bg-[#EAE2D8]'
                    }`}
                  >
                    <Calendar className="w-3.5 h-3.5 inline mr-1" />
                    Vista Mensual
                  </button>
                  <button
                    onClick={() => setActiveTab('vista-semana')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                      activeTab === 'vista-semana'
                        ? 'bg-[#1C3B2B] text-[#FAF7F2]'
                        : 'bg-[#F5EFEB] text-[#4A524C] hover:bg-[#EAE2D8]'
                    }`}
                  >
                    <Layers className="w-3.5 h-3.5 inline mr-1" />
                    Vista Semanal
                  </button>
                  <button
                    onClick={() => setActiveTab('habitos')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                      activeTab === 'habitos'
                        ? 'bg-[#1C3B2B] text-[#FAF7F2]'
                        : 'bg-[#F5EFEB] text-[#4A524C] hover:bg-[#EAE2D8]'
                    }`}
                  >
                    <CheckSquare className="w-3.5 h-3.5 inline mr-1" />
                    Tracker de Hábitos
                  </button>
                  <button
                    onClick={() => setActiveTab('stickers')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                      activeTab === 'stickers'
                        ? 'bg-[#1C3B2B] text-[#FAF7F2]'
                        : 'bg-[#F5EFEB] text-[#4A524C] hover:bg-[#EAE2D8]'
                    }`}
                  >
                    <Sparkles className="w-3.5 h-3.5 inline mr-1" />
                    Stickers de Muestra
                  </button>
                </div>
                <span className="text-[11px] text-[#8C948D] italic font-serif">
                  * Navegación por hipervínculos activa
                </span>
              </div>

              {/* Tab Contents */}
              {activeTab === 'vista-mes' && (
                <div className="space-y-4">
                  <div className="flex justify-between items-center bg-[#FAF7F2] p-3 rounded-lg border border-[#EFE8DE]">
                    <span className="text-xs uppercase tracking-widest text-[#6B726C] font-semibold">
                      Octubre · Enfoque y Calma
                    </span>
                    <span className="text-xs text-[#1C3B2B] font-serif italic">
                      Objetivo principal: Disfrutar del proceso creativo
                    </span>
                  </div>
                  <div className="grid grid-cols-7 gap-1.5 text-center text-xs">
                    {['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'].map((day) => (
                      <div key={day} className="font-semibold text-[#1C3B2B] py-1 bg-[#F5EFEB] rounded">
                        {day}
                      </div>
                    ))}
                    {Array.from({ length: 31 }).map((_, i) => (
                      <div
                        key={i}
                        className="h-14 p-1 rounded border border-[#F0EBE3] hover:border-[#1C3B2B]/40 hover:bg-[#FAF7F2] transition-colors text-left flex flex-col justify-between cursor-pointer group"
                      >
                        <span className="text-[10px] text-[#6B726C] font-medium group-hover:text-[#1C3B2B]">
                          {i + 1}
                        </span>
                        {i === 3 && (
                          <span className="text-[9px] bg-[#EBF0EC] text-[#1C3B2B] px-1 rounded truncate">
                            Lanzamiento ✨
                          </span>
                        )}
                        {i === 14 && (
                          <span className="text-[9px] bg-[#F7EFE6] text-[#7A5B38] px-1 rounded truncate">
                            Sesión fotos 📷
                          </span>
                        )}
                        {i === 22 && (
                          <span className="text-[9px] bg-[#EBF0EC] text-[#1C3B2B] px-1 rounded truncate">
                            Boda Sofi 🕊️
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeTab === 'vista-semana' && (
                <div className="space-y-3">
                  <div className="p-3 bg-[#FAF7F2] rounded-lg border border-[#EFE8DE] flex justify-between items-center">
                    <h4 className="text-sm font-semibold text-[#1C3B2B]">Semana 42 · Prioridades Clave</h4>
                    <span className="text-xs text-[#6B726C]">Plantilla con columnas horarias y notas</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="p-3 bg-white rounded-lg border border-[#EFE8DE] space-y-2">
                      <div className="text-xs font-semibold text-[#1C3B2B] border-b border-[#F0EBE3] pb-1">
                        Lunes 14
                      </div>
                      <p className="text-[11px] text-[#6B726C]">• 09:00 Planificación semanal</p>
                      <p className="text-[11px] text-[#6B726C]">• 11:30 Crear contenido redes</p>
                      <p className="text-[11px] text-[#6B726C]">• 16:00 Revisión de pedidos</p>
                    </div>
                    <div className="p-3 bg-white rounded-lg border border-[#EFE8DE] space-y-2">
                      <div className="text-xs font-semibold text-[#1C3B2B] border-b border-[#F0EBE3] pb-1">
                        Martes 15
                      </div>
                      <p className="text-[11px] text-[#6B726C]">• 10:00 Llamada con novios</p>
                      <p className="text-[11px] text-[#6B726C]">• 14:00 Ajustes de paleta de boda</p>
                      <p className="text-[11px] text-[#6B726C]">• 18:00 Yoga & meditación</p>
                    </div>
                    <div className="p-3 bg-white rounded-lg border border-[#EFE8DE] space-y-2">
                      <div className="text-xs font-semibold text-[#1C3B2B] border-b border-[#F0EBE3] pb-1">
                        Miércoles 16
                      </div>
                      <p className="text-[11px] text-[#6B726C]">• 09:30 Envío de muestras</p>
                      <p className="text-[11px] text-[#6B726C]">• 15:00 Tarde de diseño libre</p>
                      <p className="text-[11px] text-[#6B726C]">• 19:00 Lectura inspiradora</p>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'habitos' && (
                <div className="space-y-3">
                  <div className="p-3 bg-[#FAF7F2] rounded-lg border border-[#EFE8DE]">
                    <h4 className="text-xs font-semibold text-[#1C3B2B] uppercase tracking-wider">
                      Registro de Bienestar & Hábitos
                    </h4>
                  </div>
                  <div className="space-y-2">
                    {[
                      { name: '2 Litros de Agua', checks: [true, true, true, true, false, true, true] },
                      { name: '30 Minutos de Movimiento', checks: [true, false, true, true, true, false, true] },
                      { name: 'Lectura Consciente', checks: [true, true, true, false, true, true, true] },
                      { name: 'Sin Pantallas antes de dormir', checks: [false, true, true, true, false, true, true] },
                    ].map((habit, idx) => (
                      <div key={idx} className="flex items-center justify-between p-2 rounded-lg bg-[#FAF7F2]/60 border border-[#F0EBE3]">
                        <span className="text-xs text-[#242926] font-medium">{habit.name}</span>
                        <div className="flex gap-1.5">
                          {habit.checks.map((checked, i) => (
                            <span
                              key={i}
                              className={`w-6 h-6 rounded-md flex items-center justify-center text-[10px] ${
                                checked ? 'bg-[#1C3B2B] text-[#FAF7F2]' : 'bg-[#EAE2D8] text-[#8C948D]'
                              }`}
                            >
                              {checked ? '✓' : ''}
                            </span>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeTab === 'stickers' && (
                <div className="space-y-3">
                  <p className="text-xs text-[#6B726C]">
                    Muestra de algunos de los stickers botánicos y decorativos que acompañan el producto digital:
                  </p>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div className="p-3 bg-[#FAF7F2] rounded-lg border border-[#EFE8DE] flex flex-col items-center justify-center gap-1.5 text-center">
                      <span className="text-2xl">🌿</span>
                      <span className="text-[11px] font-medium text-[#1C3B2B]">Rama de Olivo</span>
                      <span className="text-[9px] text-[#8C948D]">PNG Transparente</span>
                    </div>
                    <div className="p-3 bg-[#FAF7F2] rounded-lg border border-[#EFE8DE] flex flex-col items-center justify-center gap-1.5 text-center">
                      <span className="text-2xl">🕯️</span>
                      <span className="text-[11px] font-medium text-[#1C3B2B]">Vela Aromática</span>
                      <span className="text-[9px] text-[#8C948D]">300 DPI</span>
                    </div>
                    <div className="p-3 bg-[#FAF7F2] rounded-lg border border-[#EFE8DE] flex flex-col items-center justify-center gap-1.5 text-center">
                      <span className="text-2xl">💌</span>
                      <span className="text-[11px] font-medium text-[#1C3B2B]">Sobre Vintage</span>
                      <span className="text-[9px] text-[#8C948D]">PNG Transparente</span>
                    </div>
                    <div className="p-3 bg-[#FAF7F2] rounded-lg border border-[#EFE8DE] flex flex-col items-center justify-center gap-1.5 text-center">
                      <span className="text-2xl">☕</span>
                      <span className="text-[11px] font-medium text-[#1C3B2B]">Taza Atelier</span>
                      <span className="text-[9px] text-[#8C948D]">Precortado</span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* External demo link if provided */}
            {product.demoUrl && (
              <div className="flex items-center justify-between p-3.5 bg-[#F5EFEB] rounded-xl border border-[#E8E1D7]">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-[#1C3B2B] animate-pulse" />
                  <span className="text-xs text-[#242926]">
                    Enlace de demostración externo configurado por el vendedor:
                  </span>
                </div>
                <a
                  href={product.demoUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-xs font-semibold text-[#1C3B2B] hover:underline"
                >
                  Abrir demo externa <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            )}
          </div>

          {/* Footer with WhatsApp Purchase trigger */}
          <div className="px-6 py-4 border-t border-[#E8E1D7] bg-[#F5EFEB] flex flex-wrap items-center justify-between gap-3">
            <div>
              <span className="text-xs text-[#6B726C]">Precio:</span>
              <div className="text-lg font-bold text-[#1C3B2B]">
                {product.price.toFixed(2)} {product.currency}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={onClose}
                className="px-4 py-2 text-xs font-medium text-[#6B726C] hover:text-[#1C3B2B] rounded-lg transition-colors"
              >
                Volver al catálogo
              </button>
              <button
                onClick={() => {
                  onClose();
                  onOrderWhatsApp(product);
                }}
                className="px-5 py-2.5 bg-[#1C3B2B] text-[#FAF7F2] hover:bg-[#152D1F] rounded-lg text-xs font-semibold shadow-sm transition-all flex items-center gap-2"
              >
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                  <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z" />
                </svg>
                Gestionar Compra por WhatsApp
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
